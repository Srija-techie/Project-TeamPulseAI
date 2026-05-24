import crypto from "crypto";
import { findOneUser, updateUser, findUsers, findOneTeam, findTeams, findStandups, findOneStandup, upsertStandup, findInsights, upsertInsight } from "../models/db.js";
import { analyzeStandup, generateTeamInsights, askSprintCoachAI } from "../services/ai/gemini.js";
import { formatAndSendEmailDigest, getTeamManagerEmail, generatePDFReportBuffer, sendWeeklyPDFEmail } from "../services/mail/email.js";
import { formatAndSendSlackBroadcast } from "../services/integrations/slack.js";
import { formatJiraLogItem } from "../services/integrations/jira.js";
import { calculateTeamAnalytics } from "../services/analytics/analytics.js";
import StandupModel from "../models/Standup.js";
import mongoose from "mongoose";

function isMongoConnected() {
  return mongoose.connection.readyState === 1;
}

export async function submitStandup(req, res) {
  try {
    const { teamId, yesterday, today, blockers, mood, isDraft, isBlocked, stressLevel } = req.body;
    if (!teamId || !mood) {
      res.status(400).json({ success: false, message: "Team ID and Mood are required parameters" });
      return;
    }

    const userId = req.user.id;
    const userName = req.user.name;
    const dateStr = new Date().toISOString().split("T")[0];

    const finalYesterday = yesterday || "";
    const finalToday = today || "";
    const finalBlockers = blockers || "";

    const existing = await findOneStandup({ userId, teamId, date: dateStr });

    const standupData = {
      id: existing?.id || crypto.randomUUID(),
      userId,
      userName,
      teamId,
      date: dateStr,
      timestamp: new Date().toISOString(),
      yesterday: finalYesterday,
      today: finalToday,
      blockers: finalBlockers,
      mood,
      isDraft: !!isDraft,
      isBlocked: typeof isBlocked === "boolean" ? isBlocked : !!finalBlockers.trim(),
      stressLevel: typeof stressLevel === "number" ? stressLevel : 3,
      comments: existing?.comments || []
    };

    if (!standupData.isDraft) {
      const aiMetrics = await analyzeStandup(
        standupData.yesterday,
        standupData.today,
        standupData.blockers,
        standupData.mood
      );
      standupData.aiSummary = aiMetrics.aiSummary;
      standupData.aiBlockers = aiMetrics.aiBlockers;
      standupData.aiActionItems = aiMetrics.aiActionItems;
      standupData.aiMoodScore = aiMetrics.aiMoodScore;

      // Update streak
      const user = await findOneUser({ id: userId });
      if (user) {
        const lastSub = user.lastSubmissionDate;
        let streak = user.streak || 0;
        if (lastSub !== dateStr) {
          if (!lastSub) {
            streak = 1;
          } else {
            const yesterdayDate = new Date();
            yesterdayDate.setDate(yesterdayDate.getDate() - 1);
            const yesterdayStr = yesterdayDate.toISOString().split("T")[0];
            streak = lastSub === yesterdayStr ? streak + 1 : 1;
          }
          await updateUser(userId, { streak, lastSubmissionDate: dateStr });
        }
      }
    }

    const standupItem = await upsertStandup(
      { userId, teamId, date: dateStr },
      standupData
    );

    res.status(200).json({
      success: true,
      message: standupData.isDraft ? "Standup draft saved online" : "Daily standup submitted successfully!",
      data: { standup: standupItem }
    });
  } catch (error) {
    console.error("Submit standup controller error:", error);
    res.status(500).json({ success: false, message: "Standard compilation failed for standup submission" });
  }
}

export async function getDraft(req, res) {
  try {
    const { teamId } = req.params;
    const userId = req.user.id;
    const dateStr = new Date().toISOString().split("T")[0];

    const draft = await findOneStandup({ userId, teamId, date: dateStr, isDraft: true });

    res.status(200).json({ success: true, data: { draft: draft || null } });
  } catch (error) {
    console.error("Get draft controller error:", error);
    res.status(500).json({ success: false, message: "Failed to find active standup draft" });
  }
}

export async function getStandups(req, res) {
  try {
    const { teamId } = req.params;
    const { date, userId, search, hasBlockers } = req.query;

    let query = { teamId, isDraft: false };
    if (date) query.date = date;
    if (userId) query.userId = userId;

    let standups = await findStandups(query);

    if (hasBlockers === "true") {
      standups = standups.filter(
        s => s.blockers && s.blockers.toLowerCase() !== "none" && s.blockers.trim() !== ""
      );
    }
    if (search) {
      const term = search.toLowerCase();
      standups = standups.filter(
        s =>
          (s.yesterday || "").toLowerCase().includes(term) ||
          (s.today || "").toLowerCase().includes(term) ||
          (s.blockers || "").toLowerCase().includes(term) ||
          (s.userName || "").toLowerCase().includes(term)
      );
    }

    standups.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const allUsers = await findUsers({});
    const standupsWithAvatars = standups.map(s => {
      const u = allUsers.find(user => user.id === s.userId);
      const comments = (s.comments || []).map(c => {
        const commenter = allUsers.find(user => user.id === c.userId);
        return {
          ...c,
          userAvatar: commenter?.avatar || c.userAvatar || "🦊",
          userName: commenter?.name || c.userName
        };
      });
      return { ...s, userAvatar: u?.avatar || "🦊", comments };
    });

    res.status(200).json({ success: true, data: { standups: standupsWithAvatars } });
  } catch (error) {
    console.error("Get standups controller error:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve standup list" });
  }
}

export async function generateTeamReport(req, res) {
  try {
    const { teamId } = req.params;
    const { date } = req.query;
    const dateStr = date || new Date().toISOString().split("T")[0];

    const team = await findOneTeam({ id: teamId });
    if (!team) {
      res.status(404).json({ success: false, message: "Team not found" });
      return;
    }

    const teamStandupsForDate = await findStandups({ teamId, date: dateStr, isDraft: false });
    const insightPayload = await generateTeamInsights(teamStandupsForDate, team.name);

    const newInsight = {
      id: crypto.randomUUID(),
      teamId,
      date: dateStr,
      ...insightPayload
    };

    await upsertInsight({ teamId, date: dateStr }, newInsight);

    const managerEmail = await getTeamManagerEmail(teamId, team.ownerId);
    const mailResult = await sendWeeklyPDFEmail(
      managerEmail,
      team.name,
      generatePDFReportBuffer(team.name, teamStandupsForDate, newInsight),
      newInsight
    );

    res.status(200).json({
      success: true,
      message: "AI team intelligence report triggered successfully and emailed to the Team Manager",
      data: {
        insight: newInsight,
        emailDelivery: {
          success: mailResult.success,
          recipient: mailResult.emailList,
          mode: mailResult.mode,
          trace: mailResult.logTrace,
          deliveredAt: mailResult.deliveredAt
        }
      }
    });
  } catch (error) {
    console.error("Generate team report error:", error);
    res.status(500).json({ success: false, message: "Failed to compile AI coach insights" });
  }
}

export async function getTeamInsights(req, res) {
  try {
    const { teamId } = req.params;
    const { date } = req.query;

    const insights = await findInsights({ teamId });

    if (date) {
      const match = insights.find(ins => ins.date === date);
      res.status(200).json({ success: true, data: { insight: match || null } });
      return;
    }

    insights.sort((a, b) => b.date.localeCompare(a.date));
    res.status(200).json({ success: true, data: { insights } });
  } catch (error) {
    console.error("Get team insights error:", error);
    res.status(500).json({ success: false, message: "Failed to load team insights history" });
  }
}

export async function getTeamAnalyticsMetrics(req, res) {
  try {
    const { teamId } = req.params;

    const team = await findOneTeam({ id: teamId });
    if (!team) {
      res.status(404).json({ success: false, message: "Team not found" });
      return;
    }

    const allUsers = await findUsers({});
    const teamMembers = allUsers.filter(u => (u.teams || []).includes(teamId));
    const teamStandups = await findStandups({ teamId, isDraft: false });
    const todayStr = new Date().toISOString().split("T")[0];

    const analytics = calculateTeamAnalytics(teamMembers, teamStandups, todayStr);

    res.status(200).json({ success: true, data: { analytics } });
  } catch (error) {
    console.error("Get team analytics metrics error:", error);
    res.status(500).json({ success: false, message: "Failed to generate visual chart telemetry metrics" });
  }
}

export async function addComment(req, res) {
  try {
    const { standupId } = req.params;
    const { text } = req.body;
    if (!text || !text.trim()) {
      res.status(400).json({ success: false, message: "Comment message cannot be empty" });
      return;
    }

    const userId = req.user.id;
    const userName = req.user.name;
    const currentUser = await findOneUser({ id: userId });
    const userAvatar = currentUser?.avatar || "🦊";

    let standup;
    if (isMongoConnected()) {
      standup = await StandupModel.findOne({ id: standupId });
    } else {
      standup = await findOneStandup({ id: standupId });
    }

    if (!standup) {
      res.status(404).json({ success: false, message: "Standup report not found" });
      return;
    }

    const commentItem = {
      id: crypto.randomUUID(),
      userId,
      userName,
      userAvatar,
      text: text.trim(),
      timestamp: new Date().toISOString()
    };

    if (isMongoConnected()) {
      if (!standup.comments) standup.comments = [];
      standup.comments.push(commentItem);
      await standup.save();
    } else {
      const allStandups = await findStandups({});
      const idx = allStandups.findIndex(s => s.id === standupId);
      if (idx !== -1) {
        if (!allStandups[idx].comments) allStandups[idx].comments = [];
        allStandups[idx].comments.push(commentItem);
      }
    }

    const io = req.app.get("io");
    if (io) {
      io.to(standup.teamId).emit("comment_created", { standupId, comment: commentItem });
    }

    res.status(200).json({
      success: true,
      message: "Comment appended and broadcasted successfully!",
      data: { comment: commentItem }
    });
  } catch (error) {
    console.error("Add comment controller error:", error);
    res.status(500).json({ success: false, message: "Failed to post comment to standup repo" });
  }
}

export async function askSprintCoach(req, res) {
  try {
    const { teamId } = req.params;
    const { question, chatHistory } = req.body;

    if (!teamId || !question) {
      res.status(400).json({ success: false, message: "Team ID and Question are required parameters" });
      return;
    }

    const team = await findOneTeam({ id: teamId });
    if (!team) {
      res.status(404).json({ success: false, message: "Team not found" });
      return;
    }

    const currentUser = await findOneUser({ id: req.user.id });
    if (!currentUser || !(currentUser.teams || []).includes(teamId)) {
      res.status(403).json({ success: false, message: "Access denied. You are not a member of this team." });
      return;
    }

    const allUsers = await findUsers({});
    const teamMembers = allUsers
      .filter(u => (u.teams || []).includes(teamId))
      .map(u => ({ id: u.id, name: u.name, role: u.role, streak: u.streak }));

    const teamStandups = await findStandups({ teamId, isDraft: false });
    const answer = await askSprintCoachAI(teamStandups, team.name, teamMembers, question, chatHistory || []);

    res.status(200).json({ success: true, data: { answer } });
  } catch (error) {
    console.error("Sprint Coach controller error:", error);
    res.status(500).json({ success: false, message: "Failed to generate AI sprint coach recommendations" });
  }
}

export async function broadcastEmail(req, res) {
  try {
    const { teamId } = req.params;
    const team = await findOneTeam({ id: teamId });
    if (!team) {
      res.status(404).json({ success: false, message: "Team workspace not found" });
      return;
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const standups = await findStandups({ teamId, date: todayStr, isDraft: false });
    const insights = await findInsights({ teamId });
    const latestInsight = insights.sort((a, b) => b.date.localeCompare(a.date))[0];

    const result = formatAndSendEmailDigest(team, standups, latestInsight);

    res.status(200).json({
      success: true,
      message: `Daily report digest successfully broadcasted to ${result.emailList}`,
      data: { recipientList: result.emailList, logs: result.logTrace, deliveredAt: result.deliveredAt }
    });
  } catch (error) {
    console.error("Email broadcast error:", error);
    res.status(500).json({ success: false, message: "SMTP service failed to deliver report compile" });
  }
}

export async function broadcastSlack(req, res) {
  try {
    const { teamId } = req.params;
    const team = await findOneTeam({ id: teamId });
    if (!team) {
      res.status(404).json({ success: false, message: "Team workspace not found" });
      return;
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const standups = await findStandups({ teamId, date: todayStr, isDraft: false });
    const result = formatAndSendSlackBroadcast(team, standups);

    res.status(200).json({
      success: true,
      message: `Finalized board feed update pinged successfully to Slack channel ${result.channel}`,
      data: { channel: result.channel, logs: result.logTrace, dispatchedAt: result.dispatchedAt }
    });
  } catch (error) {
    console.error("Slack broadcast error:", error);
    res.status(500).json({ success: false, message: "Webhook post failed to execute socket connection" });
  }
}

export async function jiraWebhookUpdate(req, res) {
  try {
    const { email, teamId, issueKey, summary } = req.body;

    if (!email || !teamId || !issueKey) {
      res.status(400).json({ success: false, message: "Missing required parameters: email, teamId, and issueKey match are mandatory." });
      return;
    }

    const allUsers = await findUsers({});
    const user = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      res.status(404).json({ success: false, message: "User not found with organizational email: " + email });
      return;
    }

    const team = await findOneTeam({ id: teamId });
    if (!team) {
      res.status(404).json({ success: false, message: "Team workspace targeting error." });
      return;
    }

    const dateStr = new Date().toISOString().split("T")[0];
    const jiraLogItem = formatJiraLogItem(issueKey, summary);
    const existing = await findOneStandup({ userId: user.id, teamId, date: dateStr });

    if (existing && existing.isDraft) {
      await upsertStandup(
        { userId: user.id, teamId, date: dateStr },
        {
          ...existing,
          yesterday: existing.yesterday ? (existing.yesterday + "\n- " + jiraLogItem) : ("- " + jiraLogItem),
          timestamp: new Date().toISOString()
        }
      );
    } else if (!existing) {
      await upsertStandup(
        { userId: user.id, teamId, date: dateStr },
        {
          id: crypto.randomUUID(),
          userId: user.id,
          userName: user.name,
          teamId,
          date: dateStr,
          timestamp: new Date().toISOString(),
          yesterday: "- " + jiraLogItem,
          today: "",
          blockers: "",
          mood: "good",
          isDraft: true,
          isBlocked: false,
          stressLevel: 3
        }
      );
    }

    res.status(200).json({
      success: true,
      message: `Jira Webhook received successfully. Populated yesterday's check-in draft for ${user.name}`,
      data: { ticket: issueKey, populatedText: jiraLogItem, user: user.name, team: team.name }
    });
  } catch (error) {
    console.error("Jira webhook controller error:", error);
    res.status(500).json({ success: false, message: "Webhook handler failed." });
  }
}
