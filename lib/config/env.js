/**
 * Environment Variables Validation
 *
 * Validates all environment variables at application startup.
 * Implements fail-fast rules for missing required variables and invalid production flags.
 *
 * This module MUST be imported early in the application lifecycle to ensure
 * validation happens before any other code executes.
 */

const DEFAULT_JWT_SECRET = "your-secret-key-change-in-production";

/**
 * Validate required environment variables
 * @throws {Error} If any required variable is missing
 */
function validateRequired() {
  const required = [
    "MONGODB_URI",
    "NODE_ENV",
    "JWT_SECRET",
  ];

  const missing = required.filter((varName) => !process.env[varName] || process.env[varName].trim() === "");

  if (missing.length > 0) {
    const errorMessage = missing.length === 1
      ? `❌ ENV Validation Error: Missing required environment variable: ${missing[0]}`
      : `❌ ENV Validation Error: Missing required environment variables: ${missing.join(", ")}`;
    throw new Error(errorMessage);
  }
}

/**
 * Validate NODE_ENV value
 * @throws {Error} If NODE_ENV is invalid
 */
function validateNodeEnv() {
  const nodeEnv = process.env.NODE_ENV;
  const allowedValues = ["development", "production", "test"];

  if (!allowedValues.includes(nodeEnv)) {
    throw new Error(
      `❌ ENV Validation Error: NODE_ENV must be one of: ${allowedValues.join(", ")}\n` +
      `Current value: ${nodeEnv || "(not set)"}`
    );
  }
}

/**
 * Validate APP_ENV (required when NODE_ENV=production)
 * @throws {Error} If APP_ENV is missing or invalid when required
 */
function validateAppEnv() {
  const nodeEnv = process.env.NODE_ENV;
  const appEnv = process.env.APP_ENV;

  // Skip APP_ENV validation during build time (Next.js sets NODE_ENV=production during build)
  // Only validate at runtime when the application is actually running
  const isBuildTime = process.env.NEXT_PHASE === "phase-production-build" || 
                      process.env.NEXT_PHASE === "phase-development-build";

  // APP_ENV is required when NODE_ENV=production (runtime only, not build time)
  if (nodeEnv === "production" && !isBuildTime) {
    if (!appEnv || appEnv.trim() === "") {
      throw new Error(
        `❌ ENV Validation Error: APP_ENV is required when NODE_ENV=production.\n` +
        `Please set APP_ENV to either "staging" or "production".`
      );
    }

    const allowedValues = ["staging", "production"];
    if (!allowedValues.includes(appEnv)) {
      throw new Error(
        `❌ ENV Validation Error: APP_ENV must be one of: ${allowedValues.join(", ")}\n` +
        `Current value: ${appEnv}`
      );
    }
  }
}

/**
 * Validate JWT_SECRET strength and security
 * @throws {Error} If JWT_SECRET is invalid or insecure
 */
function validateJwtSecret() {
  const jwtSecret = process.env.JWT_SECRET;
  const nodeEnv = process.env.NODE_ENV;

  // Check minimum length
  if (jwtSecret.length < 32) {
    throw new Error(
      `❌ ENV Validation Error: JWT_SECRET must be at least 32 characters long.\n` +
      `Current length: ${jwtSecret.length}.\n` +
      `Generate a strong secret with: openssl rand -base64 32`
    );
  }

  // Check for default value in production
  if (nodeEnv === "production" && jwtSecret === DEFAULT_JWT_SECRET) {
    throw new Error(
      `❌ ENV Validation Error: JWT_SECRET is using default value in production.\n` +
      `This is a severe security vulnerability.\n` +
      `Set JWT_SECRET environment variable with a strong random secret (min 32 characters).\n` +
      `Generate with: openssl rand -base64 32`
    );
  }
}

/**
 * Validate production safety rules
 * @throws {Error} If production safety rules are violated
 */
function validateProductionSafety() {
  const nodeEnv = process.env.NODE_ENV;
  const skipAuth = process.env.SKIP_AUTH === "true";

  // Critical: SKIP_AUTH cannot be enabled in production
  if (nodeEnv === "production" && skipAuth) {
    throw new Error(
      `❌ ENV Validation Error: SKIP_AUTH cannot be enabled when NODE_ENV=production.\n` +
      `This is a critical security violation.\n` +
      `SKIP_AUTH is only allowed in development environment.\n` +
      `Set SKIP_AUTH=false or remove it from your environment configuration.`
    );
  }
}

/**
 * Main validation function
 * Validates all environment variables and production safety rules
 * @throws {Error} If validation fails
 */
export function validateEnv() {
  try {
    // Step 1: Validate required variables
    validateRequired();

    // Step 2: Validate NODE_ENV
    validateNodeEnv();

    // Step 3: Validate APP_ENV (if required)
    validateAppEnv();

    // Step 4: Validate JWT_SECRET
    validateJwtSecret();

    // Step 5: Validate production safety rules
    validateProductionSafety();

    // All validations passed
    if (process.env.NODE_ENV === "development") {
      console.log("✅ Environment variables validated successfully");
    }
  } catch (error) {
    // Log error and re-throw to fail fast
    console.error(error.message);
    process.exit(1);
  }
}

/**
 * Get validated environment configuration
 * Returns an object with validated environment variables
 * @returns {Object} Environment configuration
 */
export function getEnvConfig() {
  return {
    NODE_ENV: process.env.NODE_ENV,
    APP_ENV: process.env.APP_ENV,
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1d",
    SKIP_AUTH: process.env.SKIP_AUTH === "true",
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  };
}

// Auto-validate on module import (fail-fast)
// This ensures validation happens as early as possible
// Use global flag to prevent multiple validations
if (typeof window === "undefined" && !global.__ENV_VALIDATED__) {
  // Only validate on server-side (Node.js) and only once
  validateEnv();
  global.__ENV_VALIDATED__ = true;
}

