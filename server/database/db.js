import mongoose from "mongoose";

let isConnected = false;

export async function connectDB() {
  if (isConnected) return;

  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.warn(
      "⚠️  MONGO_URI is not set in .env — MongoDB connection skipped. " +
      "The server will use the local JSON file store (db-storage/db.json) as fallback."
    );
    return;
  }

  await mongoose.connect(uri, { dbName: "teampulseai" });
  isConnected = true;
  console.log("✅ MongoDB connected successfully —", uri.replace(/\/\/.*@/, "//***@"));
}

export default connectDB;
