import React, { useState } from "react";
import { useApp } from "../context/AppContext.js";
import { 
  Users, 
  PlusCircle, 
  UserPlus, 
  Copy, 
  Check, 
  Award,
  Calendar
} from "lucide-react";
import { getTeamTheme } from "../theme.js";
import { motion } from "motion/react";

const getThemeHexColor = (themeName?: string): string => {
  switch (themeName) {
    case "indigo": return "#6366f1";
    case "sky": return "#0ea5e9";
    case "amber": return "#f59e0b";
    case "rose": return "#f43f5e";
    case "violet": return "#8b5cf6";
    case "fuchsia": return "#d946ef";
    case "emerald":
    default:
      return "#10b981";
  }
};

export default function TeamsView() {
  const { 
    myTeams, 
    activeTeam, 
    teamMembers, 
    createNewTeam, 
    joinTeamByCode, 
    loading, 
    setActiveTeamById,
    standups,
    user,
    updateMemberRole
  } = useApp();

  const theme = getTeamTheme(activeTeam?.settings?.theme);

  const [newTeamName, setNewTeamName] = useState<string>("");
  const [inviteCodeInput, setInviteCodeInput] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  // Default parameters for custom scheduler
  const [standupTime, setStandupTime] = useState<string>("10:00");
  const [deadline, setDeadline] = useState<string>("12:00");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    const success = await createNewTeam(newTeamName, [], standupTime, deadline);
    if (success) {
      setNewTeamName("");
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCodeInput.trim()) return;
    const success = await joinTeamByCode(inviteCodeInput);
    if (success) {
      setInviteCodeInput("");
    }
  };

  const copyInviteCode = () => {
    if (!activeTeam) return;
    navigator.clipboard.writeText(activeTeam.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 p-8 space-y-8 bg-[#0c0d10] overflow-y-auto">
      {/* Page Header */}
      <div className="border-b border-gray-800 pb-5">
        <h2 className="text-3xl font-sans font-bold text-white tracking-tight leading-none mb-1">
          Workspaces & Teams
        </h2>
        <p className="text-sm font-sans text-gray-400">
          Set up multiple team rooms, invite collaborators, and switch workspaces anytime.
        </p>
      </div>

      {/* Row of creating and joining teams */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Create workspace form */}
        <div className="bg-[#16191f] p-6 border border-gray-800 rounded-2xl shadow-sm space-y-5">
          <div className="flex items-center space-x-2 border-b border-gray-850 pb-3">
            <PlusCircle className={`h-5 w-5 ${theme.textAccent} animate-pulse`} />
            <h3 className="font-sans font-bold text-sm text-white uppercase tracking-wider">
              Create New Workspace
            </h3>
          </div>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase font-mono tracking-wider mb-2">
                Team space name
              </label>
              <input
                type="text"
                required
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="e.g., Marketing Squad, Delta Core Eng"
                className={`block w-full px-3.5 py-2.5 border border-gray-800 bg-[#0c0d10] rounded-xl focus:outline-none focus:ring-2 focus:ring-${theme.primary}/10 focus:border-${theme.primary} text-sm placeholder-gray-650 text-gray-250 font-sans`}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase font-mono tracking-wider mb-2">
                  Daily Scrum Time
                </label>
                <input
                  type="time"
                  required
                  value={standupTime}
                  onChange={(e) => setStandupTime(e.target.value)}
                  className={`block w-full px-3.5 py-2.5 border border-gray-800 bg-[#0c0d10] text-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-${theme.primary}/10 focus:border-${theme.primary} text-sm font-sans`}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase font-mono tracking-wider mb-2">
                  Due Deadline
                </label>
                <input
                  type="time"
                  required
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className={`block w-full px-3.5 py-2.5 border border-gray-800 bg-[#0c0d10] text-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-${theme.primary}/10 focus:border-${theme.primary} text-sm font-sans`}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 px-4 ${theme.bgAccent} hover:${theme.bgAccentHover} text-white rounded-xl text-xs font-semibold tracking-wide transition-all shadow-lg ${theme.shadowAccent} cursor-pointer`}
            >
              {loading ? "Booting database..." : "Launch Team Space"}
            </button>
          </form>
        </div>

        {/* Join workspace form */}
        <div className="bg-[#16191f] p-6 border border-gray-800 rounded-2xl shadow-sm space-y-5">
          <div className="flex items-center space-x-2 border-b border-gray-850 pb-3">
            <UserPlus className={`h-5 w-5 ${theme.textAccent}`} />
            <h3 className="font-sans font-bold text-sm text-white uppercase tracking-wider">
              Join Existing Team
            </h3>
          </div>
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase font-mono tracking-wider mb-2">
                Workspace Invite Token
              </label>
              <input
                type="text"
                required
                value={inviteCodeInput}
                onChange={(e) => setInviteCodeInput(e.target.value)}
                placeholder="e.g., F82CA0B1"
                className={`block w-full px-3.5 py-2.5 border border-gray-800 bg-[#0c0d10] rounded-xl focus:outline-none focus:ring-2 focus:ring-${theme.primary}/10 focus:border-${theme.primary} text-sm placeholder-gray-650 text-gray-250 font-sans uppercase font-mono`}
              />
            </div>
            <p className="text-[10px] text-gray-500 font-sans leading-normal">
              Enter the unique invite token code shared by your Team Manager or Admin to automatically connect.
            </p>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-gray-800 hover:bg-gray-750 text-white rounded-xl text-xs font-semibold tracking-wide border border-gray-750 transition-colors cursor-pointer"
            >
              {loading ? "Verifying invite token..." : "Link with Team"}
            </button>
          </form>
        </div>
      </div>

      {/* Active Team Member and Settings Listing block */}
      {activeTeam && (
        <div className="bg-[#14161d] p-6 border border-gray-800 rounded-2xl shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center space-y-4 sm:space-y-0 border-b border-gray-850 pb-4">
            <div className="flex items-center space-x-3">
              <span className="text-3xl select-none">{activeTeam.settings?.emoji || "🚀"}</span>
              <div>
                <h3 className="text-lg font-sans font-bold text-white tracking-tight leading-tight flex items-center space-x-2">
                  <span>{activeTeam.name}</span>
                </h3>
                <p className="text-xs text-gray-400 font-sans mt-0.5">
                  Workspace members & invite credentials.
                </p>
              </div>
            </div>

            {/* Invite Token Code representation snippet */}
            <div className="flex items-center bg-[#0d0f14] border border-gray-800 pl-3 pr-2 py-1.5 rounded-xl text-xs font-sans">
              <span className="text-gray-500 text-[10px] uppercase font-mono font-bold mr-2">Token Invite Link:</span>
              <span className={`font-mono font-bold ${theme.textAccent} ${theme.bgOpacity} border ${theme.borderAccent} px-2 py-0.5 rounded-md text-xs tracking-wide`}>
                {activeTeam.inviteCode}
              </span>
              <button 
                onClick={copyInviteCode}
                className={`ml-2.5 p-1.5 hover:bg-gray-800 rounded-lg text-gray-500 hover:${theme.textAccent} transition-colors cursor-pointer`}
              >
                {copied ? <Check className={`h-4 w-4 ${theme.textAccent}`} /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {teamMembers.map((member) => {
              const memberStandups = standups.filter(s => s.userId === member.id && !s.isDraft);
              
              const last30Days = Array.from({ length: 30 }, (_, idx) => {
                const d = new Date();
                d.setDate(d.getDate() - (29 - idx));
                return d.toISOString().split("T")[0];
              });

              const memberStandupsForPast30Days = memberStandups.filter(s => last30Days.includes(s.date));
              const activeSubmissionDays = new Set(memberStandupsForPast30Days.map(s => s.date));
              const consistencyPercentage = Math.round((activeSubmissionDays.size / 30) * 100);

              const presenceCalendar = last30Days.map(dateStr => {
                const standup = memberStandups.find(s => s.date === dateStr);
                return {
                  date: dateStr,
                  hasSubmitted: !!standup,
                  mood: standup?.mood || null,
                  aiMoodScore: standup?.aiMoodScore || null
                };
              });

              // Compute rolling consistency score (smooth curve)
              const sparklinePoints: { x: number; y: number }[] = [];
              const width = 100;
              const height = 18;
              
              for (let i = 0; i < 30; i++) {
                let sum = 0;
                let count = 0;
                for (let j = Math.max(0, i - 4); j <= i; j++) {
                  sum += presenceCalendar[j].hasSubmitted ? 100 : 0;
                  count++;
                }
                const avg = sum / count;
                const x = (i / 29) * width;
                const y = height - (avg / 100) * (height - 4) - 2; // scaled with 2px padding
                sparklinePoints.push({ x, y });
              }
              
              const pathData = sparklinePoints.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
              const areaPathData = `${pathData} L ${width} ${height} L 0 ${height} Z`;
              const themeHex = getThemeHexColor(activeTeam?.settings?.theme);

              return (
                <motion.div 
                  key={member.id}
                  whileHover={{ y: -4, scale: 1.01, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)" }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  className={`p-5 border rounded-2xl shadow-sm font-sans flex flex-col justify-between transition-all cursor-default ${
                    member.isVacation 
                      ? "bg-amber-500/10 border-amber-500/20" 
                      : "bg-[#16191f] border-gray-800 hover:border-gray-700"
                  }`}
                >
                  <div className="flex items-start space-x-3 w-full">
                    <div className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center font-bold text-lg select-none ${
                      member.isVacation 
                        ? "bg-amber-500/20 text-amber-400" 
                        : `${theme.bgOpacity} border ${theme.borderAccent} ${theme.textAccent}`
                    }`}>
                      {member.avatar || member.name.slice(0, 2)}
                    </div>

                    <div className="overflow-hidden flex-1">
                      <div className="flex items-center space-x-1.5 mb-0.5">
                        <h4 className="font-semibold text-white text-sm truncate leading-none">{member.name}</h4>
                        {member.isVacation && (
                          <span className="bg-amber-500 text-white rounded px-1.5 py-0.5 text-[8px] font-mono uppercase font-bold">OOO</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 truncate mb-1">{member.email}</p>
                      
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        {/* If current user is manager / admin / owner, allow role change */}
                        {(activeTeam?.ownerId === user?.id || user?.role === "Admin" || user?.role === "Manager") && member.id !== user?.id ? (
                          <select
                            value={member.role}
                            onChange={async (e) => {
                              const newRole = e.target.value;
                              await updateMemberRole(member.id, newRole);
                            }}
                            className="text-[9px] font-mono font-bold bg-[#0c0d10] border border-gray-850 text-emerald-400 rounded-md px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 cursor-pointer"
                          >
                            <option value="Admin">Admin</option>
                            <option value="Manager">Manager</option>
                            <option value="Member">Member</option>
                          </select>
                        ) : (
                          <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded-md font-bold bg-[#0c0d10] border border-gray-850 text-gray-400">
                            {member.role}
                          </span>
                        )}
                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-md ${theme.bgOpacity} border ${theme.borderAccent} ${theme.textAccent}`}>
                          Streak: {member.streak}d
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Visual Consistency Section */}
                  <div className="mt-4 pt-3 border-t border-gray-800/40 space-y-3 w-full">
                    {/* Stats header with sparkline on right */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] uppercase font-mono tracking-wider text-gray-400 font-bold leading-none mb-1">
                          30-Day Consistency
                        </p>
                        <div className="flex items-baseline space-x-1">
                          <span className="text-lg font-bold text-white tracking-tight leading-none">
                            {consistencyPercentage}%
                          </span>
                          <span className="text-[9px] font-mono text-gray-400">
                            ({activeSubmissionDays.size}/30 days)
                          </span>
                        </div>
                      </div>
                      
                      {/* SVG Sparkline Spark */}
                      <div className="h-6 w-24 relative select-none" title="Smooth 30-day presence heart-rate trend">
                        <svg viewBox={`0 0 100 18`} width="100%" height="100%">
                          <defs>
                            <linearGradient id={`sparkline-grad-${member.id}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={themeHex} stopOpacity="0.25" />
                              <stop offset="100%" stopColor={themeHex} stopOpacity="0.0" />
                            </linearGradient>
                          </defs>
                          <path
                            d={areaPathData}
                            fill={`url(#sparkline-grad-${member.id})`}
                          />
                          <path
                            d={pathData}
                            fill="none"
                            stroke={themeHex}
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-1.5 w-full bg-[#0d0f12] rounded-full overflow-hidden border border-gray-900">
                      <div 
                        className={`h-full transition-all duration-500`}
                        style={{ 
                          width: `${Math.max(5, consistencyPercentage)}%`,
                          backgroundImage: `linear-gradient(to right, ${themeHex}dd, ${themeHex})`
                        }}
                      />
                    </div>

                    {/* 30-Day Presence Strip Row */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[9px] font-mono text-gray-500">
                        <span>30d ago</span>
                        <span>Today</span>
                      </div>
                      <div className="flex items-center gap-[2.5px] w-full">
                        {presenceCalendar.map((day) => {
                          let markerBg = "bg-gray-850 opacity-20 border border-gray-900";
                          let moodText = "Missed Check-in";
                          
                          if (day.hasSubmitted) {
                            if (day.mood === "excellent") {
                              markerBg = "bg-emerald-400";
                              moodText = "Excellent mood";
                            } else if (day.mood === "good") {
                              markerBg = "bg-teal-400";
                              moodText = "Good mood";
                            } else if (day.mood === "neutral") {
                              markerBg = "bg-blue-400";
                              moodText = "Neutral mood";
                            } else if (day.mood === "unhappy") {
                              markerBg = "bg-amber-500";
                              moodText = "Unhappy mood";
                            } else if (day.mood === "stressed") {
                              markerBg = "bg-rose-500";
                              moodText = "Stressed state";
                            } else {
                              markerBg = "bg-emerald-450";
                              moodText = "Submitted";
                            }
                          }
                          
                          const formattedDate = new Date(day.date).toLocaleDateString([], { month: "short", day: "numeric" });
                          const tooltip = `${formattedDate}: ${moodText}`;

                          return (
                            <div 
                              key={day.date}
                              title={tooltip}
                              className={`flex-1 h-3 rounded-[1px] cursor-help transition-all hover:scale-y-125 focus:outline-none ${markerBg}`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
