/**
 * Test Database Helper
 *
 * MongoDB Memory Server for testing
 * Creates an in-memory MongoDB replica set for transaction support
 */

import { MongoMemoryReplSet } from "mongodb-memory-server";
import mongoose from "mongoose";

let mongoServer = null;

/**
 * Connect to in-memory MongoDB replica set (for transactions)
 */
export async function connectTestDB() {
  // Start MongoDB Memory Replica Set (for transaction support)
  mongoServer = await MongoMemoryReplSet.create({
    replSet: { count: 1, storageEngine: "wiredTiger" },
  });

  const mongoUri = mongoServer.getUri();

  // Connect mongoose
  await mongoose.connect(mongoUri);

  console.log("✅ Test database connected (replica set)");
}

/**
 * Disconnect and stop MongoDB Memory Server
 */
export async function disconnectTestDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  if (mongoServer) {
    await mongoServer.stop();
  }

  console.log("✅ Test database disconnected");
}

/**
 * Clear all collections (but keep the database)
 */
export async function clearTestDB() {
  if (mongoose.connection.readyState === 0) {
    throw new Error("Database not connected. Call connectTestDB() first.");
  }

  const collections = mongoose.connection.collections;

  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
}

/**
 * Drop entire database
 */
export async function dropTestDB() {
  if (mongoose.connection.readyState === 0) {
    throw new Error("Database not connected. Call connectTestDB() first.");
  }

  await mongoose.connection.dropDatabase();
}

/**
 * Get connection status
 */
export function isConnected() {
  return mongoose.connection.readyState === 1;
}

/**
 * Create indexes for all models
 * (MongoDB Memory Server doesn't auto-create indexes)
 */
export async function createIndexes() {
  const models = mongoose.modelNames();

  for (const modelName of models) {
    const model = mongoose.model(modelName);
    await model.createIndexes();
  }

  console.log("✅ Test database indexes created");
}

