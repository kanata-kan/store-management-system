/**
 * CategoryService
 *
 * Handles all business logic related to categories.
 * Categories are top-level classifications for products.
 */

import mongoose from "mongoose";
import connectDB from "../db/connect.js";
import Category from "../models/Category.js";
import SubCategory from "../models/SubCategory.js";
import { createError } from "../utils/errorFactory.js";
import { validateCategory } from "../utils/validators.js";

class CategoryService {
  /**
   * Create a new category
   * @param {Object} data - Category data
   * @param {string} data.name - Category name
   * @returns {Promise<Object>} Created category
   * @throws {Error} If validation fails or category already exists
   */
  static async createCategory(data) {
    await connectDB();

    if (
      !data.name ||
      typeof data.name !== "string" ||
      data.name.trim().length === 0
    ) {
      throw createError("Category name is required", "VALIDATION_ERROR");
    }

    try {
      const category = new Category({ name: data.name.trim() });
      await category.save();
      return category;
    } catch (error) {
      if (error.code === 11000) {
        // Duplicate key error
        throw createError(
          "Category with this name already exists",
          "DUPLICATE_CATEGORY",
          409
        );
      }
      throw error;
    }
  }

  /**
   * Update a category
   * @param {string} id - Category ID
   * @param {Object} data - Update data
   * @param {string} data.name - New category name
   * @returns {Promise<Object>} Updated category
   * @throws {Error} If category not found or validation fails
   */
  static async updateCategory(id, data) {
    await connectDB();

    const category = await validateCategory(id);

    if (data.name !== undefined) {
      if (typeof data.name !== "string" || data.name.trim().length === 0) {
        throw createError(
          "Category name cannot be empty",
          "VALIDATION_ERROR"
        );
      }
      category.name = data.name.trim();
    }

    try {
      await category.save();
      return category;
    } catch (error) {
      if (error.code === 11000) {
        throw createError(
          "Category with this name already exists",
          "DUPLICATE_CATEGORY",
          409
        );
      }
      throw error;
    }
  }

  /**
   * Delete a category
   * @param {string} id - Category ID
   * @returns {Promise<Object>} Success message
   * @throws {Error} If category not found or has subcategories
   */
  static async deleteCategory(id) {
    await connectDB();

    const category = await validateCategory(id);

    // Check for subcategories (hook will also check, but we check here for better error message)
    const subCategoryCount = await SubCategory.countDocuments({ category: id });
    if (subCategoryCount > 0) {
      throw createError(
        "Cannot delete category with subcategories",
        "CATEGORY_IN_USE",
        409
      );
    }

    // Delete category (hook will also validate)
    await category.deleteOne();

    return { message: "Category deleted successfully" };
  }

  /**
   * Get all categories with pagination and sorting
   * @param {Object} [options] - Query options
   * @param {number} [options.page=1] - Page number
   * @param {number} [options.limit=20] - Items per page
   * @param {string} [options.sortBy="name"] - Sort field
   * @param {string} [options.sortOrder="asc"] - Sort order ("asc" | "desc")
   * @returns {Promise<Object>} { data: Array, pagination: Object }
   */
  static async getCategories(options = {}) {
    await connectDB();

    const {
      page = 1,
      limit = 20,
      sortBy = "name",
      sortOrder = "asc",
    } = options;

    // Build sort object
    const sortObj = {};
    const validSortFields = ["name", "createdAt"];
    const validSortOrder = ["asc", "desc"];

    const sortField = validSortFields.includes(sortBy) ? sortBy : "name";
    const sortDirection = validSortOrder.includes(sortOrder) ? sortOrder : "asc";
    sortObj[sortField] = sortDirection === "asc" ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count
    const total = await Category.countDocuments();

    // Fetch categories with pagination and sorting
    const categories = await Category.find()
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .lean();

    // Populate subcategories count for each category
    const SubCategory = mongoose.model("SubCategory");
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const subCategoriesCount = await SubCategory.countDocuments({
          category: category._id,
        });
        return {
          ...category,
          id: category._id.toString(),
          subCategoriesCount,
        };
      })
    );

    const totalPages = Math.ceil(total / limit);

    return {
      data: categoriesWithCounts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Get category by ID
   * @param {string} id - Category ID
   * @returns {Promise<Object>} Category
   * @throws {Error} If category not found
   */
  static async getCategoryById(id) {
    await connectDB();

    return await validateCategory(id);
  }
}

export default CategoryService;
