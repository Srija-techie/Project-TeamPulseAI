import { useApp } from "../context/AppContext.js";
import { 
  BarChart3, 
  Flame, 
  Smile, 
  HelpCircle, 
  Sparkles, 
  Activity, 
  ShieldAlert, 
  CheckCircle2, 
  Award,
  Calendar
} from "lucide-react";

export default function AnalyticsView() {
  const { activeTeam, analytics, teamMembers, standups } = useApp();

  if (!activeTeam) {
    return (
      <div className="flex-1 p-8 flex justify-center items-center bg-[#0c0d10]">
        <div className="text-center p-8 max-w-lg bg-[#16191f] border border-gray-800 shadow-xl rounded-2xl">
          <BarChart3 className="h-12 w-12 text-gray-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white font-sans">No Team Selected</h3>
          <p className="text-sm text-gray-400 font-sans mt-1">
            Build your team workspace to visualize squad dynamics.
          </p>
        </div>
      </div>
    );
  }

  // Count mood allocations dynamically
  const moods = standups.map(s => s.mood);
  const moodCounts = {
    excellent: moods.filter(m => m === "excellent").length,
    good: moods.filter(m => m === "good").length,
    neutral: moods.filter(m => m === "neutral").length,
    unhappy: moods.filter(m => m === "unhappy").length,
    stressed: moods.filter(m => m === "stressed").length,
  };

  const totalMoods = moods.length || 1;
  const moodPcts = {
    excellent: Math.round((moodCounts.excellent / totalMoods) * 100),
    good: Math.round((moodCounts.good / totalMoods) * 100),
    neutral: Math.round((moodCounts.neutral / totalMoods) * 100),
    unhappy: Math.round((moodCounts.unhappy / totalMoods) * 100),
    stressed: Math.round((moodCounts.stressed / totalMoods) * 100),
  };

  // Sort streaks leaderboard
  const streaksLeaderboard = [...teamMembers].sort((a, b) => b.streak - a.streak).slice(0, 5);

  return (
    <div className="flex-1 p-8 space-y-8 bg-[#0c0d10] overflow-y-auto">
      {/* Page Header */}
      <div className="border-b border-gray-800 pb-5">
        <h2 className="text-3xl font-sans font-bold text-white tracking-tight leading-none mb-1">
          Analytics & Trends
        </h2>
        <p className="text-sm font-sans text-gray-400">
          Monitor participation coverage, focus statistics, blockers frequency, and streaks metrics.
        </p>
      </div>

      {/* Bento Grid Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Participation coverage bar */}
        <div className="bg-[#16191f] p-6 border border-gray-800 rounded-2xl shadow-sm space-y-5">
          <div className="flex items-center space-x-2 border-b border-gray-850 pb-3">
            <Activity className="h-5 w-5 text-emerald-400" />
            <h3 className="font-sans font-bold text-sm text-white uppercase tracking-wider">
              Engagement metrics
            </h3>
          </div>
          
          <div className="space-y-4 font-sans">
            <div>
              <div className="flex justify-between text-xs text-gray-400 font-semibold mb-1">
                <span>Coverage Capacity Rate</span>
                <span>{analytics ? analytics.participationRate : 0}%</span>
              </div>
              <div className="h-3 bg-gray-900 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${analytics ? analytics.participationRate : 0}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-3.5 bg-gray-950/40 rounded-xl border border-gray-800">
                <p className="text-[10px] text-gray-500 font-mono font-bold uppercase mb-1">Daily Submissions</p>
                <p className="text-xl font-bold text-white">{analytics ? analytics.submittedTodayCount : 0}</p>
              </div>
              <div className="p-3.5 bg-gray-950/40 rounded-xl border border-gray-800">
                <p className="text-[10px] text-gray-500 font-mono font-bold uppercase mb-1">Total Members</p>
                <p className="text-xl font-bold text-white">{analytics ? analytics.totalMembers : 0}</p>
              </div>
            </div>

            <p className="text-xs text-gray-300 leading-normal bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
              ⚡ <b className="text-emerald-400">Active participation</b> represents the ratio of committed standups filed today before target scrum clocks. Keep consistency levels above 80%.
            </p>
          </div>
        </div>

        {/* Mood analytics tracking */}
        <div className="bg-[#16191f] p-6 border border-gray-800 rounded-2xl shadow-sm space-y-5">
          <div className="flex items-center space-x-2 border-b border-gray-850 pb-3">
            <Smile className="h-5 w-5 text-emerald-400" />
            <h3 className="font-sans font-bold text-sm text-white uppercase tracking-wider">
              Psychological safety
            </h3>
          </div>

          <div className="space-y-3.5 font-sans">
            {[
              { label: "🤩 Excellent", pct: moodPcts.excellent, color: "bg-emerald-500" },
              { label: "😊 Good", pct: moodPcts.good, color: "bg-teal-500" },
              { label: "😐 Neutral", pct: moodPcts.neutral, color: "bg-gray-500" },
              { label: "😞 Unhappy", pct: moodPcts.unhappy, color: "bg-amber-500" },
              { label: "😰 Stressed", pct: moodPcts.stressed, color: "bg-rose-500" },
            ].map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex justify-between text-xs text-gray-300">
                  <span className="font-medium">{item.label}</span>
                  <span className="font-mono text-gray-500">{item.pct || 0}%</span>
                </div>
                <div className="h-1.5 bg-gray-900 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${item.color} rounded-full transition-all`}
                    style={{ width: `${item.pct || 0}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Engagement consistency streak list */}
        <div className="bg-[#16191f] p-6 border border-gray-800 rounded-2xl shadow-sm space-y-5">
          <div className="flex items-center space-x-2 border-b border-gray-850 pb-3">
            <Flame className="h-5 w-5 text-amber-500" />
            <h3 className="font-sans font-bold text-sm text-white uppercase tracking-wider">
              Consistency Board
            </h3>
          </div>

          <div className="space-y-3 font-sans">
            {streaksLeaderboard.map((member, i) => (
              <div 
                key={member.id} 
                className="flex items-center justify-between p-2.5 bg-gray-950/40 rounded-xl border border-gray-800"
              >
                <div className="flex items-center space-x-2.5 overflow-hidden">
                  <span className="text-xs font-bold text-gray-500 font-mono w-4">#{i+1}</span>
                  <div className="h-7 w-7 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center font-bold text-xs text-emerald-400 uppercase shrink-0">
                    {member.name.slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate leading-none mb-0.5">{member.name}</p>
                    <span className="text-[9px] font-mono text-gray-500">{member.role}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-1 font-mono text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg shrink-0">
                  <Flame className="h-4 w-4 fill-amber-500/10" />
                  <span>{member.streak}d</span>
                </div>
              </div>
            ))}

            {streaksLeaderboard.length === 0 && (
              <p className="text-xs text-gray-500 text-center py-6">No active streaks captured. Submissions define levels.</p>
            )}
          </div>
        </div>

      </div>

      {/* Blocker mapping lists */}
      <div className="bg-[#16191f] p-6 border border-gray-800 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center space-x-2 border-b border-gray-850 pb-3">
          <ShieldAlert className="h-5 w-5 text-rose-500" />
          <h3 className="font-sans font-bold text-base text-white">
            Current Blocker Metrics
          </h3>
        </div>
        <p className="text-xs text-gray-400 font-sans max-w-2xl leading-relaxed mb-4">
          Unresolved delay blockers represent friction points that trigger scrum warnings. Encourage teammates to define blocks clearly.
        </p>

        {standups.filter(s => s.blockers && s.blockers.toLowerCase() !== "none" && s.blockers.trim() !== "").length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {standups.filter(s => s.blockers && s.blockers.toLowerCase() !== "none" && s.blockers.trim() !== "").map(s => (
              <div key={s.id} className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start space-x-3 text-xs font-sans">
                <ShieldAlert className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center space-x-1.5 mb-1">
                    <span className="font-bold text-rose-300">{s.userName}</span>
                    <span className="text-[10px] text-rose-400/80">• Blocker logged</span>
                  </div>
                  <p className="text-rose-200 leading-relaxed font-sans">{s.blockers}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
            <CheckCircle2 className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
            <span className="text-xs text-emerald-400 font-sans font-bold">Excellent work! Zero active blockers reported inside current check-ins.</span>
          </div>
        )}
      </div>
    </div>
  );
}
