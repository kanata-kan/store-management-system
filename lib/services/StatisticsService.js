/**
 * Statistics Service - TVA-Aware Version
 * 
 * Provides advanced analytics and statistics for the dashboard.
 * Follows Service-Oriented Architecture principles.
 * All business logic for statistics calculations resides here.
 * 
 * IMPORTANT: Sale model structure (TVA System):
 * - Each Sale document represents ONE product sale
 * - NOT an array of items
 * - Financial fields: sellingPriceHT, tvaRate, tvaAmount, sellingPriceTTC, quantity
 * - NEVER use sellingPrice (virtual only)
 * - Financial formulas:
 *   - RevenueHT = Σ(quantity * sellingPriceHT)
 *   - RevenueTTC = Σ(quantity * sellingPriceTTC)
 *   - TVACollected = Σ(quantity * tvaAmount)
 *   - CostHT = Σ(quantity * productSnapshot.purchasePrice)
 *   - Profit = RevenueHT - CostHT (TVA is NEVER part of profit)
 */

import Sale from "../models/Sale.js";
import Product from "../models/Product.js";
import Invoice from "../models/Invoice.js";
import { createError } from "../utils/errorFactory.js";
import { formatCurrency } from "../utils/currencyConfig.js";
import { startOfDay, endOfDay, subDays, format } from "date-fns";

class StatisticsService {
  /**
   * Get comprehensive dashboard statistics
   * @param {Object} options - Date range options
   * @param {Date} [options.startDate] - Start date (default: today)
   * @param {Date} [options.endDate] - End date (default: today)
   * @returns {Promise<Object>} Dashboard statistics
   */
  static async getDashboardStatistics(options = {}) {
    const {
      startDate = startOfDay(new Date()),
      endDate = endOfDay(new Date()),
    } = options;

    try {
      // Fetch data in parallel for performance
      const [
        salesToday,
        salesThisMonth,
        totalProducts,
        lowStockProducts,
        totalInventoryValue,
        topProducts,
        salesLast7Days,
        salesByCategory,
      ] = await Promise.all([
        this.getSalesToday(),
        this.getSalesThisMonth(),
        this.getTotalProducts(),
        this.getLowStockProducts(),
        this.getTotalInventoryValue(),
        this.getTopSellingProducts(5),
        this.getSalesLast7Days(),
        this.getSalesByCategory(),
      ]);

      return {
        kpis: {
          salesToday,
          salesThisMonth,
          totalProducts,
          lowStockProducts,
          totalInventoryValue,
        },
        topProducts,
        salesLast7Days,
        salesByCategory,
        generatedAt: new Date(),
      };
    } catch (error) {
      console.error("StatisticsService Error:", error);
      throw createError(
        "Erreur lors de la récupération des statistiques",
        "STATISTICS_FETCH_ERROR",
        500
      );
    }
  }

  /**
   * Get sales statistics for today
   * TVA-Aware: Calculates RevenueHT, RevenueTTC, TVACollected, and Profit
   * @returns {Promise<Object>} Today's sales stats with HT/TTC/TVA breakdown
   */
  static async getSalesToday() {
    const today = startOfDay(new Date());
    const tomorrow = endOfDay(new Date());

    const sales = await Sale.find({
      createdAt: { $gte: today, $lte: tomorrow },
      status: "active",
    }).lean();

    // TVA System: Calculate financial metrics using HT/TTC/TVA fields
    // RevenueHT = Σ(quantity * sellingPriceHT)
    const revenueHT = sales.reduce(
      (sum, sale) => sum + (sale.quantity * (sale.sellingPriceHT || 0)),
      0
    );
    
    // RevenueTTC = Σ(quantity * sellingPriceTTC)
    const revenueTTC = sales.reduce(
      (sum, sale) => sum + (sale.quantity * (sale.sellingPriceTTC || sale.sellingPriceHT || 0)),
      0
    );
    
    // TVACollected = Σ(quantity * tvaAmount)
    const tvaCollected = sales.reduce(
      (sum, sale) => sum + (sale.quantity * (sale.tvaAmount || 0)),
      0
    );
    
    // CostHT = Σ(quantity * productSnapshot.purchasePrice)
    const costHT = sales.reduce(
      (sum, sale) => sum + (sale.quantity * (sale.productSnapshot?.purchasePrice || 0)),
      0
    );
    
    // Profit = RevenueHT - CostHT (TVA is NOT part of profit)
    const profit = revenueHT - costHT;
    
    const count = sales.length;

    // Calculate trend (compare to yesterday) - using RevenueHT for consistency
    const yesterday = startOfDay(subDays(new Date(), 1));
    const yesterdayEnd = endOfDay(subDays(new Date(), 1));
    
    const salesYesterday = await Sale.find({
      createdAt: { $gte: yesterday, $lte: yesterdayEnd },
      status: "active",
    }).lean();

    const revenueHTYesterday = salesYesterday.reduce(
      // TVA System: Use sellingPriceHT only (never use sellingPrice virtual)
      (sum, sale) => sum + (sale.quantity * (sale.sellingPriceHT || 0)),
      0
    );

    const trend =
      revenueHTYesterday > 0
        ? ((revenueHT - revenueHTYesterday) / revenueHTYesterday) * 100
        : 0;

    return {
      totalAmount: revenueHT, // Keep for backward compatibility (HT value)
      revenueHT,
      revenueTTC,
      tvaCollected,
      costHT,
      profit,
      count,
      trend: Math.round(trend),
      formattedAmount: formatCurrency(revenueHT), // HT formatted
      formattedRevenueHT: formatCurrency(revenueHT),
      formattedRevenueTTC: formatCurrency(revenueTTC),
      formattedTvaCollected: formatCurrency(tvaCollected),
      formattedProfit: formatCurrency(profit),
    };
  }

  /**
   * Get sales statistics for this month
   * TVA-Aware: Calculates RevenueHT, RevenueTTC, TVACollected, and Profit
   * @returns {Promise<Object>} This month's sales stats with HT/TTC/TVA breakdown
   */
  static async getSalesThisMonth() {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0,
      23,
      59,
      59
    );

    const sales = await Sale.find({
      createdAt: { $gte: firstDayOfMonth, $lte: lastDayOfMonth },
      status: "active",
    }).lean();

    // TVA System: Calculate financial metrics using HT/TTC/TVA fields
    // RevenueHT = Σ(quantity * sellingPriceHT)
    const revenueHT = sales.reduce(
      (sum, sale) => sum + (sale.quantity * (sale.sellingPriceHT || 0)),
      0
    );
    
    // RevenueTTC = Σ(quantity * sellingPriceTTC)
    const revenueTTC = sales.reduce(
      (sum, sale) => sum + (sale.quantity * (sale.sellingPriceTTC || sale.sellingPriceHT || 0)),
      0
    );
    
    // TVACollected = Σ(quantity * tvaAmount)
    const tvaCollected = sales.reduce(
      (sum, sale) => sum + (sale.quantity * (sale.tvaAmount || 0)),
      0
    );
    
    // CostHT = Σ(quantity * productSnapshot.purchasePrice)
    const costHT = sales.reduce(
      (sum, sale) => sum + (sale.quantity * (sale.productSnapshot?.purchasePrice || 0)),
      0
    );
    
    // Profit = RevenueHT - CostHT (TVA is NOT part of profit)
    const profit = revenueHT - costHT;
    
    const count = sales.length;

    // Calculate trend (compare to last month) - using RevenueHT for consistency
    const firstDayOfLastMonth = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      1
    );
    const lastDayOfLastMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      0,
      23,
      59,
      59
    );

    const salesLastMonth = await Sale.find({
      createdAt: { $gte: firstDayOfLastMonth, $lte: lastDayOfLastMonth },
      status: "active",
    }).lean();

    const revenueHTLastMonth = salesLastMonth.reduce(
      // TVA System: Use sellingPriceHT only (never use sellingPrice virtual)
      (sum, sale) => sum + (sale.quantity * (sale.sellingPriceHT || 0)),
      0
    );

    const trend =
      revenueHTLastMonth > 0
        ? ((revenueHT - revenueHTLastMonth) / revenueHTLastMonth) * 100
        : 0;

    return {
      totalAmount: revenueHT, // Keep for backward compatibility (HT value)
      revenueHT,
      revenueTTC,
      tvaCollected,
      costHT,
      profit,
      count,
      trend: Math.round(trend),
      formattedAmount: formatCurrency(revenueHT), // HT formatted
      formattedRevenueHT: formatCurrency(revenueHT),
      formattedRevenueTTC: formatCurrency(revenueTTC),
      formattedTvaCollected: formatCurrency(tvaCollected),
      formattedProfit: formatCurrency(profit),
    };
  }

  /**
   * Get total products count
   * @returns {Promise<Object>} Total products stats
   */
  static async getTotalProducts() {
    const count = await Product.countDocuments();
    return { count };
  }

  /**
   * Get low stock products
   * @returns {Promise<Object>} Low stock stats
   */
  static async getLowStockProducts() {
    const products = await Product.find().lean();
    const lowStockProducts = products.filter(
      (p) => p.stock <= p.lowStockThreshold
    );
    
    return {
      count: lowStockProducts.length,
      products: lowStockProducts.slice(0, 5).map((p) => ({
        id: p._id,
        name: p.name,
        stock: p.stock,
        threshold: p.lowStockThreshold,
      })),
    };
  }

  /**
   * Get total inventory value (based on purchase price)
   * @returns {Promise<Object>} Total inventory value
   */
  static async getTotalInventoryValue() {
    const products = await Product.find().lean();
    
    const totalValue = products.reduce(
      (sum, product) => sum + (product.stock || 0) * (product.purchasePrice || 0),
      0
    );

    return {
      totalValue,
      formattedValue: formatCurrency(totalValue),
    };
  }

  /**
   * Get top selling products
   * TVA-Aware: Calculates RevenueHT, RevenueTTC, TVACollected per product
   * @param {number} limit - Number of top products to return
   * @returns {Promise<Array>} Top selling products with HT/TTC/TVA breakdown
   */
  static async getTopSellingProducts(limit = 5) {
    // Aggregate sales data to find top products
    // Snapshot-Only: Use productSnapshot.productId (identity field) for grouping
    // TVA System: Use sellingPriceHT, sellingPriceTTC, tvaAmount (NEVER use sellingPrice virtual)
    const topProducts = await Sale.aggregate([
      { $match: { status: "active", "productSnapshot.productId": { $exists: true } } },
      {
        $group: {
          _id: "$productSnapshot.productId", // ⚠️ IDENTITY FIELD (stable) - group by identity only
          totalQuantity: { $sum: "$quantity" },
          // RevenueHT = Σ(quantity * sellingPriceHT)
          totalRevenueHT: { 
            $sum: { 
              $multiply: [
                "$quantity", 
                { $ifNull: ["$sellingPriceHT", 0] }
              ] 
            } 
          },
          // RevenueTTC = Σ(quantity * sellingPriceTTC)
          totalRevenueTTC: { 
            $sum: { 
              $multiply: [
                "$quantity", 
                { $ifNull: ["$sellingPriceTTC", { $ifNull: ["$sellingPriceHT", 0] }] }
              ] 
            } 
          },
          // TVACollected = Σ(quantity * tvaAmount)
          totalTvaCollected: { 
            $sum: { 
              $multiply: [
                "$quantity", 
                { $ifNull: ["$tvaAmount", 0] }
              ] 
            } 
          },
          // Get product name from snapshot (display field - for presentation only)
          productName: { $first: "$productSnapshot.name" },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 1,
          name: { $ifNull: ["$productName", "Produit supprimé"] },
          totalQuantity: 1,
          totalRevenueHT: 1,
          totalRevenueTTC: 1,
          totalTvaCollected: 1,
          // Keep totalRevenue for backward compatibility (uses HT)
          totalRevenue: "$totalRevenueHT",
        },
      },
    ]);

    return topProducts.map((product) => ({
      ...product,
      formattedRevenue: formatCurrency(product.totalRevenueHT), // HT formatted for backward compatibility
      formattedRevenueHT: formatCurrency(product.totalRevenueHT),
      formattedRevenueTTC: formatCurrency(product.totalRevenueTTC),
      formattedTvaCollected: formatCurrency(product.totalTvaCollected),
    }));
  }

  /**
   * Get sales for last 7 days (for line chart)
   * TVA-Aware: Calculates RevenueHT and RevenueTTC per day
   * @returns {Promise<Array>} Sales data for last 7 days with HT/TTC breakdown
   */
  static async getSalesLast7Days() {
    const salesData = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);

      const sales = await Sale.find({
        createdAt: { $gte: dayStart, $lte: dayEnd },
        status: "active",
      }).lean();

      // TVA System: Calculate RevenueHT and RevenueTTC per day
      // RevenueHT = Σ(quantity * sellingPriceHT)
      const revenueHT = sales.reduce(
        (sum, sale) => sum + (sale.quantity * (sale.sellingPriceHT || 0)),
        0
      );
      
      // RevenueTTC = Σ(quantity * sellingPriceTTC)
      const revenueTTC = sales.reduce(
        (sum, sale) => sum + (sale.quantity * (sale.sellingPriceTTC || sale.sellingPriceHT || 0)),
        0
      );
      
      // TVACollected = Σ(quantity * tvaAmount)
      const tvaCollected = sales.reduce(
        (sum, sale) => sum + (sale.quantity * (sale.tvaAmount || 0)),
        0
      );

      salesData.push({
        date: format(date, "dd/MM"),
        fullDate: format(date, "yyyy-MM-dd"),
        totalAmount: revenueHT, // Keep for backward compatibility (HT value)
        revenueHT,
        revenueTTC,
        tvaCollected,
        count: sales.length,
        formattedAmount: formatCurrency(revenueHT), // HT formatted for backward compatibility
        formattedRevenueHT: formatCurrency(revenueHT),
        formattedRevenueTTC: formatCurrency(revenueTTC),
        formattedTvaCollected: formatCurrency(tvaCollected),
      });
    }

    return salesData;
  }

  /**
   * Get sales by category (for pie chart)
   * TVA-Aware: Calculates RevenueHT, RevenueTTC, TVACollected per category
   * @returns {Promise<Array>} Sales by category with HT/TTC/TVA breakdown
   */
  static async getSalesByCategory() {
    // Snapshot-Only: Use productSnapshot.categoryId (identity field) for grouping
    // TVA System: Use sellingPriceHT, sellingPriceTTC, tvaAmount (NEVER use sellingPrice virtual)
    const categoryData = await Sale.aggregate([
      { $match: { status: "active", "productSnapshot.categoryId": { $exists: true } } },
      {
        $group: {
          _id: "$productSnapshot.categoryId", // ⚠️ IDENTITY FIELD (stable) - group by identity only
          // RevenueHT = Σ(quantity * sellingPriceHT)
          totalRevenueHT: { 
            $sum: { 
              $multiply: [
                "$quantity", 
                { $ifNull: ["$sellingPriceHT", 0] }
              ] 
            } 
          },
          // RevenueTTC = Σ(quantity * sellingPriceTTC)
          totalRevenueTTC: { 
            $sum: { 
              $multiply: [
                "$quantity", 
                { $ifNull: ["$sellingPriceTTC", { $ifNull: ["$sellingPriceHT", 0] }] }
              ] 
            } 
          },
          // TVACollected = Σ(quantity * tvaAmount)
          totalTvaCollected: { 
            $sum: { 
              $multiply: [
                "$quantity", 
                { $ifNull: ["$tvaAmount", 0] }
              ] 
            } 
          },
          count: { $sum: "$quantity" },
          // Get category name from snapshot (display field - for presentation only)
          categoryName: { $first: "$productSnapshot.category" },
        },
      },
      { $sort: { totalRevenueHT: -1 } }, // Sort by HT revenue
      {
        $project: {
          _id: 1,
          name: { $ifNull: ["$categoryName", "Non catégorisé"] },
          totalRevenueHT: 1,
          totalRevenueTTC: 1,
          totalTvaCollected: 1,
          // Keep totalRevenue for backward compatibility (uses HT)
          totalRevenue: "$totalRevenueHT",
          count: 1,
        },
      },
    ]);

    return categoryData.map((cat) => ({
      name: cat.name || "Non catégorisé", // Use category name from snapshot (display field)
      value: cat.totalRevenueHT, // Keep for backward compatibility (HT value)
      revenueHT: cat.totalRevenueHT,
      revenueTTC: cat.totalRevenueTTC,
      tvaCollected: cat.totalTvaCollected,
      count: cat.count,
      formattedValue: formatCurrency(cat.totalRevenueHT), // HT formatted for backward compatibility
      formattedRevenueHT: formatCurrency(cat.totalRevenueHT),
      formattedRevenueTTC: formatCurrency(cat.totalRevenueTTC),
      formattedTvaCollected: formatCurrency(cat.totalTvaCollected),
    }));
  }

  /**
   * Get invoices today count
   * @returns {Promise<number>} Number of invoices today
   */
  static async getInvoicesToday() {
    const today = startOfDay(new Date());
    const tomorrow = endOfDay(new Date());

    const count = await Invoice.countDocuments({
      createdAt: { $gte: today, $lte: tomorrow },
      status: "paid",
    });

    return { count };
  }
}

export default StatisticsService;
