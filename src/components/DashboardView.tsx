import { useState } from "react";
import { useApp } from "../context/AppContext.js";
import { 
  Activity, 
  HelpCircle, 
  Smile, 
  Sparkles, 
  CheckCircle2, 
  XSquare, 
  Clock, 
  TrendingUp, 
  Lightbulb, 
  User, 
  PlusCircle, 
  ArrowRight,
  RefreshCw,
  MessageSquare,
  Send,
  Mail,
  Download,
  AlertTriangle,
  Terminal,
  Calendar,
  Layers,
  ChevronRight
} from "lucide-react";
import { motion } from "motion/react";
import { getTeamTheme } from "../theme.js";

export default function DashboardView() {
  const { 
    activeTeam, 
    standups, 
    analytics, 
    setView, 
    triggerAICoachReport, 
    loading,
    insights,
    addComment,
    user,
    broadcastEmail,
    broadcastSlack,
    teamMembers
  } = useApp();

  const theme = getTeamTheme(activeTeam?.settings?.theme);

  // Archive and simulation state hooks
  const [activeFeedFilter, setActiveFeedFilter] = useState<"all" | "mine">("all");
  const [consoleLogs, setConsoleLogs] = useState<string>("");
  const [isSyncingInts, setIsSyncingInts] = useState<boolean>(false);
  const [pingConfirmation, setPingConfirmation] = useState<string | null>(null);

  // Jira simulate states
  const [jiraEmail, setJiraEmail] = useState<string>(user?.email || "");
  const [jiraKey, setJiraKey] = useState<string>("TP-382");
  const [jiraSummary, setJiraSummary] = useState<string>("Fleshed out secure auth sessions callback endpoints");
  const [isSimulatingJira, setIsSimulatingJira] = useState<boolean>(false);

  const handleTriggerAI = async () => {
    await triggerAICoachReport();
  };

  const handleBroadcastEmailSim = async () => {
    setIsSyncingInts(true);
    const data = await broadcastEmail();
    if (data && data.success) {
      setConsoleLogs(data.data.logs);
    }
    setIsSyncingInts(false);
  };

  const handleBroadcastSlackSim = async () => {
    setIsSyncingInts(true);
    const data = await broadcastSlack();
    if (data && data.success) {
      setConsoleLogs(data.data.logs);
    }
    setIsSyncingInts(false);
  };

  const triggerJiraWebhookSimulate = async () => {
    if (!jiraEmail.trim() || !jiraKey.trim()) {
      alert("Email and issueKey target match are mandatory.");
      return;
    }
    setIsSimulatingJira(true);
    try {
      const res = await fetch("/api/webhooks/jira", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: jiraEmail.trim(),
          teamId: activeTeam.id,
          issueKey: jiraKey.trim(),
          summary: jiraSummary
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(`Success! Auto-populated check-in draft for: ${data.data.user}`);
        window.location.reload();
      } else {
        alert("Webhook response: " + data.message);
      }
    } catch (e) {
      alert("Failed triggering webhook mock engine.");
    } finally {
      setIsSimulatingJira(false);
    }
  };

  const exportWeeklyRetroCSV = () => {
    try {
      const headers = ["ID", "Member Email", "Member Name", "Date", "Yesterday Done Checks", "Today Focus Objectives", "Any Roadblocks Blockers", "Mood Factor", "Stress Index Rating"];
      const rows = standups.map(s => [
        s.id,
        user?.email || "",
        s.userName,
        s.date,
        `"${(s.yesterday || "").replace(/"/g, '""')}"`,
        `"${(s.today || "").replace(/"/g, '""')}"`,
        `"${(s.blockers || "").replace(/"/g, '""')}"`,
        s.mood,
        s.stressLevel || 3
      ]);
      const csvStr = "data:text/csv;charset=utf-8," 
        + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      const encoded = encodeURI(csvStr);
      const el = document.createElement("a");
      el.setAttribute("href", encoded);
      el.setAttribute("download", `${activeTeam.name.toLowerCase().replace(/\s+/g, "_")}_weekly_retro.csv`);
      document.body.appendChild(el);
      el.click();
      document.body.removeChild(el);
    } catch(e) {
      alert("Failure preparing CSV package download.");
    }
  };

  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [isSubmittingComment, setIsSubmittingComment] = useState<Record<string, boolean>>({});

  const toggleComments = (id: string) => {
    setExpandedComments(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSendComment = async (standupId: string) => {
    const text = commentInputs[standupId] || "";
    if (!text.trim()) return;

    setIsSubmittingComment(prev => ({ ...prev, [standupId]: true }));
    const success = await addComment(standupId, text);
    if (success) {
      setCommentInputs(prev => ({ ...prev, [standupId]: "" }));
    }
    setIsSubmittingComment(prev => ({ ...prev, [standupId]: false }));
  };

  if (!activeTeam) {
    return (
      <div className="flex-1 p-8 flex flex-col justify-center items-center h-full bg-[#0c0d10]">
        <div className="text-center p-8 max-w-lg bg-[#16191f] border border-gray-800 rounded-2xl shadow-xl">
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4">
            <PlusCircle className="h-7 w-7 text-emerald-500" />
          </div>
          <h3 className="font-sans font-bold text-xl text-white tracking-tight mb-2">
            No Active Workspace Found
          </h3>
          <p className="text-sm text-gray-400 font-sans leading-relaxed mb-6">
            To start utilizing TeamPulseAI daily coaching feeds, please either create a new workspace or join an existing team space using an invite token.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              onClick={() => setView("teams")}
              className="py-2.5 px-6 border border-transparent rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-all font-sans cursor-pointer shadow-lg shadow-emerald-900/20"
            >
              Get Started with Team
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Find latest AI team intelligence report if any
  const latestInsight = insights && insights.length > 0 ? insights[0] : null;

  return (
    <div className="flex-1 p-8 space-y-8 bg-[#0c0d10] overflow-y-auto">
      {/* Upper Status Welcome banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0 border-b border-gray-800 pb-5">
        <div>
          <h2 className="text-3xl font-sans font-bold text-white tracking-tight leading-none mb-1">
            {activeTeam.name} Space
          </h2>
          <p className="text-sm font-sans text-gray-400">
            Welcome to your AI agile workspace. Real-time synchronizations are alive.
          </p>
        </div>
        <div className="flex items-center space-x-3 shrink-0">
          <span className="flex items-center space-x-1.5 text-xs font-mono font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>Live Sync Online</span>
          </span>
          <button
            onClick={() => setView("standups")}
            className="flex items-center space-x-1.5 py-2 px-4 shadow-lg text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all cursor-pointer font-sans"
          >
            <span>Record Standup</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Main Stats Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {/* Participation Card */}
        <div className="bg-[#16191f] p-5 border border-gray-800 rounded-2xl shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-semibold text-gray-400 font-sans uppercase">Daily Coverage</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-3xl font-bold text-white font-sans tracking-tight">
              {analytics ? analytics.participationRate : 0}%
            </span>
            <span className="text-xs text-gray-500 font-sans">recorded</span>
          </div>
          <div className="mt-4">
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${analytics ? analytics.participationRate : 0}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-gray-400 font-sans mt-2">
              {analytics ? analytics.submittedTodayCount : 0} of {analytics ? analytics.totalMembers : 0} members checked in today
            </p>
          </div>
        </div>

        {/* AI team health score */}
        <div className="bg-[#16191f] p-5 border border-gray-800 rounded-2xl shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-semibold text-gray-400 font-sans uppercase">Team Health Index</span>
            <div className="p-2 bg-teal-500/10 text-teal-400 rounded-xl">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-3xl font-bold text-white font-sans tracking-tight">
              {latestInsight ? latestInsight.healthScore : 80}
            </span>
            <span className="text-xs text-gray-500 font-sans">/ 100</span>
          </div>
          <div className="mt-4 flex items-center space-x-1.5">
            <span className={`h-2.5 w-2.5 rounded-full ${
              (latestInsight?.healthScore || 80) >= 80 
                ? "bg-emerald-500" 
                : (latestInsight?.healthScore || 80) >= 60 
                ? "bg-amber-400" 
                : "bg-red-500"
            }`}></span>
            <span className="text-xs text-gray-300 font-sans">
              {(latestInsight?.healthScore || 80) >= 80 
                ? "Highly Stable" 
                : (latestInsight?.healthScore || 80) >= 60 
                ? "Friction Points Noted" 
                : "Action Advised"}
            </span>
          </div>
        </div>

        {/* Current Active Blockers */}
        <div className="bg-[#16191f] p-5 border border-gray-800 rounded-2xl shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-semibold text-gray-400 font-sans uppercase">Active Blockers</span>
            <div className="p-2 bg-red-500/10 text-red-400 rounded-xl">
              <XSquare className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-3xl font-bold text-white font-sans tracking-tight">
              {analytics ? analytics.totalBlockersCurrent : 0}
            </span>
            <span className="text-xs text-gray-500 font-sans">unresolved</span>
          </div>
          <p className="text-[10px] text-gray-400 font-sans mt-4">
            Blockers require sync mitigation review.
          </p>
        </div>

        {/* Collective Mood avg */}
        <div className="bg-[#16191f] p-5 border border-gray-800 rounded-2xl shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-semibold text-gray-400 font-sans uppercase">Average Team Mood</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
              <Smile className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-3xl font-bold text-white font-sans tracking-tight">
              {analytics ? analytics.averageMoodScore : 75}
            </span>
            <span className="text-xs text-gray-500 font-sans">% efficiency</span>
          </div>
          <p className="text-[10px] text-gray-400 font-sans mt-4 truncate">
            {latestInsight ? latestInsight.moodTrend : "Positive psychological safety"}
          </p>
        </div>
      </div>

      {/* Blockers alert board and Pending check-ins */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-2">
        {/* Unresolved Roadblocks list */}
        {standups.filter(s => s.isBlocked && !s.isDraft).length > 0 ? (
          <div className="bg-rose-950/15 border border-rose-500/20 p-5 rounded-2xl space-y-3">
            <h4 className="text-xs font-bold text-rose-400 uppercase font-mono tracking-wider flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 animate-bounce shrink-0" />
              <span>🚨 Active Blockers Flagged ({standups.filter(s => s.isBlocked && !s.isDraft).length})</span>
            </h4>
            <div className="space-y-2.5 max-h-44 overflow-y-auto">
              {standups.filter(s => s.isBlocked && !s.isDraft).map(item => (
                <div key={item.id} className="p-3 bg-[#0d0f12]/80 border border-rose-500/15 rounded-xl flex items-start space-x-3">
                  <div className="bg-rose-500/10 text-rose-400 font-bold h-7 w-7 rounded-lg text-xs flex items-center justify-center shrink-0">
                    ⚠
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-gray-200">{item.userName} is Blocked:</h5>
                    <p className="text-[11px] text-rose-300 italic font-sans leading-relaxed">
                      "{item.blockers || "No explicit text provided but marked explicitly as blocked."}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-[#111318]/45 border border-gray-850 p-5 rounded-2xl flex items-center space-x-3">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-emerald-400 uppercase font-mono tracking-wider">Unblocked Workspace</h4>
              <p className="text-[11px] text-gray-400">Zero roadblock dependencies registered. Development flow is highly optimized!</p>
            </div>
          </div>
        )}

        {/* Pending Check-ins and Sim indicators */}
        <div className="bg-[#16191f] border border-gray-800 p-5 rounded-2xl space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-1">
              <h4 className="text-xs font-bold text-gray-300 uppercase font-mono tracking-wider flex items-center space-x-1.5">
                <Clock className="h-4 w-4 text-amber-400" />
                <span>Pending Daily Submissions</span>
              </h4>
              <span className="text-[10px] text-gray-500 font-mono">Cut-off: {activeTeam.settings?.deadline || "12:00 PM"}</span>
            </div>
            <p className="text-[10px] text-gray-500 leading-normal mb-3">
              Teammates yet to file their daily alignment targets. Click to trigger auto-reminders (30 mins before deadline).
            </p>

            {/* List members who haven't check in */}
            <div className="flex flex-wrap gap-2">
              {(() => {
                const checkedInIds = new Set(standups.filter(s => s.date === new Date().toISOString().split("T")[0] && !s.isDraft).map(s => s.userId));
                const mockList = [
                  { id: "S-1", name: "Sarah Connor", avatar: "👩‍🚀" },
                  { id: "A-2", name: "Amos Burton", avatar: "🧔" },
                  { id: "J-3", name: "Jim Holden", avatar: "👨‍✈️" }
                ];
                const pendings = mockList.filter(m => !checkedInIds.has(m.id) && m.id !== user?.id);

                if (pendings.length === 0) {
                  return <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full">✓ 100% Coverage Completed!</span>;
                }

                return pendings.map(m => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setPingConfirmation(`Alert dispatched inside Slack to ${m.name}!`);
                      setTimeout(() => setPingConfirmation(null), 3000);
                    }}
                    className="flex items-center space-x-1.5 px-2.5 py-1 bg-gray-950 border border-gray-850 hover:border-gray-700 hover:bg-gray-900 rounded-full text-[10px] font-sans text-gray-300 transition-all cursor-pointer"
                  >
                    <span>{m.avatar}</span>
                    <span>{m.name}</span>
                    <span className="text-amber-400 font-bold shrink-0">⚡ Ping</span>
                  </button>
                ));
              })()}
            </div>
          </div>

          <div className="flex justify-between items-center pt-2.5 border-t border-gray-850">
            {pingConfirmation ? (
              <span className="text-[10px] text-emerald-400 font-mono font-semibold animate-pulse">{pingConfirmation}</span>
            ) : (
              <span className="text-[9px] text-gray-500 font-mono">30 min deadline automatic alerts are active</span>
            )}

            <button
              onClick={() => {
                setPingConfirmation("Dispatched general slack/email reminder ping to all pending items!");
                setTimeout(() => setPingConfirmation(null), 3500);
              }}
              className="py-1 px-3 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 rounded-lg text-[9px] font-bold text-amber-400 font-sans cursor-pointer transition-colors"
            >
              Simulate General Remind Alerts
            </button>
          </div>
        </div>
      </div>

      {/* Team Intelligence card + Submission activity feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: AI generated insights and action list */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#16191f] border border-gray-800 p-6 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-emerald-400 animate-pulse" />
              <h3 className="font-sans font-bold text-base text-white uppercase tracking-wider">
                Coach Intelligence
              </h3>
            </div>
            {latestInsight ? (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs text-emerald-400 font-mono font-bold mb-1 uppercase tracking-wider">
                    Executive summary
                  </h4>
                  <p className="text-xs font-sans text-gray-300 leading-relaxed">
                    {latestInsight.summary}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs text-emerald-400 font-mono font-bold mb-1.5 uppercase tracking-wider">
                    Action items
                  </h4>
                  <ul className="space-y-1.5 text-xs text-gray-300 font-sans list-inside list-disc">
                    {latestInsight.actionItems.slice(0, 3).map((act, i) => (
                      <li key={i}>{act}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-center py-4">
                <p className="text-xs font-sans text-gray-400">
                  No active team report is compiled for today yet. Use the quick trigger below to summarize check-ins.
                </p>
                <button
                  onClick={handleTriggerAI}
                  disabled={loading}
                  className="w-full flex justify-center items-center space-x-1.5 py-2.5 px-4 border border-transparent rounded-xl text-xs font-semibold text-gray-900 bg-emerald-500 hover:bg-emerald-400 shadow-md transition-all disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`h-4.5 w-4.5 ${loading ? "animate-spin" : ""}`} />
                  <span>Generate AI Coach Insights</span>
                </button>
              </div>
            )}
          </div>

          {/* Scrum Weekly Participation Grid Matrix */}
          <div className="bg-[#16191f] p-5 border border-gray-800 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center space-x-2 border-b border-gray-850 pb-2.5">
              <Calendar className="h-4 w-4 text-emerald-400" />
              <h4 className="font-sans font-bold text-xs text-white uppercase tracking-wider">
                Weekly Attendance Grid
              </h4>
            </div>
            <div className="text-[10px] text-gray-500 font-sans leading-normal">
              Weekly status view tracker: Green checklist (Submitted), gray dot (Pending/Absent), beach umbrella 🏖️ (Vacation / OOO).
            </div>
            <div className="space-y-2 pt-1 font-mono">
              {[
                { name: user?.name || "CurrentUser", email: user?.email || "", isCurrent: true, isVac: activeTeam.vacationUsers.includes(user?.id || "") },
                { name: "Sarah Connor", email: "sarah@resistance.org", isCurrent: false, isVac: false },
                { name: "Amos Burton", email: "amos@rocicorporation.com", isCurrent: false, isVac: true },
                { name: "James Holden", email: "holden@rocicorporation.com", isCurrent: false, isVac: false }
              ].map((member, mIdx) => (
                <div key={mIdx} className="flex justify-between items-center text-[10px] py-1 border-b border-gray-850/40">
                  <span className="truncate max-w-[100px] text-gray-300 font-sans tracking-wide">
                    {member.name} {member.isCurrent && "👤"}
                  </span>
                  <div className="flex items-center space-x-1.5">
                    {["Mon", "Tue", "Wed", "Thu", "Fri"].map((day, dIdx) => {
                      const hasSubmitted = member.isCurrent ? standups.length > 0 : (dIdx !== 4 && !member.isVac);
                      if (member.isVac) {
                        return <span key={day} title="Vacating OOO" className="cursor-help text-[11px]">🏖️</span>;
                      }
                      return (
                        <div 
                          key={day} 
                          title={`${day}: ${hasSubmitted ? "Check-in filed" : "Awaiting"}`}
                          className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[7px] text-white font-bold cursor-help ${
                            hasSubmitted 
                              ? "bg-emerald-550 border border-emerald-500/20" 
                              : "bg-gray-855 border border-gray-800"
                          }`}
                        >
                          {hasSubmitted ? "✓" : "●"}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick agile triggers and exports */}
          <div className="bg-[#16191f] p-6 border border-gray-800 rounded-2xl shadow-sm space-y-4">
            <h4 className="font-sans font-bold text-sm text-white uppercase tracking-wider border-b border-gray-850 pb-2">
              🎯 Integrations Console
            </h4>
            
            <div className="space-y-2.5">
              <button
                onClick={handleBroadcastEmailSim}
                disabled={isSyncingInts}
                className="w-full text-left p-3 hover:bg-gray-800/40 border border-gray-800 hover:border-gray-700 rounded-xl transition-all flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-sans font-semibold text-white">Broadcast Email Digest</h5>
                    <p className="text-[10px] text-gray-400 font-sans">Dispatch PDF compilation</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </button>

              <button
                onClick={handleBroadcastSlackSim}
                disabled={isSyncingInts}
                className="w-full text-left p-3 hover:bg-gray-800/40 border border-gray-800 hover:border-gray-700 rounded-xl transition-all flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-sans font-semibold text-white">Broadcast Slack Feed</h5>
                    <p className="text-[10px] text-gray-400 font-sans">Posting complete update list</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </button>

              <button
                onClick={exportWeeklyRetroCSV}
                className="w-full text-left p-3 hover:bg-gray-800/40 border border-gray-800 hover:border-gray-700 rounded-xl transition-all flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                    <Download className="h-4 w-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-sans font-semibold text-white">Export Retro CSV</h5>
                    <p className="text-[10px] text-gray-400 font-sans">Download weekly check-in logs</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </button>
            </div>

            {/* Simulated Live Console Logs Box */}
            {consoleLogs && (
              <div className="p-3.5 bg-gray-950 border border-gray-900 rounded-xl space-y-2 font-mono">
                <div className="flex items-center justify-between pb-1 boundary-b border-gray-900">
                  <span className="text-[9px] uppercase font-bold text-amber-400 flex items-center space-x-1">
                    <Terminal className="h-3 w-3 inline" />
                    <span>Secure Integration Logs</span>
                  </span>
                  <button 
                    onClick={() => setConsoleLogs("")} 
                    className="text-[9px] text-gray-500 hover:text-white"
                  >
                    Clear Console
                  </button>
                </div>
                <pre className="text-[8.5px] text-gray-400 max-h-48 overflow-y-auto whitespace-pre-wrap leading-normal">
                  {consoleLogs}
                </pre>
              </div>
            )}
          </div>

          {/* Secure Webhook Simulator Widget */}
          <div className="bg-[#16191f] p-5 border border-gray-800 rounded-2xl shadow-sm space-y-3.5 font-sans">
            <h4 className="font-sans font-bold text-sm text-white uppercase tracking-wider border-b border-gray-850 pb-2">
              🔌 Simulate JIRA Post
            </h4>
            <div className="space-y-2">
              <div>
                <label className="block text-[9px] font-bold text-gray-500 uppercase font-mono tracking-wide mb-1">Target Email</label>
                <input
                  type="email"
                  value={jiraEmail}
                  onChange={(e) => setJiraEmail(e.target.value)}
                  className="block w-full px-3 py-1.5 bg-[#0c0d10] border border-gray-850 text-xs text-gray-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <label className="block text-[9px] font-bold text-gray-500 uppercase font-mono tracking-wide mb-1">Ticket ID</label>
                  <input
                    type="text"
                    value={jiraKey}
                    onChange={(e) => setJiraKey(e.target.value)}
                    className="block w-full px-3 py-1.5 bg-[#0c0d10] border border-gray-850 text-xs text-gray-200 rounded-lg font-mono font-bold"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[9px] font-bold text-gray-500 uppercase font-mono tracking-wide mb-1">Issue Summary Task</label>
                  <input
                    type="text"
                    value={jiraSummary}
                    onChange={(e) => setJiraSummary(e.target.value)}
                    className="block w-full px-3 py-1.5 bg-[#0c0d10] border border-gray-850 text-xs text-gray-200 rounded-lg"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={triggerJiraWebhookSimulate}
                disabled={isSimulatingJira}
                className="w-full py-2 px-3 text-[10px] font-bold bg-[#14231b] border border-emerald-500/20 text-emerald-400 rounded-xl hover:bg-emerald-500/10 cursor-pointer disabled:opacity-40"
              >
                {isSimulatingJira ? "Simulating Hook Delivery..." : "⚡ Trigger JIRA completed trigger payload"}
              </button>
            </div>
          </div>
        </div>

        {/* Right column: Daily Check-in Logs */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex justify-between items-center bg-[#111318]/50 p-3 border border-gray-850 rounded-xl">
            <div className="flex items-center space-x-1.5">
              <h3 className="font-sans font-bold text-sm text-white tracking-tight uppercase tracking-wider font-mono">
                Daily Standups Activity
              </h3>
              <span className="text-[10px] text-gray-500 font-mono">({standups.length})</span>
            </div>

            {/* Archive Filtering selection buttons */}
            <div className="flex items-center bg-[#07080a] p-1 border border-gray-850 rounded-lg">
              <button
                onClick={() => setActiveFeedFilter("all")}
                className={`py-1 px-2.5 rounded-md text-[10px] font-sans font-bold transition-all cursor-pointer ${
                  activeFeedFilter === "all" 
                    ? "bg-emerald-600 text-white" 
                    : "text-gray-400 hover:text-white"
                }`}
              >
                👥 All Check-ins
              </button>
              <button
                onClick={() => setActiveFeedFilter("mine")}
                className={`py-1 px-2.5 rounded-md text-[10px] font-sans font-bold transition-all cursor-pointer ${
                  activeFeedFilter === "mine" 
                    ? "bg-emerald-600 text-white" 
                    : "text-gray-400 hover:text-white"
                }`}
              >
                👤 My Archive History
              </button>
            </div>
          </div>

          {(() => {
            const listToRender = activeFeedFilter === "all" 
              ? standups 
              : standups.filter(s => s.userId === user?.id);

            if (listToRender.length > 0) {
              return (
                <div className="space-y-5">
                  {listToRender.map((s) => (
                    <motion.div 
                      key={s.id} 
                      whileHover={{ y: -4, scale: 1.005, boxShadow: "0 12px 30px -10px rgba(0, 0, 0, 0.4)" }}
                      transition={{ type: "spring", stiffness: 350, damping: 25 }}
                      className={`p-6 border rounded-2xl shadow-md transition-all space-y-4 cursor-default ${
                        s.isBlocked 
                          ? "bg-rose-950/15 border-rose-500/25 ring-1 ring-rose-500/20" 
                          : "bg-[#16191f] border-gray-800/80 hover:border-gray-700"
                      }`}
                    >
                      {/* Card head metadata */}
                      <div className="flex justify-between items-start border-b border-gray-800 pb-3">
                        <div className="flex items-center space-x-2.5">
                          <div className="bg-gray-800 border border-gray-750 h-9 w-9 rounded-full flex items-center justify-center text-lg select-none">
                            {s.userAvatar || "🦊"}
                          </div>
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <h4 className="text-sm font-sans font-semibold text-white">{s.userName}</h4>
                              
                              {s.isBlocked && (
                                <span className="text-[8px] bg-rose-500/10 text-rose-400 border border-rose-500/30 px-1.5 py-0.5 rounded-full font-mono font-bold leading-none uppercase">
                                  🚨 BLOCKED
                                </span>
                              )}

                              {s.stressLevel !== undefined && (
                                <span className={`text-[8px] font-mono leading-none px-1.5 py-0.5 rounded-full uppercase font-bold ${
                                  s.stressLevel >= 4 
                                    ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" 
                                    : s.stressLevel <= 2 
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                                    : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                }`}>
                                  Stress: {s.stressLevel}/5
                                </span>
                              )}
                            </div>
                            <span className="text-[9px] font-mono text-gray-500">
                              Checked-in {new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} on {s.date}
                            </span>
                          </div>
                    </div>
                    
                    <div className="flex items-center space-x-1.5 shrink-0">
                      {s.aiMoodScore && (
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          s.aiMoodScore >= 80 
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                            : s.aiMoodScore >= 60 
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" 
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}>
                          AI Score: {s.aiMoodScore}%
                        </span>
                      )}
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        s.mood === "excellent" || s.mood === "good" 
                          ? "bg-teal-500/10 text-teal-400 border border-teal-500/20" 
                          : s.mood === "neutral" 
                          ? "bg-gray-800 text-gray-400 border border-gray-750" 
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}>
                        {s.mood}
                      </span>
                    </div>
                  </div>

                  {/* Standup parameters */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
                    <div className="space-y-1">
                      <h5 className="font-semibold text-gray-400 uppercase tracking-wide text-[9px] font-mono">
                        Yesterday
                      </h5>
                      <p className="text-gray-300 bg-gray-900/40 p-2.5 border border-gray-800 rounded-xl leading-relaxed whitespace-pre-wrap font-sans">
                        {s.yesterday}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <h5 className="font-semibold text-gray-400 uppercase tracking-wide text-[9px] font-mono">
                        Today
                      </h5>
                      <p className="text-gray-300 bg-gray-900/40 p-2.5 border border-gray-800 rounded-xl leading-relaxed whitespace-pre-wrap font-sans">
                        {s.today}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <h5 className="font-semibold text-gray-400 uppercase tracking-wide text-[9px] font-mono">
                        Blockers
                      </h5>
                      <p className={`p-2.5 border rounded-xl leading-relaxed whitespace-pre-wrap font-sans ${
                        s.blockers && s.blockers.toLowerCase() !== "none" && s.blockers.trim() !== ""
                          ? "text-red-300 bg-red-500/5 border-red-500/20"
                          : "text-gray-500 bg-gray-900/40 border-gray-800"
                      }`}>
                        {s.blockers || "None reported."}
                      </p>
                    </div>
                  </div>

                  {/* AI parsed summary inside check-in */}
                  {s.aiSummary && (
                    <div className="bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-xl flex items-start space-x-2">
                      <Sparkles className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5 animate-pulse" />
                      <p className="text-xs text-emerald-250 font-sans tracking-tight">
                        <span className="font-bold">AI Reflection:</span> {s.aiSummary}
                      </p>
                    </div>
                  )}

                  {/* Comments section */}
                  <div className="border-t border-gray-800/80 pt-3.5 space-y-3">
                    <button 
                      id={`comments-toggle-${s.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleComments(s.id);
                      }}
                      className="flex items-center space-x-1.5 text-xs text-gray-400 hover:text-emerald-400 font-sans font-medium transition-colors cursor-pointer py-0.5"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>
                        {s.comments && s.comments.length > 0 
                          ? `${s.comments.length} Comment${s.comments.length > 1 ? "s" : ""}` 
                          : "Leave a comment"}
                      </span>
                    </button>

                    {expandedComments[s.id] && (
                      <div className="space-y-3.5 pt-1.5" onClick={(e) => e.stopPropagation()}>
                        {s.comments && s.comments.length > 0 ? (
                          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                            {s.comments.map((comment) => (
                              <div key={comment.id} className="bg-gray-900/45 p-2.5 rounded-xl border border-gray-800/60 flex items-start space-x-2.5">
                                <div className="bg-gray-800 border border-gray-750 h-6 w-6 rounded-full flex items-center justify-center text-xs shrink-0 select-none">
                                  {comment.userAvatar || "🦊"}
                                </div>
                                <div className="flex-1 space-y-0.5 min-w-0">
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs font-semibold text-white truncate max-w-[120px] font-sans">
                                      {comment.userName}
                                    </span>
                                    <span className="text-[9px] text-gray-500 font-mono">
                                      {new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                  <p className="text-gray-300 font-sans leading-relaxed break-words whitespace-pre-wrap text-[11px]">
                                    {comment.text}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[10px] text-gray-500 italic py-1 font-sans text-center">
                            Write a quick note or comment to ignite the conversation.
                          </p>
                        )}

                        {/* Compose Form */}
                        <div className="flex items-center space-x-2.5 pt-1 border-t border-gray-850/50">
                          <div className="bg-gray-800 border border-gray-750 h-7 w-7 rounded-full flex items-center justify-center text-sm shrink-0 select-none">
                            {user?.avatar || "🦊"}
                          </div>
                          <div className="relative flex-1">
                            <input
                              id={`comment-field-${s.id}`}
                              type="text"
                              placeholder="Write a comment..."
                              value={commentInputs[s.id] || ""}
                              onChange={(e) => setCommentInputs(prev => ({ ...prev, [s.id]: e.target.value }))}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleSendComment(s.id);
                                }
                              }}
                              disabled={isSubmittingComment[s.id]}
                              className="w-full bg-[#0d0f12] text-xs text-white placeholder-gray-500 py-2 pl-3 pr-10 border border-gray-850 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 disabled:opacity-40 transition-all font-sans"
                            />
                            <button
                              id={`comment-submit-${s.id}`}
                              onClick={() => handleSendComment(s.id)}
                              disabled={isSubmittingComment[s.id] || !(commentInputs[s.id] || "").trim()}
                              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent disabled:text-gray-500 transition-colors cursor-pointer"
                            >
                              <Send className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
                </div>
              );
            } else {
              return (
                <div className="bg-[#16191f] border border-gray-800 border-dashed p-12 rounded-2xl text-center space-y-4">
                  <div className="bg-gray-800 p-3.5 rounded-full w-12 h-12 flex items-center justify-center mx-auto text-gray-400">
                    <Activity className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-sans font-bold text-white">No Check-ins Logged Today</h4>
                    <p className="text-xs text-gray-400 font-sans mt-1">
                      Once your teammates login and check-in to this daily space, their reports will align here dynamically.
                    </p>
                  </div>
                  <button
                    onClick={() => setView("standups")}
                    className="py-2 px-4 shadow bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold font-sans transition-colors cursor-pointer"
                  >
                    Submit the First Standup
                  </button>
                </div>
              );
            }
          })()}
        </div>
      </div>
    </div>
  );
}
