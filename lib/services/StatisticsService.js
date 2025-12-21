/**
 * Statistics Service - Fixed Version
 * 
 * Provides advanced analytics and statistics for the dashboard.
 * Follows Service-Oriented Architecture principles.
 * All business logic for statistics calculations resides here.
 * 
 * IMPORTANT: Sale model structure:
 * - Each Sale document represents ONE product sale
 * - NOT an array of items
 * - Structure: { product, quantity, sellingPrice, cashier, status, createdAt }
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
   * @returns {Promise<Object>} Today's sales stats
   */
  static async getSalesToday() {
    const today = startOfDay(new Date());
    const tomorrow = endOfDay(new Date());

    const sales = await Sale.find({
      createdAt: { $gte: today, $lte: tomorrow },
      status: "active",
    }).lean();

    const totalAmount = sales.reduce(
      (sum, sale) => sum + (sale.quantity * sale.sellingPrice),
      0
    );
    const count = sales.length;

    // Calculate trend (compare to yesterday)
    const yesterday = startOfDay(subDays(new Date(), 1));
    const yesterdayEnd = endOfDay(subDays(new Date(), 1));
    
    const salesYesterday = await Sale.find({
      createdAt: { $gte: yesterday, $lte: yesterdayEnd },
      status: "active",
    }).lean();

    const totalAmountYesterday = salesYesterday.reduce(
      (sum, sale) => sum + (sale.quantity * sale.sellingPrice),
      0
    );

    const trend =
      totalAmountYesterday > 0
        ? ((totalAmount - totalAmountYesterday) / totalAmountYesterday) * 100
        : 0;

    return {
      totalAmount,
      count,
      trend: Math.round(trend),
      formattedAmount: formatCurrency(totalAmount),
    };
  }

  /**
   * Get sales statistics for this month
   * @returns {Promise<Object>} This month's sales stats
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

    const totalAmount = sales.reduce(
      (sum, sale) => sum + (sale.quantity * sale.sellingPrice),
      0
    );
    const count = sales.length;

    // Calculate trend (compare to last month)
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

    const totalAmountLastMonth = salesLastMonth.reduce(
      (sum, sale) => sum + (sale.quantity * sale.sellingPrice),
      0
    );

    const trend =
      totalAmountLastMonth > 0
        ? ((totalAmount - totalAmountLastMonth) / totalAmountLastMonth) * 100
        : 0;

    return {
      totalAmount,
      count,
      trend: Math.round(trend),
      formattedAmount: formatCurrency(totalAmount),
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
   * @param {number} limit - Number of top products to return
   * @returns {Promise<Array>} Top selling products
   */
  static async getTopSellingProducts(limit = 5) {
    // Aggregate sales data to find top products
    // FIXED: Sale model doesn't have items array, each sale is one product
    const topProducts = await Sale.aggregate([
      { $match: { status: "active" } },
      {
        $group: {
          _id: "$product",
          totalQuantity: { $sum: "$quantity" },
          totalRevenue: { $sum: { $multiply: ["$quantity", "$sellingPrice"] } },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: { path: "$productInfo", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          name: { $ifNull: ["$productInfo.name", "Produit supprimé"] },
          totalQuantity: 1,
          totalRevenue: 1,
        },
      },
    ]);

    return topProducts.map((product) => ({
      ...product,
      formattedRevenue: formatCurrency(product.totalRevenue),
    }));
  }

  /**
   * Get sales for last 7 days (for line chart)
   * @returns {Promise<Array>} Sales data for last 7 days
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

      const totalAmount = sales.reduce(
        (sum, sale) => sum + (sale.quantity * sale.sellingPrice),
        0
      );

      salesData.push({
        date: format(date, "dd/MM"),
        fullDate: format(date, "yyyy-MM-dd"),
        totalAmount,
        count: sales.length,
        formattedAmount: formatCurrency(totalAmount),
      });
    }

    return salesData;
  }

  /**
   * Get sales by category (for pie chart)
   * @returns {Promise<Array>} Sales by category
   */
  static async getSalesByCategory() {
    // FIXED: Sale model structure - each sale is one product
    const categoryData = await Sale.aggregate([
      { $match: { status: "active" } },
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: { path: "$productInfo", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "subcategories",
          localField: "productInfo.subCategory",
          foreignField: "_id",
          as: "subCategoryInfo",
        },
      },
      { $unwind: { path: "$subCategoryInfo", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "categories",
          localField: "subCategoryInfo.category",
          foreignField: "_id",
          as: "categoryInfo",
        },
      },
      { $unwind: { path: "$categoryInfo", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$categoryInfo.name",
          totalRevenue: { $sum: { $multiply: ["$quantity", "$sellingPrice"] } },
          count: { $sum: "$quantity" },
        },
      },
      { $sort: { totalRevenue: -1 } },
    ]);

    return categoryData.map((cat) => ({
      name: cat._id || "Non catégorisé",
      value: cat.totalRevenue,
      count: cat.count,
      formattedValue: formatCurrency(cat.totalRevenue),
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
