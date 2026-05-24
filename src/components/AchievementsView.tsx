import { useApp } from "../context/AppContext.js";
import { getTeamTheme } from "../theme.js";
import { 
  calculateAchievementData, 
  getMotivationInsight 
} from "./mockAchievements.js";
import AchievementCard from "./AchievementCard.js";
import BadgeCard from "./BadgeCard.js";
import LeaderboardCard from "./LeaderboardCard.js";
import MotivationCard from "./MotivationCard.js";
import { 
  Award, 
  Flame, 
  Zap, 
  Sparkles, 
  Trophy, 
  Info,
  Compass
} from "lucide-react";
import { motion } from "motion/react";

export default function AchievementsView() {
  const { user, activeTeam, standups, analytics, themeMode } = useApp();
  const theme = getTeamTheme(activeTeam?.settings?.theme);

  // Derive dynamic achievements based on real context metrics
  const activeStreak = user?.streak || 1;
  const teamStandupsCount = standups.length;
  const membersCount = activeTeam ? 1 : 1; // Solo mode defaults
  const averageMood = analytics?.averageMoodScore;

  const { stats, badges } = calculateAchievementData(
    activeStreak,
    teamStandupsCount,
    membersCount,
    averageMood
  );

  const motivationInsight = getMotivationInsight(stats);

  // Cards definitions for Top Stats Grid
  const STAT_CARDS = [
    {
      title: "Current Streak",
      value: `${stats.currentStreak} Days`,
      subtitle: "Daily submissions habit",
      trend: "+1",
      icon: Flame,
      themeColor: {
        primary: "bg-orange-500",
        glow: "from-orange-500/20 to-amber-500/10",
        text: "text-orange-400",
        bg: "bg-orange-500/10",
        border: "border-orange-500/15",
      }
    },
    {
      title: "Badges Earned",
      value: `${stats.badgesEarned} / ${stats.totalBadges}`,
      subtitle: "Unlocked sprint achievements",
      trend: `+${stats.badgesEarned}`,
      icon: Award,
      themeColor: {
        primary: "bg-violet-500",
        glow: "from-violet-500/20 to-fuchsia-500/10",
        text: "text-violet-400",
        bg: "bg-violet-500/10",
        border: "border-violet-500/15",
      }
    },
    {
      title: "Productivity Score",
      value: `${stats.productivityScore}%`,
      subtitle: "Work & sentiment velocity",
      trend: "+4.2%",
      icon: Zap,
      themeColor: {
        primary: "bg-emerald-500",
        glow: "from-emerald-500/20 to-teal-500/10",
        text: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/15",
      }
    },
    {
      title: "Weekly Points",
      value: stats.weeklyPoints,
      subtitle: "Synthesized sprint scores",
      trend: "+120",
      icon: Sparkles,
      themeColor: {
        primary: "bg-sky-500",
        glow: "from-sky-500/20 to-indigo-500/10",
        text: "text-sky-400",
        bg: "bg-sky-500/10",
        border: "border-sky-500/15",
      }
    }
  ];

  const parentVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0c0d10] font-sans">
      {/* Decorative top background gradient haze */}
      <div className="absolute top-0 right-0 left-0 h-48 bg-gradient-to-b from-violet-950/10 via-transparent to-transparent pointer-events-none" />

      {/* Primary header view container */}
      <div className="border-b border-gray-800 bg-[#111318]/60 py-5 px-6 md:px-8 flex flex-col md:flex-row items-start md:items-center justify-between shrink-0 gap-4 relative z-10">
        <div>
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35 }}
            className="flex items-center space-x-2"
          >
            <Trophy className="h-5 w-5 text-violet-400" />
            <h2 className="text-xl font-bold text-white font-display tracking-tight">
              Achievements
            </h2>
            <span className="text-[9px] uppercase tracking-widest font-mono font-bold px-1.5 py-0.5 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20">
              Gamified Workspace
            </span>
          </motion.div>
          <p className="text-xs text-gray-400 mt-1">
            Streaks, badges, and team motivation. Keep high compliance values to unlock more medals.
          </p>
        </div>

        {/* Dynamic header summary statistics pills */}
        <div className="flex items-center space-x-2 font-mono text-[10.5px]">
          <div className="bg-[#16191f] border border-gray-800 rounded-xl px-3.5 py-2 flex items-center space-x-2 shadow-sm text-gray-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Core Submissions: <strong className="text-white font-bold">{stats.totalStandups}</strong></span>
          </div>
        </div>
      </div>

      {/* Main Content scroll window */}
      <div className="flex-1 overflow-y-auto px-6 md:px-8 py-6 space-y-8 relative z-10">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* 1. TOP STATS CARDS */}
          <div>
            <p className="text-[10px] uppercase tracking-widest font-mono text-gray-500 font-bold mb-3.5 select-none">
              Performance Indicators
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {STAT_CARDS.map((card, idx) => (
                <AchievementCard
                  key={card.title}
                  title={card.title}
                  value={card.value}
                  subtitle={card.subtitle}
                  trend={card.trend}
                  icon={card.icon}
                  themeColor={card.themeColor}
                  delayIndex={idx}
                />
              ))}
            </div>
          </div>

          {/* 2. DUAL-ROW SECTION: MOTIVATION & LEADERBOARD */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Solo Leaderboard Row */}
            <div>
              <p className="text-[10px] uppercase tracking-widest font-mono text-gray-500 font-bold mb-3.5 select-none">
                Workspace Trajectory Stance
              </p>
              <LeaderboardCard user={user} points={stats.weeklyPoints} />
            </div>

            {/* Motivation Insights Row */}
            <div>
              <p className="text-[10px] uppercase tracking-widest font-mono text-gray-500 font-bold mb-3.5 select-none">
                Workspace Motivation Pulse
              </p>
              <MotivationCard
                headline={motivationInsight.headline}
                text={motivationInsight.text}
                streak={stats.currentStreak}
              />
            </div>

          </div>

          {/* 3. BADGES GRID SECTION */}
          <div>
            <div className="flex items-center justify-between border-b border-gray-850 pb-3 mb-4 select-none">
              <div className="flex items-center space-x-2">
                <Compass className="h-4 w-4 text-violet-400" />
                <h3 className="font-bold text-sm text-white uppercase tracking-wider font-display">
                  Sustain Medals System
                </h3>
              </div>
              <span className="text-[10px] text-gray-500 font-mono">
                {stats.badgesEarned} of {stats.totalBadges} medals accrued
              </span>
            </div>

            {/* Grid display */}
            <motion.div
              variants={parentVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {badges.map((b, idx) => (
                <BadgeCard key={b.id} badge={b} delayIndex={idx} />
              ))}
            </motion.div>
          </div>

          {/* Bottom helper info note */}
          <div className="p-4 bg-gray-950/20 border border-gray-850 rounded-2xl flex items-start space-x-3 max-w-xl">
            <Info className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-gray-400 leading-normal font-sans">
              * Note: Gamified elements are currently evaluated dynamically on client instances. Consistent standup check-ins contribute directly to unlocking milestones. Future database sync releases will persist high-score metrics across your entire Agile workspace.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
