import cron from "node-cron";
import { findTeams, findStandups, upsertInsight } from "../models/db.js";
import { generateTeamInsights } from "../services/ai/gemini.js";
import { getTeamManagerEmail, generatePDFReportBuffer, sendWeeklyPDFEmail } from "../services/mail/email.js";
import crypto from "crypto";

export async function compileWeeklyReportForTeam(teamId) {
  try {
    const teams = await findTeams({});
    const team = teams.find(t => t.id === teamId);
    if (!team) {
      console.error(`[Weekly Report Cron] Team with ID ${teamId} not found.`);
      return;
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const allStandups = await findStandups({ teamId, isDraft: false });
    const weeklyStandups = allStandups.filter(s => new Date(s.date) >= oneWeekAgo);

    console.log(`[Weekly Report Cron] Found ${weeklyStandups.length} standups over the last 7 days for team ${team.name}`);

    const insightPayload = await generateTeamInsights(weeklyStandups, team.name);
    const newInsight = { id: crypto.randomUUID(), teamId, date: todayStr, ...insightPayload };

    await upsertInsight({ teamId, date: todayStr }, newInsight);
    console.log(`[Weekly Report Cron] Saved TeamInsight entry: ${newInsight.id} for date: ${todayStr}`);

    const managerEmail = await getTeamManagerEmail(teamId, team.ownerId);
    const pdfBuffer = generatePDFReportBuffer(team.name, weeklyStandups, newInsight);
    const mailResult = await sendWeeklyPDFEmail(managerEmail, team.name, pdfBuffer, newInsight);
    console.log(`[Weekly Report Cron] Report email dispatch finished. Mode: ${mailResult.mode}. Recipient: ${mailResult.emailList}`);
  } catch (error) {
    console.error(`[Weekly Report Cron] Failed to compile weekly report for team ${teamId}:`, error);
  }
}

export function initializeWeeklyReportCron() {
  console.log("⏱️ Initializing TeamPulseAI Weekly Scheduler Cron Daemon...");

  const cronExpression = "0 17 * * 5";

  if (cron.validate(cronExpression)) {
    cron.schedule(cronExpression, async () => {
      console.log("🔔 [Scheduler Daemon] Triggering scheduled weekly report compiles across active workspaces...");
      const teams = await findTeams({});
      for (const team of teams) {
        console.log(`[Weekly Report Cron] Launching auto-compile task for Team: ${team.name}...`);
        await compileWeeklyReportForTeam(team.id);
      }
      console.log("🔔 [Scheduler Daemon] Automated weekly report tasks completed.");
    });
    console.log(`📅 Weekly Report Cron Job scheduled to fire automatically on pattern: "${cronExpression}" (Every Friday at 17:00)`);
  } else {
    console.error(`❌ Invalid cron expression pattern: "${cronExpression}"`);
  }
}
