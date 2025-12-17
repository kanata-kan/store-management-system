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
      index: true,
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
    cashier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Cashier is required"],
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "cancelled", "returned"],
      default: "active",
      index: true,
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

// Export model with hot reload protection
export default mongoose.models.Sale || mongoose.model("Sale", saleSchema);
