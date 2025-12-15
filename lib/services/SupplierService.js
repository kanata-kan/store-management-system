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
   * @param {string} [data.email] - Supplier email (optional)
   * @param {string} [data.phone] - Phone number (optional)
   * @param {string} [data.address] - Address (optional)
   * @param {string} [data.notes] - Notes (optional, legacy)
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
      email: data.email ? data.email.trim().toLowerCase() : undefined,
      phone: data.phone ? data.phone.trim() : undefined,
      address: data.address ? data.address.trim() : undefined,
      // Legacy notes field, kept for backward compatibility
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
   * @param {string} [data.name] - New supplier name
   * @param {string} [data.email] - New supplier email
   * @param {string} [data.phone] - New phone number
   * @param {string} [data.address] - New address
   * @param {string} [data.notes] - New notes (legacy)
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

    if (data.email !== undefined) {
      supplier.email = data.email ? data.email.trim().toLowerCase() : undefined;
    }

    if (data.phone !== undefined) {
      supplier.phone = data.phone ? data.phone.trim() : undefined;
    }

    if (data.address !== undefined) {
      supplier.address = data.address ? data.address.trim() : undefined;
    }

    // Legacy notes
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
   * Get suppliers with optional pagination, sorting, and search
   * @param {Object} [options] - Query options
   * @param {number} [options.page=1] - Page number
   * @param {number} [options.limit=20] - Items per page
   * @param {string} [options.sortBy="name"] - Sort field
   * @param {string} [options.sortOrder="asc"] - Sort order ("asc" | "desc")
   * @param {string} [options.search] - Optional search term (name/email)
   * @returns {Promise<Object>} { data: Array, pagination: Object }
   */
  static async getSuppliers(options = {}) {
    await connectDB();

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
      const term = search.trim();
      query.$or = [
        { name: { $regex: term, $options: "i" } },
        { email: { $regex: term, $options: "i" } },
      ];
    }

    // Build sort object
    const sortObj = {};
    const validSortFields = ["name", "email", "createdAt"];
    const validSortOrder = ["asc", "desc"];

    const sortField = validSortFields.includes(sortBy) ? sortBy : "name";
    const sortDirection = validSortOrder.includes(sortOrder) ? sortOrder : "asc";
    sortObj[sortField] = sortDirection === "asc" ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count
    const total = await Supplier.countDocuments(query);

    // Fetch suppliers with pagination and sorting
    const suppliers = await Supplier.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .lean();

    const totalPages = Math.ceil(total / limit);

    return {
      data: suppliers.map((supplier) => ({
        ...supplier,
        id: supplier._id.toString(),
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
