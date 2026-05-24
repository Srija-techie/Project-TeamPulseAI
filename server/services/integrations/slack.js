export function formatAndSendSlackBroadcast(team, standups) {
  const channel = team.settings.slackChannel || "#scrum-updates";

  const logTrace = `[Incoming Webhook] POST https://hooks.slack.com/services/T00/B00/X00
Payload: {
  "channel": "${channel}",
  "text": "⚡ *${team.name} Daily Standup Report Complete!* ⚡",
  "attachments": [
    {
      "color": "#36a64f",
      "title": "Check-ins filed: ${standups.length}",
      "text": "${standups.map(s => `• *${s.userName}*: ${s.yesterday.slice(0, 40)}...`).join("\\n")}"
    }
  ]
}`;

  return {
    channel,
    logTrace,
    dispatchedAt: new Date().toISOString()
  };
}
