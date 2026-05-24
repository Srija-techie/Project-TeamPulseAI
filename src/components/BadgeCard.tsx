import { motion } from "motion/react";
import { Badge } from "./mockAchievements.js";
import { 
  Award, 
  Flame, 
  Zap, 
  Clock, 
  Users, 
  ShieldAlert, 
  Lock, 
  CheckCircle2 
} from "lucide-react";

interface BadgeCardProps {
  key?: any;
  badge: Badge;
  delayIndex: number;
}

// Maps iconName string keys to Lucide icons
const iconMap = {
  first_standup: Award,
  streak_3: Flame,
  streak_7: Zap,
  early_bird: Clock,
  team_helper: Users,
  blocker_crusher: ShieldAlert,
};

export default function BadgeCard({ badge, delayIndex }: BadgeCardProps) {
  const IconComponent = iconMap[badge.iconName] || Award;
  const progressPercent = Math.min((badge.progress / badge.target) * 100, 100);

  return (
    <motion.div
      id={`badge-card-${badge.id}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, delay: delayIndex * 0.05, ease: "easeOut" }}
      whileHover={{ y: -3 }}
      className={`relative p-5 rounded-2xl border transition-all duration-300 font-sans group ${
        badge.unlocked
          ? "bg-[#16191f] border-violet-500/20 shadow-lg shadow-violet-950/5 hover:border-violet-500/40"
          : "bg-[#0f1115]/50 border-gray-850 opacity-60 hover:opacity-80"
      }`}
    >
      {/* Decorative Top Accent Glow for Unlocked Badges */}
      {badge.unlocked && (
        <>
          <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-violet-400 to-transparent blur-[1px]" />
          {/* Ambient background pulsing glow */}
          <motion.div
            animate={{
              opacity: [0.12, 0.28, 0.12],
              scale: [0.99, 1.01, 0.99],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-600/10 via-fuchsia-600/5 to-transparent blur-md pointer-events-none"
          />
        </>
      )}

      <div className="flex items-start justify-between relative z-10">
        {/* Badge Icon Slot */}
        <div className="relative">
          {badge.unlocked ? (
            <>
              {/* Pulsing Backlight */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.35, 0.65, 0.35],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 rounded-xl bg-violet-600/30 blur-md group-hover:scale-135 transition-transform duration-300 pointer-events-none"
              />
              <div className="relative h-12 w-12 rounded-xl bg-gradient-to-tr from-violet-600/20 to-fuchsia-600/20 border border-violet-500/30 flex items-center justify-center">
                <IconComponent className="h-6 w-6 text-violet-400 group-hover:scale-110 transition-transform duration-300" />
              </div>
            </>
          ) : (
            <div className="relative h-12 w-12 rounded-xl bg-[#16191f] border border-gray-800 flex items-center justify-center">
              <IconComponent className="h-6 w-6 text-gray-500" />
              {/* Mini lock indicator overlay */}
              <div className="absolute -bottom-1 -right-1 bg-gray-900 border border-gray-800 p-1 rounded-full">
                <Lock className="h-2.5 w-2.5 text-gray-400" />
              </div>
            </div>
          )}
        </div>

        {/* State Watermark Status Pill */}
        {badge.unlocked ? (
          <span className="inline-flex items-center space-x-1 py-1 px-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-[9px] font-mono text-violet-300 leading-none">
            <CheckCircle2 className="h-3 w-3 text-violet-400" />
            <span>Unlocked</span>
          </span>
        ) : (
          <span className="py-1 px-2 rounded-full bg-gray-800/40 border border-gray-800/80 text-[9px] font-mono text-gray-500 leading-none">
            Locked
          </span>
        )}
      </div>

      <div className="mt-4 space-y-1">
        <h4 className={`text-sm font-bold tracking-tight ${badge.unlocked ? "text-white" : "text-gray-400"}`}>
          {badge.title}
        </h4>
        <p className="text-[11px] text-gray-400 leading-normal min-h-[32px]">
          {badge.description}
        </p>
      </div>

      {/* Progress metrics and indicator bar */}
      <div className="mt-4 space-y-1.5 pt-3 border-t border-gray-800/30">
        <div className="flex items-center justify-between text-[10px] font-mono text-gray-500">
          <span>Sustain Target</span>
          <span className={badge.unlocked ? "text-violet-300 font-semibold" : ""}>
            {badge.progress} / {badge.target}
          </span>
        </div>

        {/* Track */}
        <div className="h-1.5 w-full bg-gray-900 rounded-full overflow-hidden border border-gray-850">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.8, delay: delayIndex * 0.05 + 0.2, ease: "easeOut" }}
            className={`h-full rounded-full ${
              badge.unlocked
                ? "bg-gradient-to-r from-violet-500 to-fuchsia-500"
                : "bg-gray-700"
            }`}
          />
        </div>
      </div>

      {/* Unlocked stamp details */}
      {badge.unlocked && badge.unlockedAt && (
        <p className="mt-2 text-[9px] font-mono text-gray-500 text-right">
          Claimed: {badge.unlockedAt}
        </p>
      )}
    </motion.div>
  );
}
