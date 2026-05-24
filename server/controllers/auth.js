import crypto from "crypto";
import { findUsers, findOneUser, createUser, updateUser } from "../models/db.js";
import { hashPassword, generateToken } from "../utils/auth.js";

function getEarnedBadges(streak, totalSubmissions) {
  const badges = ["Inception"];
  if (streak >= 3) badges.push("Streak Starter (3 Days)");
  if (streak >= 5) badges.push("Consistency Hero (5 Days)");
  if (streak >= 10) badges.push("SaaS Professional (10 Days)");
  if (totalSubmissions >= 1) badges.push("First Standup");
  if (totalSubmissions >= 15) badges.push("Team Catalyst");
  return badges;
}

function sanitizeUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    streak: user.streak || 0,
    badges: user.badges || [],
    teams: user.teams || [],
    avatar: user.avatar || "🦊",
    timezone: user.timezone || "UTC",
    notificationSettings: user.notificationSettings || {
      emailDigest: true,
      slackWebhookAlerts: false,
      dailyReminders: true
    }
  };
}

export async function register(req, res) {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ success: false, message: "Email, password, and name are required" });
    }

    const formattedEmail = email.toLowerCase().trim();

    const existing = await findOneUser({ email: formattedEmail });
    if (existing) {
      return res.status(400).json({ success: false, message: "An account with this email already exists" });
    }

    const allUsers = await findUsers();
    const assignedRole = allUsers.length === 0 ? "Admin" : (role === "Admin" || role === "Manager" ? role : "Member");

    const newUser = {
      id: crypto.randomUUID(),
      email: formattedEmail,
      passwordHash: hashPassword(password),
      name: name.trim(),
      role: assignedRole,
      teams: [],
      streak: 0,
      lastSubmissionDate: null,
      badges: ["Inception"],
      avatar: "🦊",
      timezone: "UTC",
      notificationSettings: {
        emailDigest: true,
        slackWebhookAlerts: false,
        dailyReminders: true
      }
    };

    await createUser(newUser);

    const token = generateToken({ id: newUser.id, email: newUser.email, role: newUser.role });

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      data: { token, user: sanitizeUser(newUser) }
    });
  } catch (error) {
    console.error("Register controller error:", error);
    return res.status(500).json({ success: false, message: "Registration failed on server" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const formattedEmail = email.toLowerCase().trim();
    const user = await findOneUser({ email: formattedEmail });

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    if (user.passwordHash !== hashPassword(password)) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const todayStr = new Date().toISOString().split("T")[0];
    let streak = user.streak || 0;

    if (user.lastSubmissionDate) {
      const diffDays = Math.ceil(
        Math.abs(new Date(todayStr) - new Date(user.lastSubmissionDate)) / (1000 * 60 * 60 * 24)
      );
      if (diffDays > 1 && user.lastSubmissionDate !== todayStr) {
        streak = 0;
        await updateUser(user.id, { streak: 0 });
      }
    }

    const badges = getEarnedBadges(streak, 0);
    await updateUser(user.id, { badges });

    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: { token, user: sanitizeUser({ ...user, streak, badges }) }
    });
  } catch (error) {
    console.error("Login controller error:", error);
    return res.status(500).json({ success: false, message: "Login failed on server" });
  }
}

export async function getMe(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const user = await findOneUser({ id: req.user.id });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      data: { user: sanitizeUser(user) }
    });
  } catch (error) {
    console.error("GetMe controller error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch user context" });
  }
}

export async function updateUserProfile(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const { name, role, avatar, timezone, notificationSettings } = req.body;
    const updates = {};

    if (name) updates.name = name.trim();
    if (role && ["Manager", "Member"].includes(role)) updates.role = role;
    if (avatar !== undefined) updates.avatar = avatar;
    if (timezone !== undefined) updates.timezone = timezone;
    if (notificationSettings !== undefined) {
      updates.notificationSettings = {
        emailDigest: !!notificationSettings.emailDigest,
        slackWebhookAlerts: !!notificationSettings.slackWebhookAlerts,
        dailyReminders: !!notificationSettings.dailyReminders
      };
    }

    const updated = await updateUser(req.user.id, updates);
    if (!updated) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: { user: sanitizeUser(updated) }
    });
  } catch (error) {
    console.error("Update profile controller error:", error);
    return res.status(500).json({ success: false, message: "Failed to update profile" });
  }
}

export async function oauthLogin(req, res) {
  try {
    const { provider, email, name, avatar } = req.body;

    if (!provider || !email || !name) {
      return res.status(400).json({ success: false, message: "Provider, Email and Name are required" });
    }

    const formattedEmail = email.toLowerCase().trim();
    let user = await findOneUser({ email: formattedEmail });

    if (!user) {
      user = {
        id: crypto.randomUUID(),
        email: formattedEmail,
        passwordHash: hashPassword(crypto.randomUUID()),
        name,
        role: "Member",
        teams: [],
        streak: 0,
        lastSubmissionDate: null,
        badges: ["Inception", "OAuth Connected"],
        avatar: avatar || "🤖",
        timezone: "UTC",
        notificationSettings: {
          emailDigest: true,
          slackWebhookAlerts: false,
          dailyReminders: true
        }
      };
      await createUser(user);
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    return res.status(200).json({
      success: true,
      message: `Successfully connected with ${provider === "google" ? "Google Workspace" : "Microsoft 365"} OAuth`,
      data: { token, user: sanitizeUser(user) }
    });
  } catch (error) {
    console.error("OAuth login controller error:", error);
    return res.status(500).json({ success: false, message: "OAuth authorization handshake failed" });
  }
}
