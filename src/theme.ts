export interface TeamTheme {
  primary: string;         // e.g. "emerald-500"
  textAccent: string;      // e.g. "text-emerald-400"
  textAccentHover: string; // e.g. "hover:text-emerald-300"
  bgAccent: string;        // e.g. "bg-emerald-600"
  bgAccentHover: string;   // e.g. "hover:bg-emerald-500"
  bgOpacity: string;       // e.g. "bg-emerald-500/10"
  badgeBg: string;         // e.g. "bg-emerald-500/10"
  borderAccent: string;    // e.g. "border-emerald-500/20"
  borderAccentInteractive: string; // e.g. "border-emerald-500/40"
  shadowAccent: string;    // e.g. "shadow-emerald-950/20"
  fillAccent: string;      // e.g. "fill-emerald-400/25"
}

export const THEME_PRESETS: { [key: string]: { name: string, colors: TeamTheme } } = {
  emerald: {
    name: "Emerald Vitality",
    colors: {
      primary: "emerald-500",
      textAccent: "text-emerald-400",
      textAccentHover: "hover:text-emerald-300",
      bgAccent: "bg-emerald-600",
      bgAccentHover: "hover:bg-emerald-500",
      bgOpacity: "bg-emerald-500/10",
      badgeBg: "bg-emerald-500/10",
      borderAccent: "border-emerald-500/20",
      borderAccentInteractive: "border-emerald-500/40",
      shadowAccent: "shadow-emerald-950/20",
      fillAccent: "fill-emerald-400/25"
    }
  },
  indigo: {
    name: "Indigo Horizon",
    colors: {
      primary: "indigo-500",
      textAccent: "text-indigo-400",
      textAccentHover: "hover:text-indigo-300",
      bgAccent: "bg-indigo-600",
      bgAccentHover: "hover:bg-indigo-500",
      bgOpacity: "bg-indigo-500/10",
      badgeBg: "bg-indigo-500/10",
      borderAccent: "border-indigo-500/20",
      borderAccentInteractive: "border-indigo-500/40",
      shadowAccent: "shadow-indigo-950/20",
      fillAccent: "fill-indigo-400/25"
    }
  },
  sky: {
    name: "Ocean Breeze",
    colors: {
      primary: "sky-500",
      textAccent: "text-sky-400",
      textAccentHover: "hover:text-sky-300",
      bgAccent: "bg-sky-600",
      bgAccentHover: "hover:bg-sky-500",
      bgOpacity: "bg-sky-500/10",
      badgeBg: "bg-sky-500/10",
      borderAccent: "border-sky-500/20",
      borderAccentInteractive: "border-sky-500/40",
      shadowAccent: "shadow-sky-950/20",
      fillAccent: "fill-sky-400/25"
    }
  },
  amber: {
    name: "Sunset Ember",
    colors: {
      primary: "amber-500",
      textAccent: "text-amber-400",
      textAccentHover: "hover:text-amber-300",
      bgAccent: "bg-amber-600",
      bgAccentHover: "hover:bg-amber-500",
      bgOpacity: "bg-amber-500/10",
      badgeBg: "bg-amber-500/10",
      borderAccent: "border-amber-500/20",
      borderAccentInteractive: "border-amber-500/40",
      shadowAccent: "shadow-amber-950/20",
      fillAccent: "fill-amber-400/25"
    }
  },
  rose: {
    name: "Crimson Spark",
    colors: {
      primary: "rose-500",
      textAccent: "text-rose-400",
      textAccentHover: "hover:text-rose-300",
      bgAccent: "bg-rose-600",
      bgAccentHover: "hover:bg-rose-500",
      bgOpacity: "bg-rose-500/10",
      badgeBg: "bg-rose-500/10",
      borderAccent: "border-rose-500/20",
      borderAccentInteractive: "border-rose-500/40",
      shadowAccent: "shadow-rose-950/20",
      fillAccent: "fill-rose-400/25"
    }
  },
  violet: {
    name: "Purple Galaxy",
    colors: {
      primary: "violet-500",
      textAccent: "text-violet-400",
      textAccentHover: "hover:text-violet-300",
      bgAccent: "bg-violet-600",
      bgAccentHover: "hover:bg-violet-500",
      bgOpacity: "bg-violet-500/10",
      badgeBg: "bg-violet-500/10",
      borderAccent: "border-violet-500/20",
      borderAccentInteractive: "border-violet-500/40",
      shadowAccent: "shadow-violet-950/20",
      fillAccent: "fill-violet-400/25"
    }
  },
  fuchsia: {
    name: "Fuchsia Neon",
    colors: {
      primary: "fuchsia-500",
      textAccent: "text-fuchsia-400",
      textAccentHover: "hover:text-fuchsia-300",
      bgAccent: "bg-fuchsia-600",
      bgAccentHover: "hover:bg-fuchsia-500",
      bgOpacity: "bg-fuchsia-500/10",
      badgeBg: "bg-fuchsia-500/10",
      borderAccent: "border-fuchsia-500/20",
      borderAccentInteractive: "border-fuchsia-500/40",
      shadowAccent: "shadow-fuchsia-950/20",
      fillAccent: "fill-fuchsia-400/25"
    }
  }
};

export const PRESET_EMOJIS = [
  "🚀", "⚡", "🧠", "👑", "🔥", "🏆", "✨", "🌟", "💡", "💻", 
  "🎯", "👾", "🐼", "🦁", "🦊", "🪁", "⛰️", "🌊", "🧬", "🥊"
];

const DEFAULT_THEME_KEY = "emerald";

export function getTeamTheme(key?: string): TeamTheme {
  const selectedKey = key || DEFAULT_THEME_KEY;
  const match = THEME_PRESETS[selectedKey] || THEME_PRESETS[DEFAULT_THEME_KEY];
  return match.colors;
}
