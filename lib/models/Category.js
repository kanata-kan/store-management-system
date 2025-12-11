/**
 * Category Model
 *
 * Represents a product category (top-level classification).
 * Categories contain subcategories, which in turn contain products.
 */

import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      unique: true,
      minlength: [2, "Category name must be at least 2 characters"],
      maxlength: [50, "Category name cannot exceed 50 characters"],
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for subcategories
categorySchema.virtual("subcategories", {
  ref: "SubCategory",
  localField: "_id",
  foreignField: "category",
});

// Index
categorySchema.index({ name: 1 });

// Prevent deletion if category has subcategories
categorySchema.pre("deleteOne", { document: true, query: false }, async function () {
  const SubCategory = mongoose.model("SubCategory");
  const subCategoryCount = await SubCategory.countDocuments({
    category: this._id,
  });
  if (subCategoryCount > 0) {
    throw new Error("Cannot delete category with subcategories");
  }
});

// Export model with hot reload protection
export default mongoose.models.Category ||
  mongoose.model("Category", categorySchema);
