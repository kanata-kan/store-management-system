/**
 * CategoryService
 *
 * Handles all business logic related to categories.
 * Categories are top-level classifications for products.
 */

import connectDB from "../db/connect.js";
import Category from "../models/Category.js";
import SubCategory from "../models/SubCategory.js";

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
      const error = new Error("Category name is required");
      error.code = "VALIDATION_ERROR";
      throw error;
    }

    try {
      const category = new Category({ name: data.name.trim() });
      await category.save();
      return category;
    } catch (error) {
      if (error.code === 11000) {
        // Duplicate key error
        const duplicateError = new Error(
          "Category with this name already exists"
        );
        duplicateError.code = "DUPLICATE_CATEGORY";
        throw duplicateError;
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

    const category = await Category.findById(id);
    if (!category) {
      const error = new Error("Category not found");
      error.code = "CATEGORY_NOT_FOUND";
      throw error;
    }

    if (data.name !== undefined) {
      if (typeof data.name !== "string" || data.name.trim().length === 0) {
        const error = new Error("Category name cannot be empty");
        error.code = "VALIDATION_ERROR";
        throw error;
      }
      category.name = data.name.trim();
    }

    try {
      await category.save();
      return category;
    } catch (error) {
      if (error.code === 11000) {
        const duplicateError = new Error(
          "Category with this name already exists"
        );
        duplicateError.code = "DUPLICATE_CATEGORY";
        throw duplicateError;
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

    const category = await Category.findById(id);
    if (!category) {
      const error = new Error("Category not found");
      error.code = "CATEGORY_NOT_FOUND";
      throw error;
    }

    // Check for subcategories (hook will also check, but we check here for better error message)
    const subCategoryCount = await SubCategory.countDocuments({ category: id });
    if (subCategoryCount > 0) {
      const error = new Error("Cannot delete category with subcategories");
      error.code = "CATEGORY_IN_USE";
      throw error;
    }

    // Delete category (hook will also validate)
    await category.deleteOne();

    return { message: "Category deleted successfully" };
  }

  /**
   * Get all categories
   * @returns {Promise<Array>} Array of categories
   */
  static async getCategories() {
    await connectDB();

    const categories = await Category.find().sort({ name: 1 });
    return categories;
  }

  /**
   * Get category by ID
   * @param {string} id - Category ID
   * @returns {Promise<Object>} Category
   * @throws {Error} If category not found
   */
  static async getCategoryById(id) {
    await connectDB();

    const category = await Category.findById(id);
    if (!category) {
      const error = new Error("Category not found");
      error.code = "CATEGORY_NOT_FOUND";
      throw error;
    }

    return category;
  }
}

export default CategoryService;
