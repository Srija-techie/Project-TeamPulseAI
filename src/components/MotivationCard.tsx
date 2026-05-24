import { motion } from "motion/react";
import { Sparkles, ArrowRight, ShieldCheck } from "lucide-react";

interface MotivationCardProps {
  headline: string;
  text: string;
  streak: number;
}

export default function MotivationCard({ headline, text, streak }: MotivationCardProps) {
  // Determine progress metrics manually to next motivational milestone
  const nextMilestone = streak >= 7 ? 14 : streak >= 3 ? 7 : 3;
  const streakDelta = nextMilestone - streak;
  const progressPercent = Math.min((streak / nextMilestone) * 100, 100);

  return (
    <motion.div
      id="motivation-insight-card"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="p-6 bg-[#16191f] border border-fuchsia-500/10 hover:border-fuchsia-500/20 rounded-2xl shadow-xl flex flex-col justify-between h-full font-sans relative overflow-hidden group"
    >
      {/* Background radial violet wash ambient glow */}
      <div className="absolute top-0 left-0 h-32 w-32 rounded-full bg-fuchsia-600/5 blur-xl group-hover:scale-110 transition-transform duration-500 pointer-events-none" />

      <div className="space-y-4">
        {/* Header indicator */}
        <div className="flex items-center space-x-2 border-b border-gray-850 pb-3">
          <Sparkles className="h-4 w-4 text-fuchsia-400" />
          <h3 className="font-bold text-sm text-white uppercase tracking-wider font-display shrink-0">
            AI Motivational Diagnosis
          </h3>
        </div>

        {/* Motivational Quote details */}
        <div className="space-y-2">
          <h4 className="text-sm font-bold text-white tracking-tight leading-snug">
            {headline}
          </h4>
          <p className="text-xs text-gray-400 leading-normal font-sans">
            {text}
          </p>
        </div>
      </div>

      {/* Dynamic Streak Progress Indicator footer details */}
      <div className="mt-6 pt-5 border-t border-gray-850/60 space-y-3">
        <div className="flex items-center justify-between text-xs font-sans">
          <span className="text-gray-400 font-medium">Next Habit Medal Goal</span>
          <span className="text-fuchsia-400 font-mono font-bold">
            {streakDelta > 0 ? `${streakDelta} days left` : "Milestone Achieved!"}
          </span>
        </div>

        {/* Indicator Bar */}
        <div className="h-1.5 w-full bg-gray-950 rounded-full overflow-hidden border border-gray-850 p-[1px]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.9, delay: 0.1, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
          />
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-gray-500">
          <span>Streak Day {streak}</span>
          <span>Target {nextMilestone} Days</span>
        </div>
      </div>
    </motion.div>
  );
}
