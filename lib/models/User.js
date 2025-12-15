/**
 * User Model
 *
 * Represents a system user (manager or cashier).
 * Handles authentication with password hashing.
 */

import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
      index: true,
    },
    passwordHash: {
      type: String,
      required: [true, "Password is required"],
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: ["manager", "cashier"],
      required: [true, "Role is required"],
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Hash password before saving
// In Mongoose 9.x, async pre hooks don't need 'next' parameter
userSchema.pre("save", async function () {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("passwordHash")) {
    return;
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  } catch (error) {
    // In async hooks, throw error instead of calling next(error)
    throw error;
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  // If passwordHash is not selected, we need to fetch it
  if (!this.passwordHash) {
    const user = await mongoose
      .model("User")
      .findById(this._id)
      .select("+passwordHash");
    if (!user) return false;
    return await bcrypt.compare(candidatePassword, user.passwordHash);
  }
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

// Export model with hot reload protection
export default mongoose.models.User || mongoose.model("User", userSchema);
