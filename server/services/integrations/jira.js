export function formatJiraLogItem(issueKey, summary) {
  return `Closed JIRA ticket [${issueKey}] - ${summary || "Refactored module dependencies"}`;
}
