import { motion } from "motion/react";
import { LucideIcon, TrendingUp } from "lucide-react";

interface AchievementCardProps {
  key?: any;
  title: string;
  value: string | number;
  subtitle: string;
  trend?: string;
  icon: LucideIcon;
  themeColor: {
    primary: string;
    glow: string;
    text: string;
    bg: string;
    border: string;
  };
  delayIndex: number;
}

export default function AchievementCard({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  themeColor,
  delayIndex,
}: AchievementCardProps) {
  return (
    <motion.div
      id={`achievement-card-${title.toLowerCase().replace(/\s+/g, "-")}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delayIndex * 0.1, ease: "easeOut" }}
      whileHover={{ y: -4, scale: 1.02 }}
      className={`relative p-5 glass rounded-2xl border ${themeColor.border} bg-gray-950/40 cursor-pointer overflow-hidden group transition-shadow duration-300`}
      style={{
        boxShadow: "0 4px 30px rgba(0, 0, 0, 0.4)",
      }}
    >
      {/* Background Soft Radial Glow Gradient on Hover */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${themeColor.glow} opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none blur-xl`}
      />

      <div className="flex items-center justify-between relative z-10">
        <div className="space-y-1">
          <p className="text-[10px] uppercase font-mono font-bold tracking-wider text-gray-500">
            {title}
          </p>
          <div className="flex items-baseline space-x-2">
            <h3 className="font-display font-black text-2xl text-white tracking-tight">
              {value}
            </h3>
            {trend && (
              <span className={`inline-flex items-center text-[10px] font-mono leading-none font-bold px-1.5 py-0.5 rounded-full ${themeColor.bg} ${themeColor.text}`}>
                <TrendingUp className="h-2.5 w-2.5 mr-0.5" />
                {trend}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 font-sans">
            {subtitle}
          </p>
        </div>

        {/* Dynamic Icon with Pulse Ring */}
        <div className="relative">
          <div className={`absolute inset-0 rounded-xl ${themeColor.primary} opacity-20 blur-md group-hover:scale-125 transition-transform duration-300`} />
          <div className={`h-11 w-11 rounded-xl ${themeColor.bg} border ${themeColor.border} flex items-center justify-center transition-transform duration-300 group-hover:rotate-6`}>
            <Icon className={`h-5 w-5 ${themeColor.text}`} />
          </div>
        </div>
      </div>

      {/* Decorative Neon Linear Progress Border highlight */}
      <div className={`absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent ${themeColor.text} to-transparent opacity-30 group-hover:opacity-100 transition-opacity duration-300`} />
    </motion.div>
  );
}
