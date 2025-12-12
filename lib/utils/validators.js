/**
 * Reference Validators
 *
 * Centralized validation functions for checking if references exist.
 * This removes repetitive validation logic from services.
 */

import Brand from "../models/Brand.js";
import Category from "../models/Category.js";
import SubCategory from "../models/SubCategory.js";
import Supplier from "../models/Supplier.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { createError } from "./errorFactory.js";

/**
 * Validate brand exists
 * @param {string} brandId - Brand ID
 * @param {Object} session - Optional MongoDB session
 * @returns {Promise<Object>} Brand document
 * @throws {Error} If brand not found
 */
export async function validateBrand(brandId, session = null) {
  const query = Brand.findById(brandId);
  if (session) {
    query.session(session);
  }
  const brand = await query;

  if (!brand) {
    throw createError("Brand not found", "BRAND_NOT_FOUND", 404);
  }

  return brand;
}

/**
 * Validate category exists
 * @param {string} categoryId - Category ID
 * @param {Object} session - Optional MongoDB session
 * @returns {Promise<Object>} Category document
 * @throws {Error} If category not found
 */
export async function validateCategory(categoryId, session = null) {
  const query = Category.findById(categoryId);
  if (session) {
    query.session(session);
  }
  const category = await query;

  if (!category) {
    throw createError("Category not found", "CATEGORY_NOT_FOUND", 404);
  }

  return category;
}

/**
 * Validate subcategory exists
 * @param {string} subCategoryId - SubCategory ID
 * @param {Object} session - Optional MongoDB session
 * @returns {Promise<Object>} SubCategory document
 * @throws {Error} If subcategory not found
 */
export async function validateSubCategory(subCategoryId, session = null) {
  const query = SubCategory.findById(subCategoryId);
  if (session) {
    query.session(session);
  }
  const subCategory = await query;

  if (!subCategory) {
    throw createError("SubCategory not found", "SUBCATEGORY_NOT_FOUND", 404);
  }

  return subCategory;
}

/**
 * Validate supplier exists
 * @param {string} supplierId - Supplier ID
 * @param {Object} session - Optional MongoDB session
 * @returns {Promise<Object>} Supplier document
 * @throws {Error} If supplier not found
 */
export async function validateSupplier(supplierId, session = null) {
  const query = Supplier.findById(supplierId);
  if (session) {
    query.session(session);
  }
  const supplier = await query;

  if (!supplier) {
    throw createError("Supplier not found", "SUPPLIER_NOT_FOUND", 404);
  }

  return supplier;
}

/**
 * Validate product exists
 * @param {string} productId - Product ID
 * @param {Object} session - Optional MongoDB session
 * @returns {Promise<Object>} Product document
 * @throws {Error} If product not found
 */
export async function validateProduct(productId, session = null) {
  const query = Product.findById(productId);
  if (session) {
    query.session(session);
  }
  const product = await query;

  if (!product) {
    throw createError("Product not found", "PRODUCT_NOT_FOUND", 404);
  }

  return product;
}

/**
 * Validate user exists
 * @param {string} userId - User ID
 * @param {Object} session - Optional MongoDB session
 * @returns {Promise<Object>} User document
 * @throws {Error} If user not found
 */
export async function validateUser(userId, session = null) {
  const query = User.findById(userId);
  if (session) {
    query.session(session);
  }
  const user = await query;

  if (!user) {
    throw createError("User not found", "USER_NOT_FOUND", 404);
  }

  return user;
}

/**
 * Validate user is manager
 * @param {string} userId - User ID
 * @param {Object} session - Optional MongoDB session
 * @returns {Promise<Object>} User document (must be manager)
 * @throws {Error} If user not found or not a manager
 */
export async function validateManager(userId, session = null) {
  const user = await validateUser(userId, session);

  if (user.role !== "manager") {
    throw createError("User is not a manager", "FORBIDDEN", 403);
  }

  return user;
}

