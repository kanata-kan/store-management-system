/**
 * SubCategoryService
 *
 * Handles all business logic related to subcategories.
 * Subcategories belong to categories and contain products.
 */

import connectDB from "../db/connect.js";
import SubCategory from "../models/SubCategory.js";
import Category from "../models/Category.js";
import Product from "../models/Product.js";

class SubCategoryService {
  /**
   * Create a new subcategory
   * @param {Object} data - SubCategory data
   * @param {string} data.name - SubCategory name
   * @param {string} data.categoryId - Category ID
   * @returns {Promise<Object>} Created subcategory with populated category
   * @throws {Error} If validation fails or category doesn't exist
   */
  static async createSubCategory(data) {
    await connectDB();

    if (!data.name || !data.categoryId) {
      const error = new Error("Missing required fields: name, categoryId");
      error.code = "VALIDATION_ERROR";
      throw error;
    }

    // Validate category exists
    const category = await Category.findById(data.categoryId);
    if (!category) {
      const error = new Error("Category not found");
      error.code = "CATEGORY_NOT_FOUND";
      throw error;
    }

    try {
      const subCategory = new SubCategory({
        name: data.name.trim(),
        category: data.categoryId,
      });
      await subCategory.save();

      // Populate and return
      const populated = await SubCategory.findById(subCategory._id).populate(
        "category",
        "name"
      );

      return populated;
    } catch (error) {
      if (error.code === 11000) {
        // Duplicate key error (compound unique index)
        const duplicateError = new Error(
          "SubCategory with this name already exists in this category"
        );
        duplicateError.code = "DUPLICATE_SUBCATEGORY";
        throw duplicateError;
      }
      throw error;
    }
  }

  /**
   * Update a subcategory
   * @param {string} id - SubCategory ID
   * @param {Object} data - Update data
   * @param {string} data.name - New subcategory name
   * @param {string} data.categoryId - New category ID
   * @returns {Promise<Object>} Updated subcategory with populated category
   * @throws {Error} If subcategory not found or validation fails
   */
  static async updateSubCategory(id, data) {
    await connectDB();

    const subCategory = await SubCategory.findById(id);
    if (!subCategory) {
      const error = new Error("SubCategory not found");
      error.code = "SUBCATEGORY_NOT_FOUND";
      throw error;
    }

    // Validate category if provided
    if (data.categoryId) {
      const category = await Category.findById(data.categoryId);
      if (!category) {
        const error = new Error("Category not found");
        error.code = "CATEGORY_NOT_FOUND";
        throw error;
      }
      subCategory.category = data.categoryId;
    }

    if (data.name !== undefined) {
      if (typeof data.name !== "string" || data.name.trim().length === 0) {
        const error = new Error("SubCategory name cannot be empty");
        error.code = "VALIDATION_ERROR";
        throw error;
      }
      subCategory.name = data.name.trim();
    }

    try {
      await subCategory.save();

      // Populate and return
      const populated = await SubCategory.findById(subCategory._id).populate(
        "category",
        "name"
      );

      return populated;
    } catch (error) {
      if (error.code === 11000) {
        const duplicateError = new Error(
          "SubCategory with this name already exists in this category"
        );
        duplicateError.code = "DUPLICATE_SUBCATEGORY";
        throw duplicateError;
      }
      throw error;
    }
  }

  /**
   * Delete a subcategory
   * @param {string} id - SubCategory ID
   * @returns {Promise<Object>} Success message
   * @throws {Error} If subcategory not found or has products
   */
  static async deleteSubCategory(id) {
    await connectDB();

    const subCategory = await SubCategory.findById(id);
    if (!subCategory) {
      const error = new Error("SubCategory not found");
      error.code = "SUBCATEGORY_NOT_FOUND";
      throw error;
    }

    // Check for products (hook will also check, but we check here for better error message)
    const productCount = await Product.countDocuments({ subCategory: id });
    if (productCount > 0) {
      const error = new Error("Cannot delete subcategory with products");
      error.code = "SUBCATEGORY_IN_USE";
      throw error;
    }

    // Delete subcategory (hook will also validate)
    await subCategory.deleteOne();

    return { message: "SubCategory deleted successfully" };
  }

  /**
   * Get subcategories
   * @param {string} categoryId - Optional category ID to filter by
   * @returns {Promise<Array>} Array of subcategories
   */
  static async getSubCategories(categoryId = null) {
    await connectDB();

    const query = {};
    if (categoryId) {
      query.category = categoryId;
    }

    const subCategories = await SubCategory.find(query)
      .populate("category", "name")
      .sort({ name: 1 });

    return subCategories;
  }

  /**
   * Get subcategory by ID
   * @param {string} id - SubCategory ID
   * @returns {Promise<Object>} SubCategory with populated category
   * @throws {Error} If subcategory not found
   */
  static async getSubCategoryById(id) {
    await connectDB();

    const subCategory = await SubCategory.findById(id).populate(
      "category",
      "name"
    );

    if (!subCategory) {
      const error = new Error("SubCategory not found");
      error.code = "SUBCATEGORY_NOT_FOUND";
      throw error;
    }

    return subCategory;
  }
}

export default SubCategoryService;
