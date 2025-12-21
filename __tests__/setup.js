/**
 * Jest Global Setup
 *
 * Runs before all tests. Sets up test environment.
 */

// Set test environment variables
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-jwt-secret-key-for-testing-only";
process.env.SESSION_KEY = "test-session-key-for-testing-only";
process.env.MONGODB_URI = "mongodb://localhost:27017/test"; // Dummy URI (we use MongoDB Memory Server instead)

