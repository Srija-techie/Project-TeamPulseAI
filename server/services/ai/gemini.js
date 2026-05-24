import { GoogleGenAI, Type } from "@google/genai";

let aiInstance = null;
let apiWarned = false;

function getAIClient() {
  if (aiInstance) return aiInstance;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    if (!apiWarned) {
      console.warn("⚠️ GEMINI_API_KEY is not configured or holds placeholder. Falling back to offline heuristics.");
      apiWarned = true;
    }
    return null;
  }

  try {
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: { "User-Agent": "aistudio-build" }
      }
    });
    return aiInstance;
  } catch (err) {
    console.error("Failed to initialize GoogleGenAI client:", err);
    return null;
  }
}

function analyzeOfflineStandup(yesterday, today, blockers, mood) {
  const lowercaseBlockers = blockers.toLowerCase();
  const extractedBlockers = [];
  if (blockers && blockers.trim().length > 2 && !lowercaseBlockers.includes("none") && !lowercaseBlockers.includes("no blockers")) {
    extractedBlockers.push(blockers.trim());
  } else {
    if (lowercaseBlockers.includes("blocked by") || lowercaseBlockers.includes("waiting on") || lowercaseBlockers.includes("stuck")) {
      extractedBlockers.push(blockers.trim());
    }
  }

  const actionItems = [];
  const lines = today.split(/[\n,;.]+/);
  for (const line of lines) {
    const clean = line.replace(/^[\s*\-•0-9.)]+/, "").trim();
    if (clean.length > 5 && (
      clean.toLowerCase().startsWith("setup") || clean.toLowerCase().startsWith("build") ||
      clean.toLowerCase().startsWith("create") || clean.toLowerCase().startsWith("fix") ||
      clean.toLowerCase().startsWith("review") || clean.toLowerCase().startsWith("implement") ||
      clean.toLowerCase().startsWith("code") || clean.toLowerCase().startsWith("design")
    )) {
      actionItems.push(clean);
    }
  }
  if (actionItems.length === 0 && today.trim().length > 0) {
    actionItems.push(today.slice(0, 80) + (today.length > 80 ? "..." : ""));
  }

  let moodScore = 50;
  if (mood === "excellent") moodScore = 95;
  else if (mood === "good") moodScore = 80;
  else if (mood === "neutral") moodScore = 60;
  else if (mood === "unhappy") moodScore = 35;
  else if (mood === "stressed") moodScore = 20;

  return {
    aiSummary: `Offline Standup Summary: Completed tasks from yesterday (${yesterday.slice(0, 50)}...). Planning to focus on: ${actionItems.join(", ") || "daily duties"}.`,
    aiBlockers: extractedBlockers.length > 0 ? extractedBlockers : ["None reported"],
    aiActionItems: actionItems.length > 0 ? actionItems : ["Complete daily activities"],
    aiMoodScore: moodScore
  };
}

export async function analyzeStandup(yesterday, today, blockers, mood) {
  const client = getAIClient();
  if (!client) {
    return analyzeOfflineStandup(yesterday, today, blockers, mood);
  }

  try {
    const prompt = `Analyze this team member's daily standup submission:\nYesterday's work: "${yesterday}"\nToday's plan: "${today}"\nBlockers reported: "${blockers}"\nSelf-reported mood: "${mood}"\n\nExtract and generate:\n1. A concise 1-sentence summary of their high-level work and state.\n2. A list of concrete "blockers" they are facing. If they explicitly have no blockers or say "none", return empty or ["None"].\n3. A list of actionable "actionItems" for today's plan.\n4. An objective "moodScore" from 1 to 100 based on the text contents and reported mood.\n\nProvide the exact JSON object output with keys: "aiSummary" (string), "aiBlockers" (array of strings), "aiActionItems" (array of strings), "aiMoodScore" (number).`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            aiSummary: { type: Type.STRING },
            aiBlockers: { type: Type.ARRAY, items: { type: Type.STRING } },
            aiActionItems: { type: Type.ARRAY, items: { type: Type.STRING } },
            aiMoodScore: { type: Type.INTEGER }
          },
          required: ["aiSummary", "aiBlockers", "aiActionItems", "aiMoodScore"]
        }
      }
    });

    if (response.text) {
      const result = JSON.parse(response.text.trim());
      return {
        aiSummary: result.aiSummary || "No summary generated.",
        aiBlockers: Array.isArray(result.aiBlockers) ? result.aiBlockers : [],
        aiActionItems: Array.isArray(result.aiActionItems) ? result.aiActionItems : [],
        aiMoodScore: typeof result.aiMoodScore === "number" ? result.aiMoodScore : 70
      };
    }
    throw new Error("Empty response from Gemini.");
  } catch (error) {
    console.error("Gemini API standup analysis failed. Falling back to offline heuristics:", error);
    return analyzeOfflineStandup(yesterday, today, blockers, mood);
  }
}

export async function generateTeamInsights(standups, teamName) {
  if (standups.length === 0) {
    return {
      healthScore: 80,
      summary: "No submissions recorded yet for this period. Active tracking starts as team members submit their daily standups.",
      actionItems: ["Encourage members to record yesterday's, today's, and blocker responses"],
      blockerFrequency: {},
      moodTrend: "Balanced mood with zero submission friction"
    };
  }

  const client = getAIClient();

  const analyzeOfflineTeam = () => {
    let totals = 0;
    let totalScore = 0;
    const blockerCount = {};
    const actions = [];

    standups.forEach(s => {
      totals++;
      totalScore += s.aiMoodScore || 60;
      if (s.blockers && s.blockers.toLowerCase() !== "none" && s.blockers.trim() !== "") {
        const word = s.blockers.split(" ")[0].toLowerCase().replace(/[^a-z]/g, "");
        if (word.length > 2) {
          blockerCount[word] = (blockerCount[word] || 0) + 1;
        } else {
          blockerCount["general"] = (blockerCount["general"] || 0) + 1;
        }
      }
      if (s.aiActionItems) {
        s.aiActionItems.slice(0, 2).forEach(act => actions.push(`${s.userName}: ${act}`));
      }
    });

    const avgMood = totals > 0 ? Math.round(totalScore / totals) : 75;
    const healthScore = Math.max(10, Math.min(100, avgMood - (Object.keys(blockerCount).length * 5)));

    return {
      healthScore,
      summary: `Offline Team Insight for ${teamName}: Analyzing ${totals} standup(s). Team productivity is stable. Highlighted achievements focus on ongoing feature expansion and blocker resolutions.`,
      actionItems: actions.length > 0 ? actions.slice(0, 4) : ["Ensure clear action accountability", "Review listed blockers in morning sync"],
      blockerFrequency: blockerCount,
      moodTrend: avgMood >= 80 ? "Positive and motivated environment" : avgMood >= 65 ? "Steady and focused velocity" : "Elevated feedback loop delay / stress triggers"
    };
  };

  if (!client) {
    return analyzeOfflineTeam();
  }

  try {
    const dataSummary = standups.map(s =>
      `User: ${s.userName}\nYesterday: ${s.yesterday}\nToday: ${s.today}\nBlockers: ${s.blockers}\nMood: ${s.mood} (AI Mood Score: ${s.aiMoodScore || "N/A"})`
    ).join("\n---\n");

    const prompt = `You are a world-class Agile Coach and Team Analytics model. Combine these standup reports for team "${teamName}" and create team metrics and actions.\n\nStandup submissions:\n${dataSummary}\n\nExtract and calculate:\n1. An overall numeric team "healthScore" from 1 to 100 based on blockages, streaks, and mood metrics.\n2. An elegant visual "summary" (2-3 sentences max) outlining team trajectory, velocity, and core accomplishments.\n3. 3-4 highly specific "actionItems" for managerial attention (mentioning responsible team members where relevant).\n4. A keyword mapping of "blockerFrequency" counting common blocker categories (e.g., {"api": 2, "reviews": 1}).\n5. A descriptive "moodTrend" statement matching the collective psychology.\n\nProvide your analysis exactly in a single JSON object. Schema:\n{\n  "healthScore": integer,\n  "summary": string,\n  "actionItems": array of strings,\n  "blockerFrequency": object where keys are string keywords and values are integers,\n  "moodTrend": string\n}`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            healthScore: { type: Type.INTEGER },
            summary: { type: Type.STRING },
            actionItems: { type: Type.ARRAY, items: { type: Type.STRING } },
            blockerFrequency: { type: Type.OBJECT, description: "Mapping of blocker keywords to counts." },
            moodTrend: { type: Type.STRING }
          },
          required: ["healthScore", "summary", "actionItems", "blockerFrequency", "moodTrend"]
        }
      }
    });

    if (response.text) {
      const result = JSON.parse(response.text.trim());
      return {
        healthScore: result.healthScore || 80,
        summary: result.summary || `Cohesive standups parsed for team "${teamName}".`,
        actionItems: result.actionItems || [],
        blockerFrequency: result.blockerFrequency || {},
        moodTrend: result.moodTrend || "Steady alignment"
      };
    }
    throw new Error("No text response received.");
  } catch (error) {
    console.error("Gemini failed to generate team insights, falling back to heuristics:", error);
    return analyzeOfflineTeam();
  }
}

function offlineSprintCoach(standups, teamName, members, question) {
  const lowercaseQuestion = question.toLowerCase();
  const totalSubmissions = standups.length;
  const totalMembers = members.length;

  const blockages = standups.filter(s => s.blockers && s.blockers.toLowerCase() !== "none" && s.blockers.trim() !== "");
  const moods = standups.map(s => s.mood);
  const excellentMoods = moods.filter(m => m === "excellent" || m === "good").length;

  let answer = `### 🤖 Sprint Coach (Offline Mode)\n\n`;
  answer += `I'm currently running in offline fallback mode because no \`GEMINI_API_KEY\` is configured, but I can still read your team's historical records for **${teamName}** (${totalMembers} members, ${totalSubmissions} total standups).\n\n`;

  if (lowercaseQuestion.includes("block") || lowercaseQuestion.includes("stuck") || lowercaseQuestion.includes("hindrance")) {
    answer += `#### 🚧 Blocker Analysis\n`;
    if (blockages.length > 0) {
      answer += `I found **${blockages.length}** historical blocker reports:\n`;
      blockages.forEach(b => { answer += `- **${b.userName}** (${b.date}): *"${b.blockers}"*\n`; });
      answer += `\n**Recommendation:** Direct focus session/assistance could help resolve these blockers immediately. Ensure other team members are unblocked.`;
    } else {
      answer += `Awesome! No active or severe blockers have been logged in the historical standups. Keep this frictionless pace!`;
    }
  } else if (lowercaseQuestion.includes("mood") || lowercaseQuestion.includes("happy") || lowercaseQuestion.includes("feel") || lowercaseQuestion.includes("burnout")) {
    answer += `#### 📈 Team Sentiment & Mood\n`;
    answer += `- High enthusiasm: **${excellentMoods}** out of ${totalSubmissions} check-ins were registered as good/excellent.\n`;
    const unhappyCount = moods.filter(m => m === "unhappy" || m === "stressed").length;
    if (unhappyCount > 0) {
      answer += `- Warning indicators: **${unhappyCount}** submissions reported stress or frustration.\n`;
    }
    answer += `\n**Recommendation:** Check in with members reporting lower mood levels. Agile momentum relies heavily on a psychologically safe workspace.`;
  } else if (lowercaseQuestion.includes("yesterday") || lowercaseQuestion.includes("history") || lowercaseQuestion.includes("done") || lowercaseQuestion.includes("accomplish")) {
    answer += `#### 📂 Completed Work Summary\n`;
    if (standups.length > 0) {
      answer += `Here is a snapshot of historical achievements completed by the team recently:\n`;
      standups.slice(0, 5).forEach(s => { answer += `- **${s.userName}** (${s.date}): *"${s.yesterday || "No details provided"}"*\n`; });
    } else {
      answer += `No historical standup submissions have been registered yet to list past achievements.`;
    }
  } else {
    answer += `#### 📋 General Team Pulse Overview\n`;
    answer += `- **Active Members**: ${totalMembers}\n`;
    answer += `- **Standup Submissions**: ${totalSubmissions}\n`;
    answer += `- **Flagged Blockers**: ${blockages.length}\n\n`;
    answer += `Based on your request ("*${question}*"), I recommend exploring the Standups tab or Team Insights for specific daily summaries. To enable fluent AI-powered coaching dialogue, please configure your **GEMINI_API_KEY** in the Secrets tab.`;
  }

  return answer;
}

export async function askSprintCoachAI(standups, teamName, members, question, chatHistory = []) {
  const client = getAIClient();
  if (!client) {
    return offlineSprintCoach(standups, teamName, members, question);
  }

  try {
    const membersSummary = members.map(m => `- ${m.name} (Role: ${m.role}, Current Streak: ${m.streak} days)`).join("\n");
    const sortedStandups = [...standups].sort((a, b) => a.date.localeCompare(b.date));

    const standupHistorySummary = sortedStandups.map(s =>
      `Date: ${s.date} | Member: ${s.userName}\n- Yesterday's Work: ${s.yesterday || "None"}\n- Today's Plan: ${s.today || "None"}\n- Reported Blockers: ${s.blockers || "None"}\n- Mood: ${s.mood} ${s.aiMoodScore ? `(AI Mood Score: ${s.aiMoodScore}/100)` : ""} ${s.aiSummary ? `(AI Summary: ${s.aiSummary})` : ""}`
    ).join("\n---\n");

    const systemInstruction = `You are "Sprint Coach", an elite team Agile Coach and Project Coordinator powered by Gemini.\nYour goals are to analyze the historical daily standup submissions, user streaks, blockers, and mood trends to answer the user's questions about their team's productivity, blockers, trajectory, well-being, and progress.\n\nBelow are the details about team "${teamName}":\n\n### TEAM MEMBERS:\n${membersSummary}\n\n### HISTORICAL STANDUP LOGS:\n${standups.length > 0 ? standupHistorySummary : "No standups submitted yet."}\n\nWhen answering:\n1. Be highly encouraging, analytical, actionable, professional, and empathetic.\n2. Reference specific team members, dates, tasks, and blockers where appropriate.\n3. Format output in neat professional markdown (numbered list, bold, code sections). Keep details concise but insightful.\n4. If asked about team trends or burnout, compile patterns in mood fluctuation or who has been stuck frequently.\n5. Use the dialogue history (if any) to respond cohesively without repeating the context introductory text. Do not make up events or names that are not in the provided historical log.`;

    const contents = [];
    chatHistory.forEach(turn => {
      contents.push({ role: turn.role, parts: [{ text: turn.text }] });
    });
    contents.push({ role: "user", parts: [{ text: question }] });

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: { systemInstruction, temperature: 0.7 }
    });

    if (response.text) return response.text;
    throw new Error("No text returned from Gemini API");
  } catch (error) {
    console.error("Sprint Coach chat generation failed, falling back to offline logic:", error);
    return offlineSprintCoach(standups, teamName, members, question);
  }
}
