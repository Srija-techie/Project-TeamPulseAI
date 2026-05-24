import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  role: { type: String, enum: ["Admin", "Manager", "Member"], default: "Member" },
  teams: [{ type: String }],
  streak: { type: Number, default: 0 },
  lastSubmissionDate: { type: String, default: null },
  badges: [{ type: String }],
  avatar: { type: String, default: "🦊" },
  timezone: { type: String, default: "UTC" },
  notificationSettings: {
    emailDigest: { type: Boolean, default: true },
    slackWebhookAlerts: { type: Boolean, default: false },
    dailyReminders: { type: Boolean, default: true }
  }
}, { timestamps: true });

export default mongoose.model("User", userSchema);
