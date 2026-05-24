import { Router } from "express";
import { register, login, getMe, updateUserProfile, oauthLogin } from "../controllers/auth.js";
import { createTeam, joinTeam, getMyTeams, getTeamMembers, toggleVacation, updateTeamSettings, deleteTeam, updateUserRole } from "../controllers/teams.js";
import {
  submitStandup,
  getDraft,
  getStandups,
  getTeamAnalyticsMetrics,
  generateTeamReport,
  getTeamInsights,
  addComment,
  askSprintCoach,
  broadcastEmail,
  broadcastSlack,
  jiraWebhookUpdate
} from "../controllers/standups.js";
import { authMiddleware, roleMiddleware } from "../middlewares/auth.js";

const router = Router();

// --- PUBLIC AUTH ROUTES ---
router.post("/auth/register", register);
router.post("/auth/login", login);
router.post("/auth/oauth", oauthLogin);

// Public Integration Webhook (no session cookie required)
router.post("/webhooks/jira", jiraWebhookUpdate);

// --- SECURED ROUTES ---

// Auth contexts
router.get("/auth/me", authMiddleware, getMe);
router.put("/auth/profile", authMiddleware, updateUserProfile);

// Teams contexts
router.post("/teams", authMiddleware, createTeam);
router.post("/teams/join", authMiddleware, joinTeam);
router.get("/teams", authMiddleware, getMyTeams);
router.get("/teams/:teamId/members", authMiddleware, getTeamMembers);
router.post("/teams/:teamId/vacation", authMiddleware, toggleVacation);
router.put("/teams/:teamId/settings", authMiddleware, roleMiddleware(["Admin"]), updateTeamSettings);
router.delete("/teams/:teamId", authMiddleware, roleMiddleware(["Admin"]), deleteTeam);
router.put("/teams/:teamId/members/:userId/role", authMiddleware, roleMiddleware(["Admin"]), updateUserRole);

// Standups contexts
router.post("/standups", authMiddleware, submitStandup);
router.get("/standups/:teamId/draft", authMiddleware, getDraft);
router.get("/standups/:teamId", authMiddleware, getStandups);
router.post("/standups/:standupId/comments", authMiddleware, addComment);
router.get("/standups/:teamId/analytics", authMiddleware, getTeamAnalyticsMetrics);
router.post("/standups/:teamId/report", authMiddleware, generateTeamReport);
router.post("/teams/:teamId/report", authMiddleware, generateTeamReport);
router.get("/standups/:teamId/report", authMiddleware, getTeamInsights);
router.get("/teams/:teamId/report", authMiddleware, getTeamInsights);
router.post("/standups/:teamId/coach", authMiddleware, askSprintCoach);

// Broadcast integrations
router.post("/teams/:teamId/broadcast/email", authMiddleware, broadcastEmail);
router.post("/teams/:teamId/broadcast/slack", authMiddleware, broadcastSlack);

export default router;
