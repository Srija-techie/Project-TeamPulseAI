export function calculateTeamAnalytics(teamMembers, teamStandups, todayStr) {
  const totalMembers = teamMembers.length;

  const submittedTodayCount = teamStandups.filter(s => s.date === todayStr).length;
  const participationRate = totalMembers > 0 ? Math.round((submittedTodayCount / totalMembers) * 100) : 0;

  const leaderboard = teamMembers
    .map(m => ({ id: m.id, name: m.name, streak: m.streak, badges: m.badges }))
    .sort((a, b) => b.streak - a.streak)
    .slice(0, 10);

  const moodScores = teamStandups
    .filter(s => typeof s.aiMoodScore === "number")
    .slice(0, 30)
    .map(s => s.aiMoodScore);

  const averageMoodScore = moodScores.length > 0
    ? Math.round(moodScores.reduce((a, b) => a + b, 0) / moodScores.length)
    : 80;

  const blockerReports = teamStandups.filter(
    s => s.blockers && s.blockers.toLowerCase() !== "none" && s.blockers.trim() !== ""
  );

  return {
    totalMembers,
    submittedTodayCount,
    participationRate,
    averageMoodScore,
    totalBlockersCurrent: blockerReports.length,
    leaderboard,
    last7DaysSubmissionsCount: teamStandups.length
  };
}
