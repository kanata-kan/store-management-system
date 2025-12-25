/**
 * Finance Service
 *
 * Handles all financial calculations for the Finance Dashboard.
 * This service provides financial metrics aggregated from Sale collection only.
 *
 * ARCHITECTURAL PRINCIPLES:
 * - Sale entity is the SINGLE source of financial truth
 * - Invoice is a document, NOT a financial source (never used here)
 * - Always use MongoDB aggregation (no JavaScript loops)
 * - Always filter by status = "active" for financial calculations
 * - Always use snapshot.purchasePrice (never use Product.currentPrice)
 * - Never recalculate TVA (use stored tvaAmount)
 *
 * FINANCIAL FORMULAS:
 * - RevenueHT = Σ(quantity * sellingPriceHT) where status = "active"
 * - RevenueTTC = Σ(quantity * sellingPriceTTC) where status = "active"
 * - TVACollected = Σ(quantity * tvaAmount) where status = "active"
 * - CostHT = Σ(quantity * productSnapshot.purchasePrice) where status = "active"
 * - Profit = RevenueHT - CostHT (TVA is NEVER part of profit)
 * - ProfitMargin = (Profit / RevenueHT) * 100 (0 if RevenueHT = 0)
 */

import Sale from "../models/Sale.js";
import {
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  format,
  differenceInDays,
  differenceInMonths,
} from "date-fns";

class FinanceService {
  /**
   * Get comprehensive financial overview for a date range
   *
   * Calculates all key financial metrics using MongoDB aggregation pipeline.
   * Uses Sale collection as single source of truth.
   *
   * @param {Object} options - Date range options
   * @param {Date|string} [options.startDate] - Start date (default: beginning of current day)
   * @param {Date|string} [options.endDate] - End date (default: end of current day)
   * @returns {Promise<Object>} Financial overview with revenue, cost, profit, and margins
   *
   * @example
   * // Get today's financial overview
   * const overview = await FinanceService.getFinancialOverview();
   *
   * @example
   * // Get financial overview for a date range
   * const overview = await FinanceService.getFinancialOverview({
   *   startDate: new Date('2024-01-01'),
   *   endDate: new Date('2024-01-31')
   * });
   */
  static async getFinancialOverview(options = {}) {
    const {
      startDate = startOfDay(new Date()),
      endDate = endOfDay(new Date()),
    } = options;

    // Normalize dates to Date objects
    const normalizedStartDate =
      startDate instanceof Date ? startDate : new Date(startDate);
    const normalizedEndDate =
      endDate instanceof Date ? endDate : new Date(endDate);

    // Ensure proper date boundaries (start of day, end of day)
    const queryStartDate = startOfDay(normalizedStartDate);
    const queryEndDate = endOfDay(normalizedEndDate);

    // Build MongoDB aggregation pipeline
    // Using aggregation ensures all calculations happen in database (no JS loops)
    const pipeline = [
      // STEP 1: Match active sales within date range
      // ⚠️ CRITICAL: Only include active sales for financial calculations
      // Cancelled/returned sales must NOT be included in revenue/profit
      {
        $match: {
          status: "active", // ⚠️ Only active sales
          createdAt: {
            $gte: queryStartDate,
            $lte: queryEndDate,
          },
        },
      },
      // STEP 2: Calculate financial metrics per sale
      // This stage computes the financial contribution of each sale
      {
        $project: {
          // RevenueHT = quantity * sellingPriceHT (per sale)
          revenueHT: {
            $multiply: [
              "$quantity",
              { $ifNull: ["$sellingPriceHT", 0] }, // Default to 0 if missing
            ],
          },
          // RevenueTTC = quantity * sellingPriceTTC (per sale)
          revenueTTC: {
            $multiply: [
              "$quantity",
              {
                $ifNull: [
                  "$sellingPriceTTC",
                  { $ifNull: ["$sellingPriceHT", 0] }, // Fallback to HT if TTC missing
                ],
              },
            ],
          },
          // TVACollected = quantity * tvaAmount (per sale)
          // ⚠️ Use stored tvaAmount (never recalculate)
          tvaCollected: {
            $multiply: [
              "$quantity",
              { $ifNull: ["$tvaAmount", 0] }, // Default to 0 if missing
            ],
          },
          // CostHT = quantity * productSnapshot.purchasePrice (per sale)
          // ⚠️ Use snapshot.purchasePrice (never use Product.currentPrice)
          costHT: {
            $multiply: [
              "$quantity",
              {
                $ifNull: [
                  "$productSnapshot.purchasePrice",
                  0, // Treat missing purchasePrice as 0 (edge case handling)
                ],
              },
            ],
          },
        },
      },
      // STEP 3: Aggregate all sales to get totals
      {
        $group: {
          _id: null, // Single group (all sales)
          // Sum all revenueHT values
          revenueHT: {
            $sum: "$revenueHT",
          },
          // Sum all revenueTTC values
          revenueTTC: {
            $sum: "$revenueTTC",
          },
          // Sum all tvaCollected values
          tvaCollected: {
            $sum: "$tvaCollected",
          },
          // Sum all costHT values
          costHT: {
            $sum: "$costHT",
          },
        },
      },
      // STEP 4: Calculate derived metrics (profit, profit margin)
      {
        $project: {
          _id: 0, // Exclude _id from output
          revenueHT: { $ifNull: ["$revenueHT", 0] }, // Ensure 0 if null
          revenueTTC: { $ifNull: ["$revenueTTC", 0] }, // Ensure 0 if null
          tvaCollected: { $ifNull: ["$tvaCollected", 0] }, // Ensure 0 if null
          costHT: { $ifNull: ["$costHT", 0] }, // Ensure 0 if null
          // Profit = RevenueHT - CostHT
          // ⚠️ TVA is NEVER part of profit (only HT matters)
          profit: {
            $subtract: [
              { $ifNull: ["$revenueHT", 0] },
              { $ifNull: ["$costHT", 0] },
            ],
          },
        },
      },
      // STEP 5: Calculate profit margin (handle division by zero)
      {
        $project: {
          revenueHT: 1,
          revenueTTC: 1,
          tvaCollected: 1,
          costHT: 1,
          profit: 1,
          // ProfitMargin = (Profit / RevenueHT) * 100
          // ⚠️ Handle division by zero: if RevenueHT = 0, profitMargin = 0
          profitMargin: {
            $cond: {
              if: { $gt: [{ $ifNull: ["$revenueHT", 0] }, 0] }, // If RevenueHT > 0
              then: {
                $multiply: [
                  {
                    $divide: [
                      "$profit",
                      "$revenueHT",
                    ],
                  },
                  100, // Convert to percentage
                ],
              },
              else: 0, // If RevenueHT = 0, profitMargin = 0 (avoid division by zero)
            },
          },
        },
      },
    ];

    // Execute aggregation pipeline
    const result = await Sale.aggregate(pipeline);

    // Handle edge case: No sales found
    // Aggregation returns empty array if no matches
    if (!result || result.length === 0) {
      return {
        revenueHT: 0,
        revenueTTC: 0,
        tvaCollected: 0,
        costHT: 0,
        profit: 0,
        profitMargin: 0,
      };
    }

    // Extract first (and only) result
    const financialData = result[0];

    // Return clean object with all metrics
    // Round profitMargin to 2 decimal places for readability
    return {
      revenueHT: financialData.revenueHT || 0,
      revenueTTC: financialData.revenueTTC || 0,
      tvaCollected: financialData.tvaCollected || 0,
      costHT: financialData.costHT || 0,
      profit: financialData.profit || 0,
      profitMargin: Math.round((financialData.profitMargin || 0) * 100) / 100, // Round to 2 decimals
    };
  }

  /**
   * Get TVA monitoring statistics for a date range
   *
   * Calculates TVA-related metrics using MongoDB aggregation pipeline.
   * Uses Sale collection as single source of truth.
   *
   * @param {Object} options - Date range options
   * @param {Date|string} [options.startDate] - Start date (default: beginning of current day)
   * @param {Date|string} [options.endDate] - End date (default: end of current day)
   * @returns {Promise<Object>} TVA monitoring statistics
   *
   * @example
   * const tvaStats = await FinanceService.getTVAMonitoring();
   */
  static async getTVAMonitoring(options = {}) {
    const {
      startDate = startOfDay(new Date()),
      endDate = endOfDay(new Date()),
    } = options;

    // Normalize dates to Date objects
    const normalizedStartDate =
      startDate instanceof Date ? startDate : new Date(startDate);
    const normalizedEndDate =
      endDate instanceof Date ? endDate : new Date(endDate);

    // Ensure proper date boundaries (start of day, end of day)
    const queryStartDate = startOfDay(normalizedStartDate);
    const queryEndDate = endOfDay(normalizedEndDate);

    // Build MongoDB aggregation pipeline for TVA monitoring
    const pipeline = [
      // STEP 1: Match active sales within date range
      {
        $match: {
          status: "active", // ⚠️ Only active sales
          createdAt: {
            $gte: queryStartDate,
            $lte: queryEndDate,
          },
        },
      },
      // STEP 2: Calculate TVA metrics per sale
      {
        $project: {
          // Check if sale has TVA (tvaAmount > 0)
          hasTVA: {
            $gt: [{ $ifNull: ["$tvaAmount", 0] }, 0],
          },
          // TVA rate (for breakdown)
          tvaRate: { $ifNull: ["$tvaRate", 0] },
          // TVA collected per sale
          tvaCollected: {
            $multiply: [
              "$quantity",
              { $ifNull: ["$tvaAmount", 0] },
            ],
          },
        },
      },
      // STEP 3: Aggregate all sales
      {
        $group: {
          _id: null, // Single group (all sales)
          // Total TVA collected
          totalTvaCollected: {
            $sum: "$tvaCollected",
          },
          // Count sales with TVA (hasTVA = true)
          salesWithTVA: {
            $sum: { $cond: ["$hasTVA", 1, 0] },
          },
          // Count sales without TVA (hasTVA = false)
          salesWithoutTVA: {
            $sum: { $cond: ["$hasTVA", 0, 1] },
          },
          // Total sales count
          totalSales: { $sum: 1 },
        },
      },
      // STEP 4: Get TVA breakdown by rate (separate aggregation)
    ];

    // Execute first aggregation for totals
    const totalsResult = await Sale.aggregate(pipeline);

    // Build pipeline for TVA rate breakdown
    const breakdownPipeline = [
      // STEP 1: Match active sales within date range
      {
        $match: {
          status: "active",
          createdAt: {
            $gte: queryStartDate,
            $lte: queryEndDate,
          },
        },
      },
      // STEP 2: Group by TVA rate
      {
        $group: {
          _id: {
            $ifNull: ["$tvaRate", 0], // Group by TVA rate
          },
          // Count of sales with this rate
          count: { $sum: 1 },
          // Total TVA collected for this rate
          tvaCollected: {
            $sum: {
              $multiply: [
                "$quantity",
                { $ifNull: ["$tvaAmount", 0] },
              ],
            },
          },
        },
      },
      // STEP 3: Sort by rate (ascending)
      {
        $sort: { _id: 1 },
      },
      // STEP 4: Format output
      {
        $project: {
          _id: 0,
          rate: {
            $multiply: ["$_id", 100], // Convert to percentage (0.2 -> 20)
          },
          count: 1,
          tvaCollected: 1,
        },
      },
    ];

    // Execute breakdown aggregation
    const breakdownResult = await Sale.aggregate(breakdownPipeline);

    // Handle edge case: No sales found
    if (!totalsResult || totalsResult.length === 0) {
      return {
        totalTvaCollected: 0,
        salesWithTVA: 0,
        salesWithoutTVA: 0,
        totalSales: 0,
        breakdownByRate: [],
      };
    }

    const totals = totalsResult[0];

    // Format breakdown by rate
    const breakdownByRate = (breakdownResult || []).map((item) => ({
      rate: Math.round(item.rate * 100) / 100, // Round to 2 decimals
      count: item.count || 0,
      tvaCollected: item.tvaCollected || 0,
    }));

    return {
      totalTvaCollected: totals.totalTvaCollected || 0,
      salesWithTVA: totals.salesWithTVA || 0,
      salesWithoutTVA: totals.salesWithoutTVA || 0,
      totalSales: totals.totalSales || 0,
      breakdownByRate,
    };
  }

  /**
   * Get revenue and profit time series data for charts
   *
   * Groups financial data by time period (day or month) based on date range.
   * Uses MongoDB aggregation with $group by date.
   *
   * @param {Object} options - Date range options
   * @param {Date|string} [options.startDate] - Start date
   * @param {Date|string} [options.endDate] - End date
   * @returns {Promise<Array>} Time series data with date, revenueHT, and profit
   */
  static async getRevenueProfitTimeSeries(options = {}) {
    const {
      startDate = startOfDay(new Date()),
      endDate = endOfDay(new Date()),
    } = options;

    const normalizedStartDate =
      startDate instanceof Date ? startDate : new Date(startDate);
    const normalizedEndDate =
      endDate instanceof Date ? endDate : new Date(endDate);

    const queryStartDate = startOfDay(normalizedStartDate);
    const queryEndDate = endOfDay(normalizedEndDate);

    // Determine grouping: day if range < 60 days, month otherwise
    const daysDiff = differenceInDays(queryEndDate, queryStartDate);
    const groupByMonth = daysDiff > 60;

    // Build date grouping expression
    const dateGroupExpr = groupByMonth
      ? {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        }
      : {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        };

    const pipeline = [
      {
        $match: {
          status: "active",
          createdAt: {
            $gte: queryStartDate,
            $lte: queryEndDate,
          },
        },
      },
      {
        $group: {
          _id: dateGroupExpr,
          revenueHT: {
            $sum: {
              $multiply: ["$quantity", { $ifNull: ["$sellingPriceHT", 0] }],
            },
          },
          costHT: {
            $sum: {
              $multiply: [
                "$quantity",
                { $ifNull: ["$productSnapshot.purchasePrice", 0] },
              ],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          revenueHT: 1,
          profit: { $subtract: ["$revenueHT", "$costHT"] },
        },
      },
      {
        $sort: { "date.year": 1, "date.month": 1, "date.day": 1 },
      },
    ];

    const result = await Sale.aggregate(pipeline);

    // Format dates for display
    return result.map((item) => {
      const date = item.date;
      const dateObj = new Date(date.year, date.month - 1, date.day || 1);
      const dateLabel = groupByMonth
        ? format(dateObj, "MMM yyyy")
        : format(dateObj, "dd MMM yyyy");

      return {
        date: dateLabel,
        dateObj: dateObj,
        revenueHT: item.revenueHT || 0,
        profit: item.profit || 0,
      };
    });
  }

  /**
   * Get TVA collected time series data for charts
   *
   * Groups TVA data by time period (day or month) based on date range.
   *
   * @param {Object} options - Date range options
   * @param {Date|string} [options.startDate] - Start date
   * @param {Date|string} [options.endDate] - End date
   * @returns {Promise<Array>} Time series data with date and tvaCollected
   */
  static async getTVATimeSeries(options = {}) {
    const {
      startDate = startOfDay(new Date()),
      endDate = endOfDay(new Date()),
    } = options;

    const normalizedStartDate =
      startDate instanceof Date ? startDate : new Date(startDate);
    const normalizedEndDate =
      endDate instanceof Date ? endDate : new Date(endDate);

    const queryStartDate = startOfDay(normalizedStartDate);
    const queryEndDate = endOfDay(normalizedEndDate);

    const daysDiff = differenceInDays(queryEndDate, queryStartDate);
    const groupByMonth = daysDiff > 60;

    const dateGroupExpr = groupByMonth
      ? {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        }
      : {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        };

    const pipeline = [
      {
        $match: {
          status: "active",
          createdAt: {
            $gte: queryStartDate,
            $lte: queryEndDate,
          },
        },
      },
      {
        $group: {
          _id: dateGroupExpr,
          tvaCollected: {
            $sum: {
              $multiply: ["$quantity", { $ifNull: ["$tvaAmount", 0] }],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          tvaCollected: 1,
        },
      },
      {
        $sort: { "date.year": 1, "date.month": 1, "date.day": 1 },
      },
    ];

    const result = await Sale.aggregate(pipeline);

    return result.map((item) => {
      const date = item.date;
      const dateObj = new Date(date.year, date.month - 1, date.day || 1);
      const dateLabel = groupByMonth
        ? format(dateObj, "MMM yyyy")
        : format(dateObj, "dd MMM yyyy");

      return {
        date: dateLabel,
        dateObj: dateObj,
        tvaCollected: item.tvaCollected || 0,
      };
    });
  }

  /**
   * Get sales volume time series data for charts
   *
   * Groups sales count and quantity by time period.
   *
   * @param {Object} options - Date range options
   * @param {Date|string} [options.startDate] - Start date
   * @param {Date|string} [options.endDate] - End date
   * @returns {Promise<Array>} Time series data with date, salesCount, and quantity
   */
  static async getSalesVolumeTimeSeries(options = {}) {
    const {
      startDate = startOfDay(new Date()),
      endDate = endOfDay(new Date()),
    } = options;

    const normalizedStartDate =
      startDate instanceof Date ? startDate : new Date(startDate);
    const normalizedEndDate =
      endDate instanceof Date ? endDate : new Date(endDate);

    const queryStartDate = startOfDay(normalizedStartDate);
    const queryEndDate = endOfDay(normalizedEndDate);

    const daysDiff = differenceInDays(queryEndDate, queryStartDate);
    const groupByMonth = daysDiff > 60;

    const dateGroupExpr = groupByMonth
      ? {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        }
      : {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        };

    const pipeline = [
      {
        $match: {
          status: "active",
          createdAt: {
            $gte: queryStartDate,
            $lte: queryEndDate,
          },
        },
      },
      {
        $group: {
          _id: dateGroupExpr,
          salesCount: { $sum: 1 },
          quantity: { $sum: "$quantity" },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          salesCount: 1,
          quantity: 1,
        },
      },
      {
        $sort: { "date.year": 1, "date.month": 1, "date.day": 1 },
      },
    ];

    const result = await Sale.aggregate(pipeline);

    return result.map((item) => {
      const date = item.date;
      const dateObj = new Date(date.year, date.month - 1, date.day || 1);
      const dateLabel = groupByMonth
        ? format(dateObj, "MMM yyyy")
        : format(dateObj, "dd MMM yyyy");

      return {
        date: dateLabel,
        dateObj: dateObj,
        salesCount: item.salesCount || 0,
        quantity: item.quantity || 0,
      };
    });
  }

  /**
   * Get revenue by category for pie/donut chart
   *
   * Groups revenue HT by product category using productSnapshot.
   *
   * @param {Object} options - Date range options
   * @param {Date|string} [options.startDate] - Start date
   * @param {Date|string} [options.endDate] - End date
   * @returns {Promise<Array>} Revenue data grouped by category
   */
  static async getRevenueByCategory(options = {}) {
    const {
      startDate = startOfDay(new Date()),
      endDate = endOfDay(new Date()),
    } = options;

    const normalizedStartDate =
      startDate instanceof Date ? startDate : new Date(startDate);
    const normalizedEndDate =
      endDate instanceof Date ? endDate : new Date(endDate);

    const queryStartDate = startOfDay(normalizedStartDate);
    const queryEndDate = endOfDay(normalizedEndDate);

    const pipeline = [
      {
        $match: {
          status: "active",
          createdAt: {
            $gte: queryStartDate,
            $lte: queryEndDate,
          },
          "productSnapshot.categoryId": { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: "$productSnapshot.categoryId",
          revenueHT: {
            $sum: {
              $multiply: ["$quantity", { $ifNull: ["$sellingPriceHT", 0] }],
            },
          },
          categoryName: { $first: "$productSnapshot.category" },
        },
      },
      {
        $project: {
          _id: 0,
          categoryId: "$_id",
          categoryName: {
            $ifNull: ["$categoryName", "Catégorie inconnue"],
          },
          revenueHT: 1,
        },
      },
      {
        $sort: { revenueHT: -1 },
      },
    ];

    const result = await Sale.aggregate(pipeline);

    return result.map((item) => ({
      categoryId: item.categoryId,
      categoryName: item.categoryName || "Catégorie inconnue",
      revenueHT: item.revenueHT || 0,
    }));
  }
}

export default FinanceService;

