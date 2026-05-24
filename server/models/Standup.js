import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  id: { type: String, required: true },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  userAvatar: { type: String, default: "🦊" },
  text: { type: String, required: true },
  timestamp: { type: String, required: true }
});

const standupSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  teamId: { type: String, required: true },
  date: { type: String, required: true },
  timestamp: { type: String, required: true },
  yesterday: { type: String, default: "" },
  today: { type: String, default: "" },
  blockers: { type: String, default: "" },
  mood: { type: String, enum: ["excellent", "good", "neutral", "unhappy", "stressed"], default: "good" },
  isDraft: { type: Boolean, default: false },
  aiSummary: { type: String },
  aiBlockers: [{ type: String }],
  aiActionItems: [{ type: String }],
  aiMoodScore: { type: Number },
  isLate: { type: Boolean, default: false },
  isBlocked: { type: Boolean, default: false },
  stressLevel: { type: Number, default: 3 },
  comments: [commentSchema]
}, { timestamps: true });

export default mongoose.model("Standup", standupSchema);
