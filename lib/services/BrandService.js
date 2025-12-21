/**
 * BrandService
 *
 * Handles all business logic related to brands.
 * Brands are manufacturers referenced by products.
 */

import Brand from "../models/Brand.js";
import Product from "../models/Product.js";
import { createError } from "../utils/errorFactory.js";
import { validateBrand } from "../utils/validators.js";

class BrandService {
  /**
   * Create a new brand
   * @param {Object} data - Brand data
   * @param {string} data.name - Brand name
   * @returns {Promise<Object>} Created brand
   * @throws {Error} If validation fails or brand already exists
   */
  static async createBrand(data) {
    if (
      !data.name ||
      typeof data.name !== "string" ||
      data.name.trim().length === 0
    ) {
      throw createError("Le nom de la marque est requis", "VALIDATION_ERROR");
    }

    try {
      const brand = new Brand({ name: data.name.trim() });
      await brand.save();
      return brand;
    } catch (error) {
      if (error.code === 11000) {
        // Duplicate key error
        throw createError(
          "Brand with this name already exists",
          "DUPLICATE_BRAND",
          409
        );
      }
      throw error;
    }
  }

  /**
   * Update a brand
   * @param {string} id - Brand ID
   * @param {Object} data - Update data
   * @param {string} data.name - New brand name
   * @returns {Promise<Object>} Updated brand
   * @throws {Error} If brand not found or validation fails
   */
  static async updateBrand(id, data) {
    const brand = await validateBrand(id);

    if (data.name !== undefined) {
      if (typeof data.name !== "string" || data.name.trim().length === 0) {
        throw createError("Le nom de la marque ne peut pas être vide", "VALIDATION_ERROR");
      }
      brand.name = data.name.trim();
    }

    try {
      await brand.save();
      return brand;
    } catch (error) {
      if (error.code === 11000) {
        throw createError(
          "Brand with this name already exists",
          "DUPLICATE_BRAND",
          409
        );
      }
      throw error;
    }
  }

  /**
   * Delete a brand
   * @param {string} id - Brand ID
   * @returns {Promise<Object>} Success message
   * @throws {Error} If brand not found or has products
   */
  static async deleteBrand(id) {
    const brand = await validateBrand(id);

    // Check for products (hook will also check, but we check here for better error message)
    const productCount = await Product.countDocuments({ brand: id });
    if (productCount > 0) {
      throw createError(
        "Cannot delete brand with products",
        "BRAND_IN_USE",
        409
      );
    }

    // Delete brand (hook will also validate)
    await brand.deleteOne();

    return { message: "Brand deleted successfully" };
  }

  /**
   * Get brands with optional pagination, sorting, and search
   * @param {Object} [options] - Query options
   * @param {number} [options.page=1] - Page number
   * @param {number} [options.limit=20] - Items per page
   * @param {string} [options.sortBy="name"] - Sort field
   * @param {string} [options.sortOrder="asc"] - Sort order ("asc" | "desc")
   * @param {string} [options.search] - Optional search term for brand name
   * @returns {Promise<Object>} { data: Array, pagination: Object }
   */
  static async getBrands(options = {}) {
    const {
      page = 1,
      limit = 20,
      sortBy = "name",
      sortOrder = "asc",
      search,
    } = options;

    // Build query
    const query = {};
    if (search && typeof search === "string" && search.trim().length > 0) {
      query.name = {
        $regex: search.trim(),
        $options: "i", // case-insensitive
      };
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
    const total = await Brand.countDocuments(query);

    // Fetch brands with pagination and sorting
    const brands = await Brand.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .lean();

    const totalPages = Math.ceil(total / limit);

    return {
      data: brands.map((brand) => ({
        ...brand,
        id: brand._id.toString(),
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
   * Get brand by ID
   * @param {string} id - Brand ID
   * @returns {Promise<Object>} Brand
   * @throws {Error} If brand not found
   */
  static async getBrandById(id) {
    return await validateBrand(id);
  }
}

export default BrandService;
