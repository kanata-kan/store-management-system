/**
 * Invoice Model
 *
 * Represents an invoice document generated from a sale.
 * Contains immutable snapshot data of customer, products, and warranty information.
 * Phase 1: Model structure only (no business logic)
 */

import mongoose from "mongoose";

const invoiceItemSchema = new mongoose.Schema(
  {
    productSnapshot: {
      name: {
        type: String,
        required: [true, "Product name is required"],
        trim: true,
      },
      brand: {
        type: String,
        required: [true, "Brand name is required"],
        trim: true,
      },
      category: {
        type: String,
        trim: true,
      },
      subCategory: {
        type: String,
        trim: true,
      },
      model: {
        type: String,
        trim: true,
      },
      color: {
        type: String,
        trim: true,
      },
      capacity: {
        type: String,
        trim: true,
      },
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
    },
    unitPrice: {
      type: Number,
      required: [true, "Unit price is required"],
      min: [0.01, "Unit price must be greater than 0"],
    },
    totalPrice: {
      type: Number,
      required: [true, "Total price is required"],
      min: [0.01, "Total price must be greater than 0"],
    },
    warranty: {
      hasWarranty: {
        type: Boolean,
        default: false,
      },
      durationMonths: {
        type: Number,
        min: [1, "Warranty duration must be at least 1 month"],
        default: null,
      },
      startDate: {
        type: Date,
        default: null,
      },
      expirationDate: {
        type: Date,
        default: null,
      },
    },
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: [true, "Invoice number is required"],
      unique: true,
      trim: true,
    },
    sale: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sale",
      required: [true, "Sale reference is required"],
    },
    customer: {
      name: {
        type: String,
        required: [true, "Customer name is required"],
        trim: true,
        maxlength: [100, "Customer name cannot exceed 100 characters"],
      },
      phone: {
        type: String,
        required: [true, "Customer phone is required"],
        trim: true,
        maxlength: [20, "Phone number cannot exceed 20 characters"],
      },
    },
    items: {
      type: [invoiceItemSchema],
      required: [true, "Invoice items are required"],
      validate: {
        validator: function (items) {
          return items && items.length > 0;
        },
        message: "Invoice must have at least one item",
      },
    },
    subtotal: {
      type: Number,
      required: [true, "Subtotal is required"],
      min: [0, "Subtotal cannot be negative"],
    },
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Total amount cannot be negative"],
    },
    cashier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Cashier is required"],
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "cancelled", "returned", "paid"],
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

// Indexes for performance (as per architecture document)
invoiceSchema.index({ invoiceNumber: 1 }, { unique: true });
invoiceSchema.index({ sale: 1 }); // Link to sale
invoiceSchema.index({ "customer.name": "text" }); // Text search
invoiceSchema.index({ "customer.phone": 1 }); // Phone search
invoiceSchema.index({ cashier: 1, createdAt: -1 }); // Cashier invoices
invoiceSchema.index({ status: 1, createdAt: -1 }); // Status filter
invoiceSchema.index({ createdAt: -1 }); // Recent invoices
invoiceSchema.index({ createdAt: 1 }); // Date range queries
invoiceSchema.index({ "items.warranty.expirationDate": 1 }); // Warranty queries
invoiceSchema.index({
  "items.warranty.hasWarranty": 1,
  "items.warranty.expirationDate": 1,
}); // Warranty filter

// Phase 3: Warranty Virtual Fields (computed dynamically, not stored)
/**
 * Check if invoice has any warranty
 * @returns {boolean} True if at least one item has warranty
 */
invoiceSchema.virtual("hasWarranty").get(function () {
  if (!this.items || !Array.isArray(this.items) || this.items.length === 0) {
    return false;
  }
  return this.items.some((item) => item.warranty?.hasWarranty === true);
});

/**
 * Check if invoice has any active warranty
 * @returns {boolean} True if at least one item has active (not expired) warranty
 */
invoiceSchema.virtual("hasActiveWarranty").get(function () {
  if (!this.items || !Array.isArray(this.items) || this.items.length === 0) {
    return false;
  }
  const now = new Date();
  const nowDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return this.items.some((item) => {
    const warranty = item.warranty;
    if (!warranty?.hasWarranty || !warranty.expirationDate) {
      return false;
    }
    const expirationDate = new Date(warranty.expirationDate);
    const expirationDateOnly = new Date(
      expirationDate.getFullYear(),
      expirationDate.getMonth(),
      expirationDate.getDate()
    );
    return expirationDateOnly >= nowDateOnly;
  });
});

/**
 * Check if invoice has any expired warranty
 * @returns {boolean} True if at least one item has expired warranty
 */
invoiceSchema.virtual("hasExpiredWarranty").get(function () {
  if (!this.items || !Array.isArray(this.items) || this.items.length === 0) {
    return false;
  }
  const now = new Date();
  const nowDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return this.items.some((item) => {
    const warranty = item.warranty;
    if (!warranty?.hasWarranty || !warranty.expirationDate) {
      return false;
    }
    const expirationDate = new Date(warranty.expirationDate);
    const expirationDateOnly = new Date(
      expirationDate.getFullYear(),
      expirationDate.getMonth(),
      expirationDate.getDate()
    );
    return expirationDateOnly < nowDateOnly;
  });
});

/**
 * Check if warranty is expiring soon
 * @param {number} days - Number of days threshold (default: 7)
 * @returns {boolean} True if any warranty expires within the specified days
 */
invoiceSchema.virtual("warrantyExpiringSoon").get(function () {
  const days = 7; // Default threshold
  if (!this.items || !Array.isArray(this.items) || this.items.length === 0) {
    return false;
  }
  const now = new Date();
  const threshold = new Date();
  threshold.setDate(now.getDate() + days);
  const nowDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thresholdDateOnly = new Date(
    threshold.getFullYear(),
    threshold.getMonth(),
    threshold.getDate()
  );

  return this.items.some((item) => {
    const warranty = item.warranty;
    if (!warranty?.hasWarranty || !warranty.expirationDate) {
      return false;
    }
    const expirationDate = new Date(warranty.expirationDate);
    const expirationDateOnly = new Date(
      expirationDate.getFullYear(),
      expirationDate.getMonth(),
      expirationDate.getDate()
    );
    // Expiring soon: not expired yet, but expires within threshold
    return (
      expirationDateOnly >= nowDateOnly && expirationDateOnly <= thresholdDateOnly
    );
  });
});

// Export model with hot reload protection
export default mongoose.models.Invoice ||
  mongoose.model("Invoice", invoiceSchema);

