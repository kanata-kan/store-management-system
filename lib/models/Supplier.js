/**
 * Supplier Model
 *
 * Represents a supplier/vendor.
 * Suppliers are referenced by products.
 */

import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Supplier name is required"],
      trim: true,
      minlength: [2, "Supplier name must be at least 2 characters"],
      maxlength: [100, "Supplier name cannot exceed 100 characters"],
      index: true,
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [20, "Phone number cannot exceed 20 characters"],
      match: [/^[\d\s\-+()]+$/, "Invalid phone number format"],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
    firstTransactionDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for products
supplierSchema.virtual("products", {
  ref: "Product",
  localField: "_id",
  foreignField: "supplier",
});

// Index
supplierSchema.index({ name: 1 });

// Prevent deletion if supplier has products
supplierSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function () {
    const Product = mongoose.model("Product");
    const productCount = await Product.countDocuments({ supplier: this._id });
    if (productCount > 0) {
      throw new Error("Cannot delete supplier with products");
    }
  }
);

// Export model with hot reload protection
export default mongoose.models.Supplier ||
  mongoose.model("Supplier", supplierSchema);
