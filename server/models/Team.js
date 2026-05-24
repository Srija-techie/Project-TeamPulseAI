import mongoose from "mongoose";

const teamSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true, trim: true },
  inviteCode: { type: String, required: true, unique: true },
  ownerId: { type: String, required: true },
  settings: {
    questions: [{ type: String }],
    standupTime: { type: String, default: "09:30" },
    timezone: { type: String, default: "UTC" },
    deadline: { type: String, default: "11:00" },
    theme: { type: String, default: "emerald" },
    emoji: { type: String, default: "🚀" },
    weekdays: [{ type: String }],
    remindersEnabled: { type: Boolean, default: false },
    slackChannel: { type: String, default: "" },
    emailMailingList: { type: String, default: "" },
    webhookUrl: { type: String, default: "" },
    webhookToken: { type: String, default: "" }
  },
  vacationUsers: [{ type: String }]
}, { timestamps: true });

export default mongoose.model("Team", teamSchema);
