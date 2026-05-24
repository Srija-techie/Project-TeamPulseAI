import { Award, Zap, Brain, Flame } from "lucide-react";

// Generates achievement intelligence dynamically from workspace context
export function calculateAchievementData(userStreak, standupCount, memberCount, averageMood) {
  const effectiveStandups = Math.max(standupCount, 1);
  const effectiveStreak = Math.max(userStreak, 1);

  const points = effectiveStandups * 120;
  const calculatedProd = averageMood ? Math.round(averageMood) : 78;

  const badges = [
    {
      id: "b1",
      title: "First Check-In",
      description: "Submit your very first daily standup report to the workspace team.",
      iconName: "first_standup",
      unlocked: effectiveStandups >= 1,
      progress: Math.min(effectiveStandups, 1),
      target: 1,
      unlockedAt: effectiveStandups >= 1 ? "Just Now" : undefined,
    },
    {
      id: "b2",
      title: "3-Day Runner",
      description: "Establish consistency by submitting standups for 3 consecutive days.",
      iconName: "streak_3",
      unlocked: effectiveStreak >= 3,
      progress: Math.min(effectiveStreak, 3),
      target: 3,
    },
    {
      id: "b3",
      title: "Weekly Captain",
      description: "Maintain a flawless 7-day submit streak with no vacation OOO gaps.",
      iconName: "streak_7",
      unlocked: effectiveStreak >= 7,
      progress: Math.min(effectiveStreak, 7),
      target: 7,
    },
    {
      id: "b4",
      title: "Sunrise Pioneer",
      description: "Submit your daily standup update before 9:00 AM local workspace time.",
      iconName: "early_bird",
      unlocked: false,
      progress: 0,
      target: 1,
    },
    {
      id: "b5",
      title: "Knowledge Sherpa",
      description: "Leave 3 or more helpful feedback comments on your teammates' standups.",
      iconName: "team_helper",
      unlocked: false,
      progress: 0,
      target: 3,
    },
    {
      id: "b6",
      title: "Friction Slayer",
      description: "Successfully mark a reported blocker as resolved or solved with AI Coach.",
      iconName: "blocker_crusher",
      unlocked: false,
      progress: 0,
      target: 1,
    },
  ];

  const badgesEarned = badges.filter((b) => b.unlocked).length;

  const stats = {
    currentStreak: effectiveStreak,
    badgesEarned,
    totalBadges: badges.length,
    productivityScore: calculatedProd,
    weeklyPoints: points,
    totalStandups: effectiveStandups,
  };

  return { stats, badges };
}

// Returns a fun context-aware motivation advice based on user parameters
export function getMotivationInsight(stats) {
  if (stats.currentStreak === 1) {
    return {
      headline: "The First Step Sparked 🚀",
      text: "Consistency is forming! Submit your standup update again tomorrow to unlock the 3-day runner streak reward."
    };
  } else if (stats.currentStreak < 3) {
    return {
      headline: "Scrum Momentum Escalating 🏎️",
      text: `You're on day ${stats.currentStreak} of your streak! Aligning with your workspace today will bring you closer to unlocking exclusive badges.`
    };
  } else {
    return {
      headline: "Elite Pace Master 🌟",
      text: `Magnificent check-in habit! Your active streak of ${stats.currentStreak} days is setting a peerless standard for your workspace.`
    };
  }
}
