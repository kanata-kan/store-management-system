/**
 * Jest Configuration
 *
 * Professional testing setup for Store Management System
 */

export default {
  // Test environment
  testEnvironment: "node",

  // Enable ES Modules support
  transform: {},

  // Root directory
  rootDir: ".",

  // Test match patterns
  testMatch: [
    "**/__tests__/**/*.test.js",
    "**/__tests__/**/*.spec.js",
  ],

  // Coverage directory
  coverageDirectory: "coverage",

  // Coverage reporters
  coverageReporters: [
    "text",
    "text-summary",
    "html",
    "lcov",
  ],

  // Files to collect coverage from
  collectCoverageFrom: [
    "lib/services/**/*.js",
    "lib/models/**/*.js",
    "lib/validation/**/*.js",
    "lib/auth/**/*.js",
    "app/api/**/*.js",
    "!**/__tests__/**",
    "!**/node_modules/**",
  ],

  // Coverage thresholds (enforce minimum coverage)
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 75,
      lines: 80,
      statements: 80,
    },
  },

  // Setup files
  setupFilesAfterEnv: ["<rootDir>/__tests__/setup.js"],

  // Module name mapper (support @/ alias)
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },

  // Test timeout (60 seconds for integration tests and MongoDB setup)
  testTimeout: 60000,

  // Verbose output
  verbose: true,

  // Clear mocks between tests
  clearMocks: true,

  // Restore mocks between tests
  restoreMocks: true,

  // Reset mocks between tests
  resetMocks: true,
};

