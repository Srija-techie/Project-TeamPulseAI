import "dotenv/config";
import http from "http";
import app from "./app.js";
import connectDB from "./database/db.js";
import { initSockets } from "./sockets/index.js";
import { PORT } from "./config/config.js";
import { initializeWeeklyReportCron } from "./cron/weeklyReportScheduler.js";


async function run() {
  try {
    // 1. Connect to MongoDB (gracefully skips if MONGO_URI not set, falls back to JSON store)
    await connectDB();

    // 2. Create HTTP server
    const httpServer = http.createServer(app);

    // 3. Initialize Socket.IO
    const io = initSockets(httpServer);

    // 4. Make io accessible on Express req instances
    app.set("io", io);

    // 5. Start weekly report cron scheduler
    initializeWeeklyReportCron();

    // 6. Start listening
    httpServer.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 TeamPulseAI running at http://localhost:${PORT}`);
      console.log(`   Environment : ${process.env.NODE_ENV || "development"}`);
      console.log(`   MongoDB     : ${process.env.MONGO_URL ? "connected" : "JSON fallback"}`);
    });
  } catch (error) {
    console.error("Critical server boot error:", error);
    process.exit(1);
  }
}

run();
