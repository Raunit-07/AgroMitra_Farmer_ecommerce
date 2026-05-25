import mongoose from "mongoose";
import User from "../models/User.js";

const ensureUserIndexes = async () => {
  const users = mongoose.connection.collection("users");
  let indexes = [];

  try {
    indexes = await users.indexes();
  } catch (error) {
    if (error?.codeName !== "NamespaceNotFound") {
      throw error;
    }
  }

  const emailOnlyIndex = indexes.find(
    (index) =>
      index.unique &&
      Object.keys(index.key || {}).length === 1 &&
      index.key.email === 1
  );

  if (emailOnlyIndex) {
    await users.dropIndex(emailOnlyIndex.name);
    console.log("Dropped users.email unique index; using email + role uniqueness.");
  }

  await User.syncIndexes();
};

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error("MONGO_URI is required");
    }

    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected");
    });

    mongoose.connection.on("error", (error) => {
      console.error("MongoDB connection error:", error.message);
    });

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    await ensureUserIndexes();
  } catch (error) {
    console.error("MongoDB connection failed", error.message);
    process.exit(1);
  }
};
