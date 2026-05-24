import fs from "fs";
import mongoose from "mongoose";
import { DB_DIR, DB_FILE } from "../config/config.js";
import UserModel from "./User.js";
import TeamModel from "./Team.js";
import StandupModel from "./Standup.js";
import TeamInsightModel from "./TeamInsight.js";

// ─── JSON fallback store ───────────────────────────────────────────────────────

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const defaultData = { users: [], teams: [], standups: [], insights: [] };

function readJson() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2), "utf8");
      return { ...defaultData };
    }
    return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
  } catch {
    return { ...defaultData };
  }
}

function writeJson(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (e) {
    console.error("JSON write error:", e);
  }
}

function isMongoConnected() {
  return mongoose.connection.readyState === 1;
}

// ─── Unified db object ────────────────────────────────────────────────────────

export const db = {
  // ── USERS ──────────────────────────────────────────────────────────────────
  getUsers: () => {
    if (isMongoConnected()) return null; // signal: use async path
    return readJson().users;
  },

  saveUsers: (users) => {
    if (isMongoConnected()) return; // no-op: mongo handles saves individually
    const data = readJson();
    data.users = users;
    writeJson(data);
  },

  // ── TEAMS ──────────────────────────────────────────────────────────────────
  getTeams: () => {
    if (isMongoConnected()) return null;
    return readJson().teams;
  },

  saveTeams: (teams) => {
    if (isMongoConnected()) return;
    const data = readJson();
    data.teams = teams;
    writeJson(data);
  },

  // ── STANDUPS ───────────────────────────────────────────────────────────────
  getStandups: () => {
    if (isMongoConnected()) return null;
    return readJson().standups;
  },

  saveStandups: (standups) => {
    if (isMongoConnected()) return;
    const data = readJson();
    data.standups = standups;
    writeJson(data);
  },

  // ── INSIGHTS ───────────────────────────────────────────────────────────────
  getInsights: () => {
    if (isMongoConnected()) return null;
    return readJson().insights;
  },

  saveInsights: (insights) => {
    if (isMongoConnected()) return;
    const data = readJson();
    data.insights = insights;
    writeJson(data);
  }
};

// ─── Async MongoDB helpers (used by controllers when Mongo is connected) ──────

export async function findUsers(query = {}) {
  if (isMongoConnected()) {
    const docs = await UserModel.find(query).lean();
    return docs;
  }
  const users = readJson().users;
  return users;
}

export async function findOneUser(query) {
  if (isMongoConnected()) {
    return await UserModel.findOne(query).lean();
  }
  const users = readJson().users;
  if (query.email) return users.find(u => u.email === query.email) || null;
  if (query.id) return users.find(u => u.id === query.id) || null;
  return null;
}

export async function createUser(userData) {
  if (isMongoConnected()) {
    const doc = await UserModel.create(userData);
    return doc.toObject();
  }
  const data = readJson();
  data.users.push(userData);
  writeJson(data);
  return userData;
}

export async function updateUser(id, updates) {
  if (isMongoConnected()) {
    const doc = await UserModel.findOneAndUpdate({ id }, updates, { new: true }).lean();
    return doc;
  }
  const data = readJson();
  const idx = data.users.findIndex(u => u.id === id);
  if (idx !== -1) {
    data.users[idx] = { ...data.users[idx], ...updates };
    writeJson(data);
    return data.users[idx];
  }
  return null;
}

export async function findTeams(query = {}) {
  if (isMongoConnected()) return await TeamModel.find(query).lean();
  const teams = readJson().teams;
  if (query.id) return teams.filter(t => t.id === query.id);
  return teams;
}

export async function findOneTeam(query) {
  if (isMongoConnected()) return await TeamModel.findOne(query).lean();
  const teams = readJson().teams;
  if (query.id) return teams.find(t => t.id === query.id) || null;
  if (query.inviteCode) return teams.find(t => t.inviteCode === query.inviteCode) || null;
  return null;
}

export async function createTeamDoc(teamData) {
  if (isMongoConnected()) {
    const doc = await TeamModel.create(teamData);
    return doc.toObject();
  }
  const data = readJson();
  data.teams.push(teamData);
  writeJson(data);
  return teamData;
}

export async function updateTeam(id, updates) {
  if (isMongoConnected()) {
    return await TeamModel.findOneAndUpdate({ id }, updates, { new: true }).lean();
  }
  const data = readJson();
  const idx = data.teams.findIndex(t => t.id === id);
  if (idx !== -1) {
    data.teams[idx] = { ...data.teams[idx], ...updates };
    writeJson(data);
    return data.teams[idx];
  }
  return null;
}

export async function deleteTeamDoc(id) {
  if (isMongoConnected()) {
    await TeamModel.deleteOne({ id });
    return;
  }
  const data = readJson();
  data.teams = data.teams.filter(t => t.id !== id);
  writeJson(data);
}

export async function findStandups(query = {}) {
  if (isMongoConnected()) return await StandupModel.find(query).lean();
  const standups = readJson().standups;
  let result = standups;
  if (query.teamId) result = result.filter(s => s.teamId === query.teamId);
  if (query.userId) result = result.filter(s => s.userId === query.userId);
  if (query.isDraft !== undefined) result = result.filter(s => s.isDraft === query.isDraft);
  return result;
}

export async function findOneStandup(query) {
  if (isMongoConnected()) return await StandupModel.findOne(query).lean();
  const standups = readJson().standups;
  if (query.id) return standups.find(s => s.id === query.id) || null;
  return standups.find(s =>
    (!query.userId || s.userId === query.userId) &&
    (!query.teamId || s.teamId === query.teamId) &&
    (!query.date || s.date === query.date) &&
    (query.isDraft === undefined || s.isDraft === query.isDraft)
  ) || null;
}

export async function upsertStandup(query, data) {
  if (isMongoConnected()) {
    return await StandupModel.findOneAndUpdate(query, data, { new: true, upsert: true }).lean();
  }
  const db = readJson();
  const idx = db.standups.findIndex(s =>
    s.userId === query.userId && s.teamId === query.teamId && s.date === query.date
  );
  if (idx !== -1) {
    db.standups[idx] = { ...db.standups[idx], ...data };
    writeJson(db);
    return db.standups[idx];
  }
  db.standups.push(data);
  writeJson(db);
  return data;
}

export async function findInsights(query = {}) {
  if (isMongoConnected()) return await TeamInsightModel.find(query).lean();
  const insights = readJson().insights;
  if (query.teamId) return insights.filter(i => i.teamId === query.teamId);
  return insights;
}

export async function upsertInsight(query, data) {
  if (isMongoConnected()) {
    return await TeamInsightModel.findOneAndUpdate(query, data, { new: true, upsert: true }).lean();
  }
  const db = readJson();
  const idx = db.insights.findIndex(i => i.teamId === query.teamId && i.date === query.date);
  if (idx !== -1) {
    db.insights[idx] = { ...db.insights[idx], ...data };
    writeJson(db);
    return db.insights[idx];
  }
  db.insights.push(data);
  writeJson(db);
  return data;
}
