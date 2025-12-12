/**
 * BrandService
 *
 * Handles all business logic related to brands.
 * Brands are manufacturers referenced by products.
 */

import connectDB from "../db/connect.js";
import Brand from "../models/Brand.js";
import Product from "../models/Product.js";

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
      const error = new Error("Brand name is required");
      error.code = "VALIDATION_ERROR";
      throw error;
    }

    try {
      const brand = new Brand({ name: data.name.trim() });
      await brand.save();
      return brand;
    } catch (error) {
      if (error.code === 11000) {
        // Duplicate key error
        const duplicateError = new Error("Brand with this name already exists");
        duplicateError.code = "DUPLICATE_BRAND";
        throw duplicateError;
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

    const brand = await Brand.findById(id);
    if (!brand) {
      const error = new Error("Brand not found");
      error.code = "BRAND_NOT_FOUND";
      throw error;
    }

    if (data.name !== undefined) {
      if (typeof data.name !== "string" || data.name.trim().length === 0) {
        const error = new Error("Brand name cannot be empty");
        error.code = "VALIDATION_ERROR";
        throw error;
      }
      brand.name = data.name.trim();
    }

    try {
      await brand.save();
      return brand;
    } catch (error) {
      if (error.code === 11000) {
        const duplicateError = new Error("Brand with this name already exists");
        duplicateError.code = "DUPLICATE_BRAND";
        throw duplicateError;
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

    const brand = await Brand.findById(id);
    if (!brand) {
      const error = new Error("Brand not found");
      error.code = "BRAND_NOT_FOUND";
      throw error;
    }

    // Check for products (hook will also check, but we check here for better error message)
    const productCount = await Product.countDocuments({ brand: id });
    if (productCount > 0) {
      const error = new Error("Cannot delete brand with products");
      error.code = "BRAND_IN_USE";
      throw error;
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

    const brand = await Brand.findById(id);
    if (!brand) {
      const error = new Error("Brand not found");
      error.code = "BRAND_NOT_FOUND";
      throw error;
    }

    return brand;
  }
}

export default BrandService;
