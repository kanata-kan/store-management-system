/**
 * UserService
 *
 * Handles all business logic related to users.
 * Users are system users (managers or cashiers) with authentication.
 */

import connectDB from "../db/connect.js";
import User from "../models/User.js";
import Sale from "../models/Sale.js";
import { createError } from "../utils/errorFactory.js";
import { validateUser } from "../utils/validators.js";

class UserService {
  /**
   * Create a new user
   * @param {Object} data - User data
   * @param {string} data.name - User name
   * @param {string} data.email - User email (must be unique)
   * @param {string} data.password - User password (will be hashed)
   * @param {string} data.role - User role ("manager" | "cashier")
   * @returns {Promise<Object>} Created user (without passwordHash)
   * @throws {Error} If validation fails or email already exists
   */
  static async createUser(data) {
    await connectDB();

    // Validate required fields
    if (!data.name || typeof data.name !== "string" || data.name.trim().length === 0) {
      throw createError("User name is required", "VALIDATION_ERROR");
    }

    if (!data.email || typeof data.email !== "string" || data.email.trim().length === 0) {
      throw createError("User email is required", "VALIDATION_ERROR");
    }

    if (!data.password || typeof data.password !== "string" || data.password.length < 6) {
      throw createError("Password must be at least 6 characters", "VALIDATION_ERROR");
    }

    if (!data.role || !["manager", "cashier"].includes(data.role)) {
      throw createError("Role must be 'manager' or 'cashier'", "VALIDATION_ERROR");
    }

    // Check if email already exists
    const existingUser = await User.findOne({
      email: data.email.toLowerCase().trim(),
    });

    if (existingUser) {
      throw createError("Email already exists", "DUPLICATE_EMAIL", 409);
    }

    try {
      const user = new User({
        name: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        passwordHash: data.password, // Will be hashed by pre-save hook
        role: data.role,
      });

      await user.save();

      // Return user without passwordHash
      const userObj = user.toObject();
      delete userObj.passwordHash;
      return userObj;
    } catch (error) {
      if (error.code === 11000) {
        // Duplicate key error (email unique index)
        throw createError("Email already exists", "DUPLICATE_EMAIL", 409);
      }
      throw error;
    }
  }

  /**
   * Update a user
   * @param {string} id - User ID
   * @param {Object} data - Update data
   * @param {string} [data.name] - New user name
   * @param {string} [data.email] - New user email
   * @param {string} [data.password] - New password (optional, will be hashed)
   * @param {string} [data.role] - New role ("manager" | "cashier")
   * @returns {Promise<Object>} Updated user (without passwordHash)
   * @throws {Error} If user not found or validation fails
   */
  static async updateUser(id, data) {
    await connectDB();

    const user = await validateUser(id);

    if (data.name !== undefined) {
      if (typeof data.name !== "string" || data.name.trim().length === 0) {
        throw createError("User name cannot be empty", "VALIDATION_ERROR");
      }
      user.name = data.name.trim();
    }

    if (data.email !== undefined) {
      if (typeof data.email !== "string" || data.email.trim().length === 0) {
        throw createError("User email cannot be empty", "VALIDATION_ERROR");
      }

      const newEmail = data.email.toLowerCase().trim();

      // Check if email is being changed and if new email already exists
      if (newEmail !== user.email) {
        const existingUser = await User.findOne({ email: newEmail });
        if (existingUser) {
          throw createError("Email already exists", "DUPLICATE_EMAIL", 409);
        }
      }

      user.email = newEmail;
    }

    if (data.password !== undefined) {
      if (typeof data.password !== "string" || data.password.length < 6) {
        throw createError("Password must be at least 6 characters", "VALIDATION_ERROR");
      }
      // Password will be hashed by pre-save hook
      user.passwordHash = data.password;
    }

    if (data.role !== undefined) {
      if (!["manager", "cashier"].includes(data.role)) {
        throw createError("Role must be 'manager' or 'cashier'", "VALIDATION_ERROR");
      }
      user.role = data.role;
    }

    try {
      await user.save();

      // Return user without passwordHash
      const userObj = user.toObject();
      delete userObj.passwordHash;
      return userObj;
    } catch (error) {
      if (error.code === 11000) {
        throw createError("Email already exists", "DUPLICATE_EMAIL", 409);
      }
      throw error;
    }
  }

  /**
   * Delete a user
   * @param {string} id - User ID to delete
   * @param {string} currentUserId - ID of user performing the deletion
   * @returns {Promise<Object>} Success message
   * @throws {Error} If user not found, attempting self-deletion, or has related sales
   */
  static async deleteUser(id, currentUserId) {
    await connectDB();

    const user = await validateUser(id);

    // Prevent self-deletion
    if (id === currentUserId) {
      throw createError("Cannot delete your own account", "CANNOT_DELETE_SELF", 403);
    }

    // Optional: Check if user has related sales
    // This prevents deletion of users with sales history for audit purposes
    const saleCount = await Sale.countDocuments({ cashier: id });
    if (saleCount > 0) {
      throw createError(
        "Cannot delete user with sales history",
        "USER_HAS_SALES",
        409
      );
    }

    // Delete user
    await user.deleteOne();

    return { message: "User deleted successfully" };
  }

  /**
   * Get users with optional pagination, sorting, search, and role filter
   * @param {Object} [options] - Query options
   * @param {number} [options.page=1] - Page number
   * @param {number} [options.limit=20] - Items per page
   * @param {string} [options.sortBy="name"] - Sort field
   * @param {string} [options.sortOrder="asc"] - Sort order ("asc" | "desc")
   * @param {string} [options.search] - Optional search term (name/email)
   * @param {string} [options.role] - Optional role filter ("manager" | "cashier")
   * @returns {Promise<Object>} { data: Array, pagination: Object }
   */
  static async getUsers(options = {}) {
    await connectDB();

    const {
      page = 1,
      limit = 20,
      sortBy = "name",
      sortOrder = "asc",
      search,
      role,
    } = options;

    // Build query
    const query = {};

    // Role filter
    if (role && ["manager", "cashier"].includes(role)) {
      query.role = role;
    }

    // Search filter (name or email)
    if (search && typeof search === "string" && search.trim().length > 0) {
      const term = search.trim();
      query.$or = [
        { name: { $regex: term, $options: "i" } },
        { email: { $regex: term, $options: "i" } },
      ];
    }

    // Build sort object
    const sortObj = {};
    const validSortFields = ["name", "email", "role", "createdAt"];
    const validSortOrder = ["asc", "desc"];

    const sortField = validSortFields.includes(sortBy) ? sortBy : "name";
    const sortDirection = validSortOrder.includes(sortOrder) ? sortOrder : "asc";
    sortObj[sortField] = sortDirection === "asc" ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count
    const total = await User.countDocuments(query);

    // Fetch users with pagination and sorting (exclude passwordHash)
    const users = await User.find(query)
      .select("-passwordHash") // Never return passwordHash
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .lean();

    const totalPages = Math.ceil(total / limit);

    return {
      data: users.map((user) => ({
        ...user,
        id: user._id.toString(),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Get user by ID
   * @param {string} id - User ID
   * @returns {Promise<Object>} User (without passwordHash)
   * @throws {Error} If user not found
   */
  static async getUserById(id) {
    await connectDB();

    const user = await validateUser(id);

    // Return user without passwordHash
    const userObj = user.toObject();
    delete userObj.passwordHash;
    return userObj;
  }
}

export default UserService;

