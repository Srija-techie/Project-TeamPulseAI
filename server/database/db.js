import mongoose from "mongoose";

let isConnected = false;

export async function connectDB() {
  if (isConnected) return;

  try {
    const uri = process.env.MONGO_URI;

    console.log("MONGO_URI exists:", !!uri);

    if (!uri) {
      throw new Error("MONGO_URI is missing");
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

    process.exit(1);
  }
}

export default connectDB;