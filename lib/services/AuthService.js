/**
 * AuthService
 *
 * Handles all business logic related to authentication and authorization.
 * Manages user login, password verification, and session management.
 */

import connectDB from "../db/connect.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { createError } from "../utils/errorFactory.js";
import { validateUser } from "../utils/validators.js";

const DEFAULT_JWT_SECRET = "your-secret-key-change-in-production";
const JWT_SECRET = process.env.JWT_SECRET || DEFAULT_JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d"; // 1 day default (reduced from 7d)

// Validate JWT_SECRET configuration
if (JWT_SECRET === DEFAULT_JWT_SECRET) {
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "CRITICAL SECURITY ERROR: JWT_SECRET is using default value in production. " +
      "This is a severe security vulnerability. " +
      "Set JWT_SECRET environment variable with a strong random secret (min 32 characters)."
    );
  } else {
    console.warn(
      "⚠️ WARNING: JWT_SECRET is using default value. " +
      "This should NEVER be used in production. " +
      "Set JWT_SECRET environment variable."
    );
  }
}

// Validate JWT_SECRET strength
if (JWT_SECRET.length < 32) {
  throw new Error(
    `JWT_SECRET must be at least 32 characters long for security. ` +
    `Current length: ${JWT_SECRET.length}. ` +
    `Generate a strong secret with: openssl rand -base64 32`
  );
}

class AuthService {
  /**
   * Login user
   * Validates credentials and creates JWT session token
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} User data and token
   * @throws {Error} If credentials are invalid
   */
  static async login(email, password) {
    await connectDB();

    if (!email || !password) {
      throw createError("Email and password are required", "VALIDATION_ERROR");
    }

    // Find user by email (include passwordHash)
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select("+passwordHash");

    if (!user) {
      throw createError("Invalid email or password", "INVALID_CREDENTIALS", 401);
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw createError("Invalid email or password", "INVALID_CREDENTIALS", 401);
    }

    // Create JWT token
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        role: user.role,
      },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRES_IN,
      }
    );

    // Return user data (without passwordHash)
    // Convert ObjectId to string for proper serialization
    const userData = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      isSuspended: user.isSuspended || false,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return {
      user: userData,
      token,
    };
  }

  /**
   * Verify password for a user
   * @param {Object} user - User document
   * @param {string} password - Password to verify
   * @returns {Promise<boolean>} True if password is valid
   */
  static async verifyPassword(user, password) {
    if (!user || !password) {
      return false;
    }

    // Ensure passwordHash is available
    let userWithPassword = user;
    if (!user.passwordHash) {
      userWithPassword = await User.findById(user._id).select("+passwordHash");
      if (!userWithPassword) {
        return false;
      }
    }

    return await userWithPassword.comparePassword(password);
  }

  /**
   * Get user from session token
   * Verifies JWT token and returns user data
   * @param {string} token - JWT token
   * @returns {Promise<Object>} User data
   * @throws {Error} If token is invalid or expired
   */
  static async getUserFromSession(token) {
    await connectDB();

    if (!token) {
      throw createError("Session token is required", "UNAUTHORIZED", 401);
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);

      // Get user from database
      const user = await validateUser(decoded.userId);

      // Return user data (without passwordHash)
      // Convert ObjectId to string for proper serialization
      return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        isSuspended: user.isSuspended || false,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    } catch (error) {
      if (
        error.name === "JsonWebTokenError" ||
        error.name === "TokenExpiredError"
      ) {
        throw createError("Invalid or expired session", "SESSION_EXPIRED", 401);
      }
      throw error;
    }
  }

  /**
   * Logout user
   * In a stateless JWT system, logout is handled client-side by removing the token.
   * This method exists for consistency and potential future server-side session management.
   * @returns {Promise<Object>} Success message
   */
  static async logout() {
    // In a stateless JWT system, logout is handled client-side
    // Server doesn't need to do anything, but we provide this method for consistency
    return { message: "Logged out successfully" };
  }
}

export default AuthService;
