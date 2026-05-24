import crypto from "crypto";
import { findOneUser, updateUser, findTeams, findOneTeam, createTeamDoc, updateTeam, deleteTeamDoc, findUsers, findStandups, findInsights } from "../models/db.js";

export async function createTeam(req, res) {
  try {
    const { name, questions, standupTime, timezone, deadline, theme, emoji } = req.body;
    if (!name) {
      res.status(400).json({ success: false, message: "Team name is required" });
      return;
    }

    const userId = req.user.id;
    const teamId = crypto.randomUUID();
    const inviteCode = crypto.randomBytes(4).toString("hex").toUpperCase();

    const newTeam = {
      id: teamId,
      name: name.trim(),
      inviteCode,
      ownerId: userId,
      settings: {
        questions: Array.isArray(questions) && questions.length > 0 ? questions : [
          "What did you manage to accomplish yesterday?",
          "What is your target objective for today?",
          "Are there any core blockers or dependencies delaying you?"
        ],
        standupTime: standupTime || "09:30",
        timezone: timezone || "UTC",
        deadline: deadline || "11:00",
        theme: theme || "emerald",
        emoji: emoji || "🚀",
        weekdays: ["Mon", "Tue", "Wed", "Thu", "Fri"]
      },
      vacationUsers: []
    };

    await createTeamDoc(newTeam);

    const user = await findOneUser({ id: userId });
    if (user) {
      const teams = user.teams || [];
      if (!teams.includes(teamId)) {
        await updateUser(userId, { teams: [...teams, teamId] });
      }
    }

    res.status(201).json({
      success: true,
      message: "Team successfully bootstrapped",
      data: { team: newTeam }
    });
  } catch (error) {
    console.error("Create team controller error:", error);
    res.status(500).json({ success: false, message: "Failed to instantiate team" });
  }
}

export async function joinTeam(req, res) {
  try {
    const { inviteCode } = req.body;
    if (!inviteCode) {
      res.status(400).json({ success: false, message: "Invite code is required" });
      return;
    }

    const trimmedCode = inviteCode.trim().toUpperCase();
    const team = await findOneTeam({ inviteCode: trimmedCode });
    if (!team) {
      res.status(404).json({ success: false, message: "Invalid invite code" });
      return;
    }

    const userId = req.user.id;
    const user = await findOneUser({ id: userId });
    if (!user) {
      res.status(404).json({ success: false, message: "Authenticated user not found" });
      return;
    }

    if ((user.teams || []).includes(team.id)) {
      res.status(400).json({ success: false, message: "You are already a member of this team" });
      return;
    }

    await updateUser(userId, { teams: [...(user.teams || []), team.id] });

    res.status(200).json({
      success: true,
      message: `Successfully joined ${team.name}!`,
      data: { team }
    });
  } catch (error) {
    console.error("Join team controller error:", error);
    res.status(500).json({ success: false, message: "Failed to join team" });
  }
}

export async function getMyTeams(req, res) {
  try {
    const userId = req.user.id;
    const user = await findOneUser({ id: userId });
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    const userTeamIds = user.teams || [];
    const allTeams = await findTeams({});
    const myTeams = allTeams.filter(t => userTeamIds.includes(t.id));

    res.status(200).json({ success: true, data: { teams: myTeams } });
  } catch (error) {
    console.error("Get my teams controller error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch your teams" });
  }
}

export async function getTeamMembers(req, res) {
  try {
    const { teamId } = req.params;
    const team = await findOneTeam({ id: teamId });
    if (!team) {
      res.status(404).json({ success: false, message: "Team not found" });
      return;
    }

    const allUsers = await findUsers({});
    const members = allUsers
      .filter(u => (u.teams || []).includes(teamId))
      .map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        streak: u.streak,
        badges: u.badges,
        isVacation: (team.vacationUsers || []).includes(u.id)
      }));

    res.status(200).json({ success: true, data: { members } });
  } catch (error) {
    console.error("Get team members controller error:", error);
    res.status(500).json({ success: false, message: "Failed to load team members" });
  }
}

export async function toggleVacation(req, res) {
  try {
    const { teamId } = req.params;
    const userId = req.user.id;

    const team = await findOneTeam({ id: teamId });
    if (!team) {
      res.status(404).json({ success: false, message: "Team not found" });
      return;
    }

    const vacationUsers = team.vacationUsers || [];
    let isOOO = false;
    let updatedVacation;

    if (vacationUsers.includes(userId)) {
      updatedVacation = vacationUsers.filter(id => id !== userId);
    } else {
      updatedVacation = [...vacationUsers, userId];
      isOOO = true;
    }

    await updateTeam(teamId, { vacationUsers: updatedVacation });

    res.status(200).json({
      success: true,
      message: isOOO ? "Out of Office status set" : "Back to Office status set",
      data: { isVacation: isOOO, vacationUsers: updatedVacation }
    });
  } catch (error) {
    console.error("Toggle vacation controller error:", error);
    res.status(500).json({ success: false, message: "Failed to toggle vacation status" });
  }
}

export async function updateTeamSettings(req, res) {
  try {
    const { teamId } = req.params;
    const {
      name, questions, standupTime, deadline, timezone, theme, emoji, weekdays,
      remindersEnabled, slackChannel, emailMailingList, webhookUrl, webhookToken
    } = req.body;

    const team = await findOneTeam({ id: teamId });
    if (!team) {
      res.status(404).json({ success: false, message: "Team not found" });
      return;
    }

    const isOwner = team.ownerId === req.user.id;
    const isAdminOrManager = req.user.role === "Admin" || req.user.role === "Manager";
    if (!isOwner && !isAdminOrManager) {
      res.status(403).json({ success: false, message: "Forbidden: Only owners, managers, or admins can tweak team schedules" });
      return;
    }

    const updates = { settings: { ...team.settings } };
    if (name && name.trim()) updates.name = name.trim();
    if (questions && Array.isArray(questions) && questions.length > 0) updates.settings.questions = questions;
    if (standupTime) updates.settings.standupTime = standupTime;
    if (deadline) updates.settings.deadline = deadline;
    if (timezone) updates.settings.timezone = timezone;
    if (theme) updates.settings.theme = theme;
    if (emoji) updates.settings.emoji = emoji;
    if (weekdays && Array.isArray(weekdays)) updates.settings.weekdays = weekdays;
    if (typeof remindersEnabled === "boolean") updates.settings.remindersEnabled = remindersEnabled;
    if (typeof slackChannel === "string") updates.settings.slackChannel = slackChannel;
    if (typeof emailMailingList === "string") updates.settings.emailMailingList = emailMailingList;
    if (typeof webhookUrl === "string") updates.settings.webhookUrl = webhookUrl;
    if (typeof webhookToken === "string") updates.settings.webhookToken = webhookToken;

    const updated = await updateTeam(teamId, updates);

    res.status(200).json({
      success: true,
      message: "Team schedule settings updated successfully",
      data: { team: updated || { ...team, ...updates } }
    });
  } catch (error) {
    console.error("Update team settings controller error:", error);
    res.status(500).json({ success: false, message: "Failed to modify team schedule settings" });
  }
}

export async function deleteTeam(req, res) {
  try {
    const { teamId } = req.params;

    const team = await findOneTeam({ id: teamId });
    if (!team) {
      res.status(404).json({ success: false, message: "Workspace not found" });
      return;
    }

    const isOwner = team.ownerId === req.user.id;
    const isAdmin = req.user.role === "Admin";
    if (!isOwner && !isAdmin) {
      res.status(403).json({ success: false, message: "Forbidden: Only the team owner or an Admin can delete this workspace" });
      return;
    }

    await deleteTeamDoc(teamId);

    // Remove teamId from all users
    const allUsers = await findUsers({});
    for (const u of allUsers) {
      if ((u.teams || []).includes(teamId)) {
        await updateUser(u.id, { teams: u.teams.filter(id => id !== teamId) });
      }
    }

    res.status(200).json({
      success: true,
      message: `Workspace "${team.name}" and all historical data successfully purged`
    });
  } catch (error) {
    console.error("Delete team controller error:", error);
    res.status(500).json({ success: false, message: "Failed to delete team workspace" });
  }
}

export async function updateUserRole(req, res) {
  try {
    const { teamId, userId } = req.params;
    const { role } = req.body;

    if (!role || !["Admin", "Manager", "Member"].includes(role)) {
      res.status(400).json({ success: false, message: "Invalid role value. Must be Admin, Manager, or Member" });
      return;
    }

    const team = await findOneTeam({ id: teamId });
    if (!team) {
      res.status(404).json({ success: false, message: "Team not found" });
      return;
    }

    const isOwner = team.ownerId === req.user.id;
    const isAdmin = req.user.role === "Admin";
    if (!isOwner && !isAdmin) {
      res.status(403).json({ success: false, message: "Forbidden: Only team owners or system administrators can re-assign roles" });
      return;
    }

    const targetUser = await findOneUser({ id: userId });
    if (!targetUser) {
      res.status(404).json({ success: false, message: "Member user not found" });
      return;
    }

    await updateUser(userId, { role });

    res.status(200).json({
      success: true,
      message: `Successfully updated ${targetUser.name}'s workspace role to ${role}.`,
      data: { userId, role }
    });
  } catch (error) {
    console.error("Update user role error:", error);
    res.status(500).json({ success: false, message: "Failed to update member role" });
  }
}
