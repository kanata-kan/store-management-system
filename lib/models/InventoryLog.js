/**
 * InventoryLog Model
 *
 * Represents an inventory supply entry.
 * Records when products are added to inventory with quantity, price, and manager information.
 */

import mongoose from "mongoose";

const inventoryLogSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product is required"],
    },
    quantityAdded: {
      type: Number,
      required: [true, "Quantity added is required"],
      min: [1, "Quantity added must be at least 1"],
    },
    purchasePrice: {
      type: Number,
      required: [true, "Purchase price is required"],
      min: [0.01, "Purchase price must be greater than 0"],
    },
    note: {
      type: String,
      trim: true,
      maxlength: [500, "Note cannot exceed 500 characters"],
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Manager is required"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
inventoryLogSchema.index({ product: 1, createdAt: -1 }); // Product inventory history
inventoryLogSchema.index({ manager: 1, createdAt: -1 }); // Manager operations
inventoryLogSchema.index({ createdAt: -1 }); // Recent operations

// Export model with hot reload protection
export default mongoose.models.InventoryLog ||
  mongoose.model("InventoryLog", inventoryLogSchema);
