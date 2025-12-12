/**
 * SupplierService
 *
 * Handles all business logic related to suppliers.
 * Suppliers are vendors referenced by products.
 */

import connectDB from "../db/connect.js";
import Supplier from "../models/Supplier.js";
import Product from "../models/Product.js";
import { createError } from "../utils/errorFactory.js";
import { validateSupplier } from "../utils/validators.js";

class SupplierService {
  /**
   * Create a new supplier
   * @param {Object} data - Supplier data
   * @param {string} data.name - Supplier name
   * @param {string} data.phone - Phone number (optional)
   * @param {string} data.notes - Notes (optional)
   * @returns {Promise<Object>} Created supplier
   * @throws {Error} If validation fails
   */
  static async createSupplier(data) {
    await connectDB();

    if (
      !data.name ||
      typeof data.name !== "string" ||
      data.name.trim().length === 0
    ) {
      throw createError("Supplier name is required", "VALIDATION_ERROR");
    }

    const supplierData = {
      name: data.name.trim(),
      phone: data.phone ? data.phone.trim() : undefined,
      notes: data.notes ? data.notes.trim() : undefined,
    };

    const supplier = new Supplier(supplierData);
    await supplier.save();

    // Update firstTransactionDate if not set
    if (!supplier.firstTransactionDate) {
      supplier.firstTransactionDate = new Date();
      await supplier.save();
    }

    return supplier;
  }

  /**
   * Update a supplier
   * @param {string} id - Supplier ID
   * @param {Object} data - Update data
   * @param {string} data.name - New supplier name
   * @param {string} data.phone - New phone number
   * @param {string} data.notes - New notes
   * @returns {Promise<Object>} Updated supplier
   * @throws {Error} If supplier not found or validation fails
   */
  static async updateSupplier(id, data) {
    await connectDB();

    const supplier = await validateSupplier(id);

    if (data.name !== undefined) {
      if (typeof data.name !== "string" || data.name.trim().length === 0) {
        throw createError("Supplier name cannot be empty", "VALIDATION_ERROR");
      }
      supplier.name = data.name.trim();
    }

    if (data.phone !== undefined) {
      supplier.phone = data.phone ? data.phone.trim() : undefined;
    }

    if (data.notes !== undefined) {
      supplier.notes = data.notes ? data.notes.trim() : undefined;
    }

    await supplier.save();
    return supplier;
  }

  /**
   * Delete a supplier
   * @param {string} id - Supplier ID
   * @returns {Promise<Object>} Success message
   * @throws {Error} If supplier not found or has products
   */
  static async deleteSupplier(id) {
    await connectDB();

    const supplier = await validateSupplier(id);

    // Check for products (hook will also check, but we check here for better error message)
    const productCount = await Product.countDocuments({ supplier: id });
    if (productCount > 0) {
      throw createError(
        "Cannot delete supplier with products",
        "SUPPLIER_IN_USE",
        409
      );
    }

    // Delete supplier (hook will also validate)
    await supplier.deleteOne();

    return { message: "Supplier deleted successfully" };
  }

  /**
   * Get all suppliers
   * @returns {Promise<Array>} Array of suppliers
   */
  static async getSuppliers() {
    await connectDB();

    const suppliers = await Supplier.find().sort({ name: 1 });
    return suppliers;
  }

  /**
   * Get supplier by ID
   * @param {string} id - Supplier ID
   * @returns {Promise<Object>} Supplier
   * @throws {Error} If supplier not found
   */
  static async getSupplierById(id) {
    await connectDB();

    return await validateSupplier(id);
  }
}

export default SupplierService;
