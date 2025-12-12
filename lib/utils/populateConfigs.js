/**
 * Populate Configurations
 *
 * Centralized populate configurations for consistent data population across all services.
 * This ensures all services return data with the same structure and relationships.
 */

/**
 * Product populate configuration
 * Populates brand, subCategory (with category), and supplier
 */
export const productPopulateConfig = [
  { path: "brand", select: "name" },
  {
    path: "subCategory",
    select: "name",
    populate: { path: "category", select: "name" },
  },
  { path: "supplier", select: "name" },
];

/**
 * Sale populate configuration
 * Populates product and cashier
 */
export const salePopulateConfig = [
  { path: "product", select: "name purchasePrice" },
  { path: "cashier", select: "name email role" },
];

/**
 * Sale populate configuration (minimal - for cashier sales)
 * Populates only product name
 */
export const saleMinimalPopulateConfig = [
  { path: "product", select: "name purchasePrice" },
];

/**
 * Inventory log populate configuration
 * Populates product and manager
 */
export const inventoryLogPopulateConfig = [
  { path: "product", select: "name purchasePrice stock" },
  { path: "manager", select: "name email role" },
];

/**
 * Inventory log populate configuration (with stock info)
 * Populates product with stock details and manager
 */
export const inventoryLogWithStockPopulateConfig = [
  { path: "product", select: "name stock lowStockThreshold" },
  { path: "manager", select: "name email role" },
];

/**
 * SubCategory populate configuration
 * Populates category
 */
export const subCategoryPopulateConfig = [
  { path: "category", select: "name" },
];

