import mongoose from "mongoose";

const teamInsightSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  teamId: { type: String, required: true },
  date: { type: String, required: true },
  healthScore: { type: Number, default: 80 },
  summary: { type: String, default: "" },
  actionItems: [{ type: String }],
  blockerFrequency: { type: Map, of: Number, default: {} },
  moodTrend: { type: String, default: "" }
}, { timestamps: true });

export default mongoose.model("TeamInsight", teamInsightSchema);
