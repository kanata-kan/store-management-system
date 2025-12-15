/**
 * SubCategoryService
 *
 * Handles all business logic related to subcategories.
 * Subcategories belong to categories and contain products.
 */

import connectDB from "../db/connect.js";
import SubCategory from "../models/SubCategory.js";
import Product from "../models/Product.js";
import { createError } from "../utils/errorFactory.js";
import { subCategoryPopulateConfig } from "../utils/populateConfigs.js";
import { validateCategory, validateSubCategory } from "../utils/validators.js";

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
      throw createError(
        "Missing required fields: name, categoryId",
        "VALIDATION_ERROR"
      );
    }

    // Validate category exists
    await validateCategory(data.categoryId);

    try {
      const subCategory = new SubCategory({
        name: data.name.trim(),
        category: data.categoryId,
      });
      await subCategory.save();

      // Populate and return
      const populated = await SubCategory.findById(subCategory._id).populate(
        subCategoryPopulateConfig
      );

      return populated;
    } catch (error) {
      if (error.code === 11000) {
        // Duplicate key error (compound unique index)
        throw createError(
          "SubCategory with this name already exists in this category",
          "DUPLICATE_SUBCATEGORY",
          409
        );
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

    const subCategory = await validateSubCategory(id);

    // Validate category if provided
    if (data.categoryId) {
      await validateCategory(data.categoryId);
      subCategory.category = data.categoryId;
    }

    if (data.name !== undefined) {
      if (typeof data.name !== "string" || data.name.trim().length === 0) {
        throw createError(
          "SubCategory name cannot be empty",
          "VALIDATION_ERROR"
        );
      }
      subCategory.name = data.name.trim();
    }

    try {
      await subCategory.save();

      // Populate and return
      const populated = await SubCategory.findById(subCategory._id).populate(
        subCategoryPopulateConfig
      );

      return populated;
    } catch (error) {
      if (error.code === 11000) {
        throw createError(
          "SubCategory with this name already exists in this category",
          "DUPLICATE_SUBCATEGORY",
          409
        );
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

    const subCategory = await validateSubCategory(id);

    // Check for products (hook will also check, but we check here for better error message)
    const productCount = await Product.countDocuments({ subCategory: id });
    if (productCount > 0) {
      throw createError(
        "Cannot delete subcategory with products",
        "SUBCATEGORY_IN_USE",
        409
      );
    }

    // Delete subcategory (hook will also validate)
    await subCategory.deleteOne();

    return { message: "SubCategory deleted successfully" };
  }

  /**
   * Get subcategories with pagination and sorting
   * @param {Object} [options] - Query options
   * @param {number} [options.page=1] - Page number
   * @param {number} [options.limit=20] - Items per page
   * @param {string} [options.sortBy="name"] - Sort field
   * @param {string} [options.sortOrder="asc"] - Sort order ("asc" | "desc")
   * @param {string} [options.categoryId] - Optional category ID to filter by
   * @returns {Promise<Object>} { data: Array, pagination: Object }
   */
  static async getSubCategories(options = {}) {
    await connectDB();

    const {
      page = 1,
      limit = 20,
      sortBy = "name",
      sortOrder = "asc",
      categoryId = null,
    } = options;

    // Build query
    const query = {};
    if (categoryId) {
      query.category = categoryId;
    }

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
    const total = await SubCategory.countDocuments(query);

    // Fetch subcategories with pagination, sorting, and population
    const subCategories = await SubCategory.find(query)
      .populate(subCategoryPopulateConfig)
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .lean();

    // Format data for response
    const formattedData = subCategories.map((subCategory) => ({
      ...subCategory,
      id: subCategory._id.toString(),
      categoryName: subCategory.category?.name || "-",
      categoryId: subCategory.category?._id?.toString() || subCategory.category?.toString() || null,
    }));

    const totalPages = Math.ceil(total / limit);

    return {
      data: formattedData,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
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
      subCategoryPopulateConfig
    );

    if (!subCategory) {
      throw createError("SubCategory not found", "SUBCATEGORY_NOT_FOUND", 404);
    }

    return subCategory;
  }
}

export default SubCategoryService;
