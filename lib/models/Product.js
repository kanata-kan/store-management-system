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
      index: true,
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
      index: true,
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
    stock: {
      type: Number,
      required: [true, "Stock is required"],
      min: [0, "Stock cannot be negative"],
      default: 0,
      index: true,
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

// Indexes for performance
productSchema.index({ name: "text" }); // Text search
productSchema.index({ brand: 1, stock: 1 }); // Brand and stock queries
productSchema.index({ subCategory: 1 }); // SubCategory queries
productSchema.index({ stock: 1 }); // Low stock queries
productSchema.index({ createdAt: -1 }); // Recent products

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
