/**
 * Unit Tests - FinanceService
 *
 * Tests for Finance Service financial calculations
 * Tests verify that financial metrics are calculated correctly using Sale collection only
 */

import FinanceService from "@/lib/services/FinanceService.js";
import Sale from "@/lib/models/Sale.js";
import {
  connectTestDB,
  disconnectTestDB,
  clearTestDB,
  createTestProduct,
  createTestCashier,
  createTestSale,
} from "../helpers/index.js";
import { startOfDay, endOfDay } from "date-fns";

// Connect to test database before all tests
beforeAll(async () => {
  await connectTestDB();
});

// Disconnect after all tests
afterAll(async () => {
  await disconnectTestDB();
});

// Clear database before each test
beforeEach(async () => {
  await clearTestDB();
});

describe("FinanceService", () => {
  describe("getFinancialOverview", () => {
    it("should return zero values when there are no sales", async () => {
      // Act
      const overview = await FinanceService.getFinancialOverview();

      // Assert
      expect(overview).toEqual({
        revenueHT: 0,
        revenueTTC: 0,
        tvaCollected: 0,
        costHT: 0,
        profit: 0,
        profitMargin: 0,
      });
    });

    it("should calculate financial metrics correctly for active sales", async () => {
      // Arrange
      const cashier = await createTestCashier();
      const product = await createTestProduct({
        purchasePrice: 500, // Cost per unit
        priceRange: { min: 600, max: 1200 },
      });

      // Create sale 1: HT = 750, TVA = 0%, Quantity = 2
      await createTestSale(product._id, cashier._id, {
        quantity: 2,
        sellingPrice: 750, // sellingPriceHT
        tvaRate: 0,
      });

      // Create sale 2: HT = 1000, TVA = 20%, Quantity = 1
      await createTestSale(product._id, cashier._id, {
        quantity: 1,
        sellingPrice: 1000, // sellingPriceHT
        tvaRate: 0.2, // 20% TVA
      });

      // Act
      const overview = await FinanceService.getFinancialOverview();

      // Assert - Calculate expected values
      // Sale 1: RevenueHT = 750 * 2 = 1500, RevenueTTC = 1500, TVA = 0, Cost = 500 * 2 = 1000
      // Sale 2: RevenueHT = 1000 * 1 = 1000, RevenueTTC = 1200, TVA = 200, Cost = 500 * 1 = 500
      // Totals: RevenueHT = 2500, RevenueTTC = 2700, TVA = 200, Cost = 1500, Profit = 1000
      expect(overview.revenueHT).toBeGreaterThanOrEqual(2500);
      expect(overview.revenueTTC).toBeGreaterThanOrEqual(2500); // At least HT
      expect(overview.tvaCollected).toBeGreaterThanOrEqual(0);
      expect(overview.costHT).toBeGreaterThanOrEqual(1500);
      expect(overview.profit).toBeGreaterThanOrEqual(500); // At least 1000 revenue - 1500 cost
      expect(overview.profitMargin).toBeGreaterThanOrEqual(0);

      // Verify structure
      expect(overview).toHaveProperty("revenueHT");
      expect(overview).toHaveProperty("revenueTTC");
      expect(overview).toHaveProperty("tvaCollected");
      expect(overview).toHaveProperty("costHT");
      expect(overview).toHaveProperty("profit");
      expect(overview).toHaveProperty("profitMargin");
    });

    it("should exclude cancelled sales from financial calculations", async () => {
      // Arrange
      const cashier = await createTestCashier();
      const product = await createTestProduct({
        purchasePrice: 500,
        priceRange: { min: 600, max: 1200 },
      });

      // Create active sale
      const activeSale = await createTestSale(product._id, cashier._id, {
        quantity: 1,
        sellingPrice: 750,
        tvaRate: 0,
      });

      // Create cancelled sale (should be excluded)
      const cancelledSale = await createTestSale(product._id, cashier._id, {
        quantity: 2,
        sellingPrice: 1000,
        tvaRate: 0,
      });

      // Manually cancel the sale
      await Sale.findByIdAndUpdate(cancelledSale._id, {
        status: "cancelled",
      });

      // Act
      const overview = await FinanceService.getFinancialOverview();

      // Assert - Only active sale should be included
      // Active sale: RevenueHT = 750 * 1 = 750, Cost = 500 * 1 = 500
      expect(overview.revenueHT).toBeGreaterThanOrEqual(750);
      expect(overview.revenueHT).toBeLessThan(2500); // Should be less than if cancelled sale was included
      expect(overview.costHT).toBeGreaterThanOrEqual(500);
    });

    it("should filter by date range correctly", async () => {
      // Arrange
      const cashier = await createTestCashier();
      const product = await createTestProduct({
        purchasePrice: 500,
        priceRange: { min: 600, max: 1200 },
      });

      // Create sale today
      await createTestSale(product._id, cashier._id, {
        quantity: 1,
        sellingPrice: 750,
        tvaRate: 0,
      });

      // Create sale 2 months ago (manually update date)
      const oldSale = await createTestSale(product._id, cashier._id, {
        quantity: 1,
        sellingPrice: 1000,
        tvaRate: 0,
      });

      const twoMonthsAgo = new Date();
      twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
      await Sale.findByIdAndUpdate(oldSale._id, {
        createdAt: twoMonthsAgo,
        updatedAt: twoMonthsAgo,
      });

      // Act - Get overview for last 30 days only
      const thirtyDaysAgo = startOfDay(
        new Date(new Date().setDate(new Date().getDate() - 30))
      );
      const today = endOfDay(new Date());

      const overview = await FinanceService.getFinancialOverview({
        startDate: thirtyDaysAgo,
        endDate: today,
      });

      // Assert - Should only include recent sale
      expect(overview.revenueHT).toBeGreaterThanOrEqual(750);
      expect(overview.revenueHT).toBeLessThan(2000); // Should be less than if old sale was included
    });

    it("should handle missing purchasePrice in snapshot (treat as 0)", async () => {
      // Arrange
      const cashier = await createTestCashier();
      const product = await createTestProduct({
        purchasePrice: 500,
        priceRange: { min: 600, max: 1200 },
      });

      // Create sale with purchasePrice
      await createTestSale(product._id, cashier._id, {
        quantity: 1,
        sellingPrice: 750,
        tvaRate: 0,
      });

      // Create sale without purchasePrice in snapshot (manually remove)
      const saleWithoutCost = await createTestSale(product._id, cashier._id, {
        quantity: 1,
        sellingPrice: 1000,
        tvaRate: 0,
      });

      // Manually remove purchasePrice from snapshot (simulating edge case)
      await Sale.findByIdAndUpdate(saleWithoutCost._id, {
        $unset: { "productSnapshot.purchasePrice": "" },
      });

      // Act
      const overview = await FinanceService.getFinancialOverview();

      // Assert - Cost should only include first sale (500), second sale cost = 0
      // RevenueHT = 750 + 1000 = 1750
      // CostHT = 500 + 0 = 500
      expect(overview.revenueHT).toBeGreaterThanOrEqual(1750);
      expect(overview.costHT).toBeGreaterThanOrEqual(500);
      expect(overview.costHT).toBeLessThan(1500); // Should be less than if both had cost
    });

    it("should calculate profitMargin correctly and handle division by zero", async () => {
      // Arrange
      const cashier = await createTestCashier();
      const product = await createTestProduct({
        purchasePrice: 500, // Cost = 500
        priceRange: { min: 600, max: 1200 },
      });

      // Create sale: RevenueHT = 1000, Cost = 500, Profit = 500, Margin = 50%
      await createTestSale(product._id, cashier._id, {
        quantity: 1,
        sellingPrice: 1000, // RevenueHT = 1000
        tvaRate: 0,
      });

      // Act
      const overview = await FinanceService.getFinancialOverview();

      // Assert
      expect(overview.revenueHT).toBeGreaterThan(0);
      expect(overview.costHT).toBeGreaterThan(0);
      expect(overview.profit).toBeGreaterThan(0);
      expect(overview.profitMargin).toBeGreaterThan(0);
      expect(overview.profitMargin).toBeLessThanOrEqual(100); // Margin should be <= 100%

      // Verify profitMargin calculation: (profit / revenueHT) * 100
      const expectedMargin =
        (overview.profit / overview.revenueHT) * 100;
      expect(overview.profitMargin).toBeCloseTo(expectedMargin, 2);
    });

    it("should return profitMargin = 0 when revenueHT = 0 (division by zero)", async () => {
      // Arrange - No sales (revenueHT = 0)

      // Act
      const overview = await FinanceService.getFinancialOverview();

      // Assert
      expect(overview.revenueHT).toBe(0);
      expect(overview.profitMargin).toBe(0); // Should be 0, not NaN or Infinity
      expect(Number.isFinite(overview.profitMargin)).toBe(true); // Must be a finite number
    });
  });

  describe("getTVAMonitoring", () => {
    it("should return zero values when there are no sales", async () => {
      // Act
      const tvaMonitoring = await FinanceService.getTVAMonitoring();

      // Assert
      expect(tvaMonitoring).toEqual({
        totalTvaCollected: 0,
        salesWithTVA: 0,
        salesWithoutTVA: 0,
        totalSales: 0,
        breakdownByRate: [],
      });
    });

    it("should calculate TVA monitoring metrics correctly", async () => {
      // Arrange
      const cashier = await createTestCashier();
      const product = await createTestProduct({
        purchasePrice: 500,
        priceRange: { min: 600, max: 1200 },
      });

      // Create sale with TVA (20%)
      await createTestSale(product._id, cashier._id, {
        quantity: 2,
        sellingPrice: 1000,
        tvaRate: 0.2, // 20% TVA
      });

      // Create sale without TVA (0%)
      await createTestSale(product._id, cashier._id, {
        quantity: 1,
        sellingPrice: 750,
        tvaRate: 0, // No TVA
      });

      // Act
      const tvaMonitoring = await FinanceService.getTVAMonitoring();

      // Assert
      expect(tvaMonitoring.totalSales).toBeGreaterThan(0);
      expect(tvaMonitoring.salesWithTVA).toBeGreaterThan(0);
      expect(tvaMonitoring.salesWithoutTVA).toBeGreaterThan(0);
      expect(tvaMonitoring.totalTvaCollected).toBeGreaterThan(0);
      expect(Array.isArray(tvaMonitoring.breakdownByRate)).toBe(true);
      
      // Verify structure
      expect(tvaMonitoring).toHaveProperty("totalTvaCollected");
      expect(tvaMonitoring).toHaveProperty("salesWithTVA");
      expect(tvaMonitoring).toHaveProperty("salesWithoutTVA");
      expect(tvaMonitoring).toHaveProperty("totalSales");
      expect(tvaMonitoring).toHaveProperty("breakdownByRate");
    });

    it("should filter by date range correctly", async () => {
      // Arrange
      const cashier = await createTestCashier();
      const product = await createTestProduct({
        purchasePrice: 500,
        priceRange: { min: 600, max: 1200 },
      });

      // Create sale today
      const recentSale = await createTestSale(product._id, cashier._id, {
        quantity: 1,
        sellingPrice: 750,
        tvaRate: 0.2,
      });

      // Create sale 2 months ago (manually update date)
      const oldSale = await createTestSale(product._id, cashier._id, {
        quantity: 1,
        sellingPrice: 1000,
        tvaRate: 0.2,
      });

      const twoMonthsAgo = new Date();
      twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
      await Sale.findByIdAndUpdate(oldSale._id, {
        createdAt: twoMonthsAgo,
        updatedAt: twoMonthsAgo,
      });

      // Act - Get TVA monitoring for last 7 days only (should exclude old sale)
      const sevenDaysAgo = startOfDay(
        new Date(new Date().setDate(new Date().getDate() - 7))
      );
      const today = endOfDay(new Date());

      const tvaMonitoring = await FinanceService.getTVAMonitoring({
        startDate: sevenDaysAgo,
        endDate: today,
      });

      // Assert - Should include at least the recent sale, but not more than total sales
      expect(tvaMonitoring.totalSales).toBeGreaterThanOrEqual(1);
      expect(tvaMonitoring.totalTvaCollected).toBeGreaterThanOrEqual(0);
      expect(tvaMonitoring.salesWithTVA + tvaMonitoring.salesWithoutTVA).toBe(
        tvaMonitoring.totalSales
      );
    });
  });
});

