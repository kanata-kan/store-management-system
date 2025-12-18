/**
 * SubCategory Model
 *
 * Represents a subcategory (second-level classification).
 * Subcategories belong to a category and contain products.
 */

import mongoose from "mongoose";

const subCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "SubCategory name is required"],
      trim: true,
      minlength: [2, "SubCategory name must be at least 2 characters"],
      maxlength: [50, "SubCategory name cannot exceed 50 characters"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for products
subCategorySchema.virtual("products", {
  ref: "Product",
  localField: "_id",
  foreignField: "subCategory",
});

// Compound unique index: category + name must be unique
subCategorySchema.index({ category: 1, name: 1 }, { unique: true });

// Prevent deletion if subcategory has products
subCategorySchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function () {
    const Product = mongoose.model("Product");
    const productCount = await Product.countDocuments({
      subCategory: this._id,
    });
    if (productCount > 0) {
      throw new Error("Cannot delete subcategory with products");
    }
  }
);

// Export model with hot reload protection
export default mongoose.models.SubCategory ||
  mongoose.model("SubCategory", subCategorySchema);
