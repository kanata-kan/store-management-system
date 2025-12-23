/**
 * Sale Model
 *
 * Represents a sale transaction.
 * Records product sales with quantity, price, and cashier information.
 */

import mongoose from "mongoose";

const saleSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product is required"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
    },
    sellingPrice: {
      type: Number,
      required: [true, "Selling price is required"],
      min: [0.01, "Selling price must be greater than 0"],
    },
    priceOverride: {
      type: Boolean,
      default: false,
      // Indicates if the sale was made outside the product's price range
      // Only managers can override price range restrictions
    },
    // Phase 1: Product snapshot for historical data integrity
    // Optional for backward compatibility with existing sales
    productSnapshot: {
      // ⚠️ IDENTITY FIELDS (for aggregations - must be stable)
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        // Not required for backward compatibility
      },
      categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        default: null,
      },
      subCategoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubCategory",
        default: null,
      },
      // ⚠️ DISPLAY FIELDS (for display only - can change)
      name: {
        type: String,
        trim: true,
        maxlength: [100, "Product name cannot exceed 100 characters"],
      },
      brand: {
        type: String,
        trim: true,
        maxlength: [50, "Brand name cannot exceed 50 characters"],
      },
      category: {
        type: String,
        trim: true,
        maxlength: [50, "Category name cannot exceed 50 characters"],
      },
      subCategory: {
        type: String,
        trim: true,
        maxlength: [50, "SubCategory name cannot exceed 50 characters"],
      },
      // ⚠️ BUSINESS FIELDS (for historical accuracy)
      purchasePrice: {
        type: Number,
        min: [0, "Purchase price cannot be negative"],
      },
      priceRange: {
        min: {
          type: Number,
          min: [0, "Minimum price cannot be negative"],
        },
        max: {
          type: Number,
          min: [0, "Maximum price cannot be negative"],
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
    cashier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Cashier is required"],
    },
    status: {
      type: String,
      enum: ["active", "cancelled", "returned"],
      default: "active",
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    cancellationReason: {
      type: String,
      trim: true,
      maxlength: [500, "Cancellation reason cannot exceed 500 characters"],
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for total amount (quantity * sellingPrice)
saleSchema.virtual("totalAmount").get(function () {
  return this.quantity * this.sellingPrice;
});

// Compound indexes for performance
saleSchema.index({ product: 1, createdAt: -1 }); // Product sales history
saleSchema.index({ cashier: 1, createdAt: -1 }); // Cashier sales
saleSchema.index({ createdAt: -1 }); // Recent sales
saleSchema.index({ createdAt: 1 }); // Date range queries
saleSchema.index({ status: 1, createdAt: -1 }); // Filter by status
saleSchema.index({ cashier: 1, status: 1, createdAt: -1 }); // Cashier sales by status

// Phase 1: Indexes for productSnapshot (identity-based aggregations)
saleSchema.index({ "productSnapshot.productId": 1, status: 1, createdAt: -1 }); // Product aggregations
saleSchema.index({ "productSnapshot.categoryId": 1, status: 1, createdAt: -1 }); // Category aggregations
saleSchema.index({ "productSnapshot.subCategoryId": 1, status: 1, createdAt: -1 }); // SubCategory aggregations

// Export model with hot reload protection
export default mongoose.models.Sale || mongoose.model("Sale", saleSchema);
