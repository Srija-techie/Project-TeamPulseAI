import mongoose from "mongoose";

let isConnected = false;

export async function connectDB() {
  if (isConnected) return;

  try {
    const uri = process.env.MONGO_URI || process.env.MONGO_URL;

    if (!uri) {
      console.warn("⚠️ MONGO_URI or MONGO_URL is not set. Falling back to local JSON store.");
      return;
    }

    const conn = await mongoose.connect(uri, {
      dbName: "teampulseai",
    });

    isConnected = true;

    console.log("✅ MongoDB connected successfully");
    console.log("Host:", conn.connection.host);

  } catch (error) {
    console.error("❌ MongoDB connection failed:");
    console.error(error);
    console.warn("⚠️ Running in local JSON store mode due to connection failure.");
  }
}

export default connectDB;