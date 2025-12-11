/**
 * Brand Model
 *
 * Represents a product brand/manufacturer.
 * Brands are referenced by products.
 */

import mongoose from "mongoose";

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Brand name is required"],
      trim: true,
      unique: true,
      minlength: [2, "Brand name must be at least 2 characters"],
      maxlength: [50, "Brand name cannot exceed 50 characters"],
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for products
brandSchema.virtual("products", {
  ref: "Product",
  localField: "_id",
  foreignField: "brand",
});

// Index
brandSchema.index({ name: 1 });

// Prevent deletion if brand has products
brandSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    const Product = mongoose.model("Product");
    const productCount = await Product.countDocuments({ brand: this._id });
    if (productCount > 0) {
      return next(new Error("Cannot delete brand with products"));
    }
    next();
  }
);

// Export model with hot reload protection
export default mongoose.models.Brand || mongoose.model("Brand", brandSchema);
