/**
 * Seeding Utilities
 *
 * Helper functions for generating realistic store data.
 * Used by seed-dev.js for data generation.
 */

/**
 * Get random element from array
 */
export function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Get random number between min and max (inclusive)
 */
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Get random float between min and max
 */
export function randomFloat(min, max, decimals = 2) {
  const num = Math.random() * (max - min) + min;
  return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

/**
 * Generate random date between start and end dates
 */
export function randomDate(start, end) {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}

/**
 * Generate random phone number (Algerian format)
 */
export function randomPhone() {
  const prefixes = ["055", "056", "066", "067", "077", "079"];
  const prefix = randomChoice(prefixes);
  const number = Math.floor(Math.random() * 10000000)
    .toString()
    .padStart(7, "0");
  return `${prefix}${number}`;
}

/**
 * Generate random email
 */
export function randomEmail(name) {
  const domains = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com"];
  const domain = randomChoice(domains);
  const cleanName = name
    .toLowerCase()
    .replace(/\s+/g, ".")
    .replace(/[^a-z0-9.]/g, "");
  const number = randomInt(1, 999);
  return `${cleanName}${number}@${domain}`;
}

/**
 * Generate random product name with variations
 */
export function generateProductName(baseName, brand, specs) {
  const variations = [];
  
  if (specs?.model) {
    variations.push(specs.model);
  }
  
  if (specs?.color) {
    variations.push(specs.color);
  }
  
  if (specs?.capacity) {
    variations.push(specs.capacity);
  }
  
  if (specs?.size) {
    variations.push(specs.size);
  }
  
  const variationStr = variations.length > 0 ? ` ${variations.join(" ")}` : "";
  return `${brand} ${baseName}${variationStr}`;
}

