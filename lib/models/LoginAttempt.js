/**
 * LoginAttempt Model
 *
 * Tracks failed login attempts per email address.
 * Used for account lockout mechanism.
 * Accounts are locked after 5 failed attempts for 15 minutes.
 */

import mongoose from "mongoose";

const loginAttemptSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    attempts: {
      type: Number,
      default: 0,
      required: true,
      min: 0,
    },
    lockedUntil: {
      type: Date,
      default: null,
    },
    lastAttemptAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
loginAttemptSchema.index({ email: 1 });
loginAttemptSchema.index({ lockedUntil: 1 }, { expireAfterSeconds: 0 });

/**
 * Record a failed login attempt
 * Locks account after 5 failed attempts for 15 minutes
 * @param {string} email - User email address
 * @returns {Promise<Object>} LoginAttempt document
 */
loginAttemptSchema.statics.recordFailedAttempt = async function (email) {
  const normalizedEmail = email.toLowerCase().trim();

  let attempt = await this.findOne({ email: normalizedEmail });

  if (!attempt) {
    attempt = new this({ email: normalizedEmail, attempts: 1, lastAttemptAt: new Date() });
  } else {
    attempt.attempts += 1;
    attempt.lastAttemptAt = new Date();

    // Lock account after 5 failed attempts
    if (attempt.attempts >= 5) {
      const lockoutDuration = 15 * 60 * 1000; // 15 minutes
      attempt.lockedUntil = new Date(Date.now() + lockoutDuration);
    }
  }

  return await attempt.save();
};

/**
 * Reset failed attempts (called on successful login)
 * @param {string} email - User email address
 * @returns {Promise<Object|null>} Deleted document or null
 */
loginAttemptSchema.statics.resetAttempts = async function (email) {
  const normalizedEmail = email.toLowerCase().trim();
  return await this.findOneAndDelete({ email: normalizedEmail });
};

/**
 * Check if account is locked
 * @param {string} email - User email address
 * @returns {Promise<Object>} { locked: boolean, lockedUntil?: Date, minutesRemaining?: number }
 */
loginAttemptSchema.statics.isLocked = async function (email) {
  const normalizedEmail = email.toLowerCase().trim();
  const attempt = await this.findOne({ email: normalizedEmail });

  if (!attempt || !attempt.lockedUntil) {
    return { locked: false };
  }

  const now = new Date();
  if (now < attempt.lockedUntil) {
    // Account is locked
    const minutesRemaining = Math.ceil((attempt.lockedUntil - now) / (60 * 1000));
    return {
      locked: true,
      lockedUntil: attempt.lockedUntil,
      minutesRemaining,
    };
  }

  // Lock expired, remove record
  await this.findOneAndDelete({ email: normalizedEmail });
  return { locked: false };
};

// Export model with hot reload protection
export default mongoose.models.LoginAttempt ||
  mongoose.model("LoginAttempt", loginAttemptSchema);

