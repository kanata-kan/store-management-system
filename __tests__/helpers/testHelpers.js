/**
 * Test Helpers
 *
 * Utility functions for testing
 */

import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

/**
 * Generate JWT token for testing
 */
export function generateTestToken(user) {
  const payload = {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role,
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
}

/**
 * Generate Authorization header with JWT token
 */
export function generateAuthHeader(user) {
  const token = generateTestToken(user);
  return `Bearer ${token}`;
}

/**
 * Generate Cookie header with JWT token
 */
export function generateCookieHeader(user) {
  const token = generateTestToken(user);
  return `session=${token}`;
}

/**
 * Hash password for testing
 */
export async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

/**
 * Wait for a specified time (for async operations)
 */
export function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate random string (for unique names)
 */
export function randomString(length = 10) {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length);
}

/**
 * Generate random number in range
 */
export function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Create test user data
 */
export function createTestUserData(overrides = {}) {
  return {
    name: `Test User ${randomString(5)}`,
    email: `test-${randomString(8)}@example.com`,
    password: "Test123456",
    role: "cashier",
    ...overrides,
  };
}

/**
 * Create test product data
 */
export function createTestProductData(overrides = {}) {
  return {
    name: `Test Product ${randomString(5)}`,
    purchasePrice: randomNumber(100, 1000),
    sellingPrice: randomNumber(150, 1500),
    stock: randomNumber(10, 100),
    lowStockThreshold: 5,
    ...overrides,
  };
}

/**
 * Create test category data
 */
export function createTestCategoryData(overrides = {}) {
  return {
    name: `Test Category ${randomString(5)}`,
    ...overrides,
  };
}

/**
 * Create test brand data
 */
export function createTestBrandData(overrides = {}) {
  return {
    name: `Test Brand ${randomString(5)}`,
    ...overrides,
  };
}

/**
 * Create test supplier data
 */
export function createTestSupplierData(overrides = {}) {
  return {
    name: `Test Supplier ${randomString(5)}`,
    phone: `+21306${randomNumber(10000000, 99999999)}`,
    ...overrides,
  };
}

/**
 * Validate ObjectId format
 */
export function isValidObjectId(id) {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

/**
 * Extract error message from API response
 */
export function extractErrorMessage(response) {
  return response.body?.error?.message || response.body?.message || "Unknown error";
}

/**
 * Extract error code from API response
 */
export function extractErrorCode(response) {
  return response.body?.error?.code || response.body?.code || "UNKNOWN_ERROR";
}

