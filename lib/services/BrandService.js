/**
 * BrandService
 *
 * Handles all business logic related to brands.
 * Brands are manufacturers referenced by products.
 */

import connectDB from "../db/connect.js";
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
    await connectDB();

    if (
      !data.name ||
      typeof data.name !== "string" ||
      data.name.trim().length === 0
    ) {
      throw createError("Brand name is required", "VALIDATION_ERROR");
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
    await connectDB();

    const brand = await validateBrand(id);

    if (data.name !== undefined) {
      if (typeof data.name !== "string" || data.name.trim().length === 0) {
        throw createError("Brand name cannot be empty", "VALIDATION_ERROR");
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
    await connectDB();

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
   * Get all brands
   * @returns {Promise<Array>} Array of brands
   */
  static async getBrands() {
    await connectDB();

    const brands = await Brand.find().sort({ name: 1 });
    return brands;
  }

  /**
   * Get brand by ID
   * @param {string} id - Brand ID
   * @returns {Promise<Object>} Brand
   * @throws {Error} If brand not found
   */
  static async getBrandById(id) {
    await connectDB();

    return await validateBrand(id);
  }
}

export default BrandService;
