import { motion } from "motion/react";
import { UserContext } from "../context/AppContext.js";
import { Trophy, Compass, Sparkles } from "lucide-react";

interface LeaderboardCardProps {
  user: UserContext | null;
  points: number;
}

export default function LeaderboardCard({ user, points }: LeaderboardCardProps) {
  if (!user) return null;

  // Retrieve user initials
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <motion.div
      id="leaderboard-solo-card"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="p-6 bg-[#16191f] border border-violet-500/10 hover:border-violet-500/20 rounded-2xl shadow-xl flex flex-col justify-between h-full font-sans relative overflow-hidden group"
    >
      {/* Decorative ambient violet background blur circular flash */}
      <div className="absolute top-0 right-0 h-28 w-28 rounded-full bg-violet-600/5 blur-xl group-hover:scale-125 transition-transform duration-500 pointer-events-none" />

      <div className="space-y-4">
        {/* Header Title with animated Trophy Icon */}
        <div className="flex items-center justify-between border-b border-gray-850 pb-3">
          <div className="flex items-center space-x-2">
            <Trophy className="h-4 w-4 text-amber-500" />
            <h3 className="font-bold text-sm text-white uppercase tracking-wider font-display shrink-0">
              Workspace Leaderboard
            </h3>
          </div>
          <span className="text-[10px] uppercase font-mono font-bold text-amber-500 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 leading-none">
            Solo Mode Active
          </span>
        </div>

        {/* Rank #1 Visual row */}
        <div className="space-y-3 pt-1">
          <p className="text-xs text-gray-400">
            Current stance in this workspace cycle:
          </p>

          <div className="flex items-center justify-between p-3.5 bg-gray-950/40 border border-gray-850 rounded-xl relative">
            {/* Rank Badge Indicator Left */}
            <div className="flex items-center space-x-3.5 min-w-0">
              <span className="font-display font-black text-lg text-amber-400 w-6 text-center">
                #1
              </span>

              {/* User Avatar Initials Globe */}
              <div className="relative">
                <div className="absolute inset-0 rounded-xl bg-violet-500/20 blur-[1px]" />
                <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center font-display font-bold text-sm text-white border border-violet-500/30 relative select-none uppercase">
                  <span>{user.avatar || initials}</span>
                </div>
              </div>

              {/* User Identity Details */}
              <div className="min-w-0">
                <p className="text-sm font-bold text-white truncate leading-none mb-1">
                  {user.name}
                </p>
                <div className="flex items-center space-x-1.5">
                  <span className="text-[9px] font-mono uppercase bg-violet-500/10 text-violet-400 px-1.5 py-0.5 rounded-md border border-violet-500/10 font-bold leading-none">
                    {user.role}
                  </span>
                  <span className="text-[9px] text-gray-500 font-mono">
                    Streak: {user.streak}d
                  </span>
                </div>
              </div>
            </div>

            {/* Score Metric Right */}
            <div className="text-right shrink-0">
              <p className="text-base font-black text-white leading-none mb-0.5">
                {points}
              </p>
              <p className="text-[9px] text-gray-500 font-mono uppercase">
                Sprint Points
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* pace setting status card footnote */}
      <div className="mt-6 pt-4 border-t border-gray-850/60 flex items-start space-x-2.5">
        <div className="p-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400">
          <Sparkles className="h-4 w-4 animate-pulse" />
        </div>
        <div>
          <p className="text-xs text-white font-bold leading-tight">
            You&apos;re setting the pace for the team 🚀
          </p>
          <p className="text-[10.5px] text-gray-400 leading-normal mt-0.5">
            Since you are the first team member registered in this workspace cycle, your productivity standard establishes the team baseline index.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
