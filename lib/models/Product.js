/**
 * Product Model
 *
 * Represents a product in the inventory system.
 * Includes all product information, stock management, and relationships.
 */

import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [2, "Product name must be at least 2 characters"],
      maxlength: [100, "Product name cannot exceed 100 characters"],
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: [true, "Brand is required"],
      index: true,
    },
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
      required: [true, "SubCategory is required"],
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: [true, "Supplier is required"],
      index: true,
    },
    purchasePrice: {
      type: Number,
      required: [true, "Purchase price is required"],
      min: [0.01, "Purchase price must be greater than 0"],
    },
    priceRange: {
      min: {
        type: Number,
        required: false, // Optional for backward compatibility
        min: [0.01, "Minimum selling price must be greater than 0"],
      },
      max: {
        type: Number,
        required: false, // Optional for backward compatibility
        min: [0.01, "Maximum selling price must be greater than 0"],
      },
    },
    stock: {
      type: Number,
      required: [true, "Stock is required"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    lowStockThreshold: {
      type: Number,
      required: [true, "Low stock threshold is required"],
      min: [0, "Low stock threshold cannot be negative"],
      default: 3,
    },
    specs: {
      model: {
        type: String,
        trim: true,
        maxlength: [50, "Model name cannot exceed 50 characters"],
      },
      color: {
        type: String,
        trim: true,
        maxlength: [30, "Color cannot exceed 30 characters"],
      },
      capacity: {
        type: String,
        trim: true,
        maxlength: [50, "Capacity cannot exceed 50 characters"],
      },
      size: {
        type: String,
        trim: true,
        maxlength: [50, "Size cannot exceed 50 characters"],
      },
      attributes: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
      },
    },
    warranty: {
      enabled: {
        type: Boolean,
        default: false,
      },
      durationMonths: {
        type: Number,
        min: [1, "Warranty duration must be at least 1 month"],
        default: null,
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for low stock status
productSchema.virtual("isLowStock").get(function () {
  return this.stock <= this.lowStockThreshold;
});

// Virtual for suggested selling price (calculated automatically)
productSchema.virtual("priceRange.suggested").get(function () {
  // Only calculate if priceRange exists with both min and max
  if (!this.priceRange?.min || !this.priceRange?.max) {
    return undefined;
  }
  
  // Calculate midpoint (average of min and max)
  const suggested = (this.priceRange.min + this.priceRange.max) / 2;
  
  // Round to 2 decimal places
  return Math.round(suggested * 100) / 100;
});

// Indexes for performance
productSchema.index({ name: "text" }); // Text search
productSchema.index({ brand: 1, stock: 1 }); // Brand and stock queries
productSchema.index({ subCategory: 1 }); // SubCategory queries
productSchema.index({ stock: 1 }); // Low stock queries
productSchema.index({ createdAt: -1 }); // Recent products

// Validate priceRange before saving
productSchema.pre("save", function () {
  // Skip validation if priceRange is not set
  if (!this.priceRange || (!this.priceRange.min && !this.priceRange.max)) {
    return;
  }
  
  // If priceRange is set, both min and max must be present
  if (!this.priceRange.min || !this.priceRange.max) {
    throw new Error(
      "Both minimum and maximum prices are required when setting price range"
    );
  }
  
  // Validate: min must be >= purchasePrice
  if (this.priceRange.min < this.purchasePrice) {
    throw new Error(
      "Minimum selling price must be greater than or equal to purchase price"
    );
  }
  
  // Validate: max must be >= min
  if (this.priceRange.max < this.priceRange.min) {
    throw new Error(
      "Maximum selling price must be greater than or equal to minimum selling price"
    );
  }
});

// Prevent deletion if product has sales
productSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function () {
    const Sale = mongoose.model("Sale");
    const saleCount = await Sale.countDocuments({ product: this._id });
    if (saleCount > 0) {
      throw new Error("Cannot delete product with sales history");
    }
  }
);

// Export model with hot reload protection
export default mongoose.models.Product ||
  mongoose.model("Product", productSchema);
