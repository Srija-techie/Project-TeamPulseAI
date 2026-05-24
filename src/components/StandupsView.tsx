import React, { useEffect, useState } from "react";
import { useApp } from "../context/AppContext.js";
import { 
  ClipboardCheck, 
  Smile, 
  PlaneTakeoff, 
  ToggleLeft, 
  ToggleRight, 
  Save, 
  AlertTriangle
} from "lucide-react";
import { getTeamTheme } from "../theme.js";

export default function StandupsView() {
  const { 
    activeTeam, 
    activeDraft, 
    submitDailyStandup, 
    toggleVacationOOO, 
    loading, 
    user,
    standups
  } = useApp();

  const theme = getTeamTheme(activeTeam?.settings?.theme);

  const [yesterday, setYesterday] = useState<string>("");
  const [today, setToday] = useState<string>("");
  const [blockers, setBlockers] = useState<string>("");
  const [mood, setMood] = useState<"excellent" | "good" | "neutral" | "unhappy" | "stressed">("good");
  const [isBlocked, setIsBlocked] = useState<boolean>(false);
  const [stressLevel, setStressLevel] = useState<number>(3);

  // Sync with active draft if it changes/loads
  useEffect(() => {
    if (activeDraft) {
      setYesterday(activeDraft.yesterday || "");
      setToday(activeDraft.today || "");
      setBlockers(activeDraft.blockers || "");
      setMood(activeDraft.mood || "good");
      setIsBlocked(activeDraft.isBlocked || false);
      setStressLevel(activeDraft.stressLevel || 3);
    } else {
      setYesterday("");
      setToday("");
      setBlockers("");
      setMood("good");
      setIsBlocked(false);
      setStressLevel(3);
    }
  }, [activeDraft, activeTeam]);

  if (!activeTeam) {
    return (
      <div className="flex-1 p-8 flex justify-center items-center bg-[#0c0d10]">
        <div className="text-center p-8 max-w-lg bg-[#16191f] border border-gray-800 shadow-xl rounded-2xl">
          <ClipboardCheck className="h-12 w-12 text-gray-500 mx-auto mb-3 animate-bounce" />
          <h3 className="text-lg font-bold text-white font-sans">No Workspace Selected</h3>
          <p className="text-sm text-gray-400 font-sans mt-1">
            Setup or join a team workspace first to access daily check-in boards.
          </p>
        </div>
      </div>
    );
  }

  // Check if current logged-in user is OOO
  const isOOO = activeTeam.vacationUsers.includes(user?.id || "");

  // Check if already checked in today with a finalized standup
  const todayStr = new Date().toISOString().split("T")[0];
  const submittedToday = standups.find(s => s.userId === user?.id && s.date === todayStr && !s.isDraft);

  const handleManualDraftSave = async () => {
    await submitDailyStandup(yesterday, today, blockers, mood, true, isBlocked, stressLevel);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!yesterday || !today) {
      alert("Please populate yesterday's accomplishments and today's alignment topics.");
      return;
    }
    await submitDailyStandup(yesterday, today, blockers, mood, false, isBlocked, stressLevel);
  };

  const questions = activeTeam.settings.questions || [];

  return (
    <div className="flex-1 p-8 space-y-8 bg-[#0c0d10] overflow-y-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-800 pb-5">
        <div className="flex items-center space-x-3.5">
          <span className="text-3xl select-none">{activeTeam.settings?.emoji || "🚀"}</span>
          <div>
            <h2 className="text-3xl font-sans font-bold text-white tracking-tight leading-none mb-1">
              Daily Check-in
            </h2>
            <p className="text-sm font-sans text-gray-400 mt-1">
              Keep your squad aligned. Toggle vacation mode when taking holidays.
            </p>
          </div>
        </div>

        {/* Vacation OOO button layout */}
        <div className="mt-4 md:mt-0 flex items-center bg-[#16191f] p-3 border border-gray-800 rounded-2xl shadow-sm shrink-0">
          <div className="flex items-center space-x-2.5">
            <PlaneTakeoff className={`h-5 w-5 ${isOOO ? "text-amber-500 animate-pulse" : "text-gray-500"}`} />
            <div>
              <p className="text-xs font-sans font-bold text-white leading-none mb-0.5">Vacation status</p>
              <p className="text-[10px] text-gray-400 font-mono">{isOOO ? "Out of Office (OOO)" : "Active Participant"}</p>
            </div>
          </div>
          <button 
            onClick={toggleVacationOOO}
            className="ml-6 focus:outline-none cursor-pointer"
          >
            {isOOO ? (
              <ToggleRight className="h-8 w-8 text-amber-500" />
            ) : (
              <ToggleLeft className="h-8 w-8 text-gray-750" />
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Core Submission Form Component */}
        <div className="lg:col-span-2 space-y-6">
          {isOOO ? (
            <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-2xl flex items-start space-x-3.5">
              <AlertTriangle className="h-6 w-6 text-amber-500 mt-0.5" />
              <div>
                <h4 className="font-sans font-bold text-sm text-amber-300 leading-tight mb-1">You are currently Out of Office</h4>
                <p className="text-xs text-amber-400 leading-relaxed font-sans">
                  This status advises the squad that you're on vacation. Feel free to record an update anyway, or toggle yourself back to Active in the Vacation panel.
                </p>
              </div>
            </div>
          ) : submittedToday ? (
            <div className={`${theme.badgeBg} border ${theme.borderAccent} p-6 rounded-2xl flex items-start space-x-3.5`}>
              <ClipboardCheck className={`h-6 w-6 ${theme.textAccent} mt-0.5`} />
              <div>
                <h4 className={`font-sans font-bold text-sm ${theme.textAccent} leading-tight mb-1`}>Already Checked-in Today!</h4>
                <p className={`text-xs ${theme.textAccent} opacity-80 leading-relaxed font-sans`}>
                  You successfully recorded your Daily check-in. You can re-submit your updates below if details shifted during early scrum syncs.
                </p>
              </div>
            </div>
          ) : null}

          <div className="bg-[#16191f] p-6 border border-gray-800 rounded-2xl shadow-sm">
            <form onSubmit={handleFinalSubmit} className="space-y-6">
              
              {/* Question 1: Yesterday */}
              <div>
                <label className="block text-xs font-bold uppercase font-mono tracking-wider text-gray-400 mb-2">
                  Question 1: {questions[0] || "What did you manage to accomplish yesterday?"}
                </label>
                <textarea
                  required
                  value={yesterday}
                  onChange={(e) => setYesterday(e.target.value)}
                  placeholder="e.g., Finished checkout service optimization. Resolved type-import constraints & executed local tests suite."
                  rows={3}
                  className={`block w-full px-3.5 py-3 border border-gray-800 bg-[#0c0d10] text-gray-100 placeholder-gray-650 rounded-xl focus:outline-none focus:ring-2 focus:ring-${theme.primary}/10 focus:border-${theme.primary} text-sm font-sans`}
                />
              </div>

              {/* Question 2: Today */}
              <div>
                <label className="block text-xs font-bold uppercase font-mono tracking-wider text-gray-400 mb-2">
                  Question 2: {questions[1] || "What is your target objective for today?"}
                </label>
                <textarea
                  required
                  value={today}
                  onChange={(e) => setToday(e.target.value)}
                  placeholder="e.g., Working on database schema migrations. Syncing workspace integrations and testing client routes fallback mechanisms."
                  rows={3}
                  className={`block w-full px-3.5 py-3 border border-gray-800 bg-[#0c0d10] text-gray-100 placeholder-gray-650 rounded-xl focus:outline-none focus:ring-2 focus:ring-${theme.primary}/10 focus:border-${theme.primary} text-sm font-sans`}
                />
              </div>

              {/* Question 3: Blockers */}
              <div>
                <label className="block text-xs font-bold uppercase font-mono tracking-wider text-gray-400 mb-2">
                  Question 3: {questions[2] || "Are there any core blockers or dependencies delaying you?"}
                </label>
                <textarea
                  value={blockers}
                  onChange={(e) => {
                    setBlockers(e.target.value);
                    if (e.target.value.trim() && !isBlocked) {
                      setIsBlocked(true);
                    }
                  }}
                  placeholder="e.g., None today! Wait, checking on OAuth service status just in case."
                  rows={2}
                  className={`block w-full px-3.5 py-3 border border-gray-800 bg-[#0c0d10] text-gray-100 placeholder-gray-650 rounded-xl focus:outline-none focus:ring-2 focus:ring-${theme.primary}/10 focus:border-${theme.primary} text-sm font-sans`}
                />
                
                {/* Blocker Highlighting toggle */}
                <div className="mt-3 flex items-center">
                  <input
                    type="checkbox"
                    id="isBlockedCheckbox"
                    checked={isBlocked}
                    onChange={(e) => setIsBlocked(e.target.checked)}
                    className="h-4 w-4 bg-[#0c0d10] border-gray-800 text-emerald-500 rounded focus:ring-emerald-500/20 focus:ring-opacity-50"
                  />
                  <label htmlFor="isBlockedCheckbox" className="ml-2.5 text-xs text-rose-400 font-sans font-medium flex items-center cursor-pointer select-none">
                    🚨 <b>Explicitly flag my current state as BLOCKED</b> (highlights my card for Scrum Master review)
                  </label>
                </div>
              </div>

              {/* Stress Level slider rating */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold uppercase font-mono tracking-wider text-gray-400">
                    What is your current stress level? (1 - 5)
                  </label>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
                    stressLevel >= 4 
                      ? "text-rose-400 bg-rose-500/10 border border-rose-500/20" 
                      : stressLevel <= 2 
                      ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20" 
                      : "text-amber-400 bg-amber-500/10 border border-amber-500/20"
                  }`}>
                    {stressLevel === 1 ? "🔋 Peak Calm (1/5)" : ""}
                    {stressLevel === 2 ? "🟢 Low Stress (2/5)" : ""}
                    {stressLevel === 3 ? "🟡 Manageable (3/5)" : ""}
                    {stressLevel === 4 ? "🟠 Elevated Stress (4/5)" : ""}
                    {stressLevel === 5 ? "🔴 Heavy Overload (5/5)" : ""}
                  </span>
                </div>
                <div className="flex items-center space-x-3.5 bg-[#0c0d10] p-3 border border-gray-800 rounded-xl">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={stressLevel}
                    onChange={(e) => setStressLevel(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <span className="font-mono text-sm text-gray-400 font-bold w-4 text-center">{stressLevel}</span>
                </div>
              </div>

              {/* Mood selector dropdown */}
              <div>
                <label className="block text-xs font-bold uppercase font-mono tracking-wider text-gray-400 mb-2.5">
                  How is your focus/energy state?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {[
                    { state: "excellent", label: "🤩 Excellent", selectedClass: "border-emerald-500 bg-emerald-500/10 text-emerald-400" },
                    { state: "good", label: "😊 Good", selectedClass: "border-teal-500 bg-teal-500/10 text-teal-400" },
                    { state: "neutral", label: "😐 Neutral", selectedClass: "border-gray-500 bg-gray-800 text-gray-300" },
                    { state: "unhappy", label: "😞 Unhappy", selectedClass: "border-amber-500 bg-amber-500/10 text-amber-400" },
                    { state: "stressed", label: "😰 Stressed", selectedClass: "border-red-500 bg-red-500/10 text-red-400" },
                  ].map((item) => {
                    const isMoodSelected = mood === item.state;
                    return (
                      <button
                        key={item.state}
                        type="button"
                        onClick={() => setMood(item.state as any)}
                        className={`py-2 px-3 border rounded-xl text-center text-xs font-sans font-medium transition-all cursor-pointer ${
                          isMoodSelected 
                            ? item.selectedClass 
                            : "text-gray-400 bg-gray-900/40 border-gray-800 hover:border-gray-700 hover:text-white"
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Operations Panel */}
              <div className="flex flex-col sm:flex-row sm:justify-end items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 border-t border-gray-800 pt-5">
                <button
                  type="button"
                  onClick={handleManualDraftSave}
                  disabled={loading}
                  className="py-2.5 px-4 text-xs font-semibold border border-gray-800 hover:bg-gray-800 rounded-xl text-gray-400 flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Draft</span>
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`py-2.5 px-6 shrink-0 ${theme.bgAccent} hover:${theme.bgAccentHover} text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all shadow-lg ${theme.shadowAccent} cursor-pointer`}
                >
                  <ClipboardCheck className="h-4 w-4" />
                  <span>{loading ? "Syncing AI Engine..." : "Submit to Feed"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Dynamic Coach Side-Assistant Review Box */}
        <div className="lg:col-span-1 border border-gray-800 bg-[#16191f] p-6 rounded-2xl shadow-sm h-fit space-y-4">
          <div className="flex items-center space-x-2 border-b border-gray-800 pb-3">
            <Smile className={`h-5 w-5 ${theme.textAccent}`} />
            <h3 className="font-sans font-bold text-sm text-white uppercase tracking-wider">
              Scrum Assistant
            </h3>
          </div>
          <div className="space-y-3">
            <p className="text-xs text-gray-400 font-sans leading-relaxed">
              Before submitting, ensure your checklist explains key details. Standard scrum summaries focus on specific goals:
            </p>
            <div className="space-y-2.5 py-1 text-xs text-gray-350 font-sans font-normal">
              <div className="flex items-start space-x-2">
                <span className={`${theme.textAccent} font-bold shrink-0`}>✓</span>
                <span>Acknowledge pull-requests and reviewers</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className={`${theme.textAccent} font-bold shrink-0`}>✓</span>
                <span>Define target deliverables instead of hourly habits</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className={`${theme.textAccent} font-bold shrink-0`}>✓</span>
                <span>Flag architectural delay blocks early for team attention</span>
              </div>
            </div>
          </div>

          <div className="bg-[#1a1d23] p-4 rounded-xl border border-gray-800 space-y-2">
            <h4 className={`text-[10px] font-bold uppercase font-mono tracking-wider ${theme.textAccent}`}>
              Scrum Schedule
            </h4>
            <div className="space-y-1 text-xs text-gray-300 font-sans">
              <div className="flex justify-between">
                <span>Standup Scrum:</span>
                <span className="font-semibold text-white">{activeTeam.settings.standupTime} {activeTeam.settings.timezone}</span>
              </div>
              <div className="flex justify-between">
                <span>Deadline:</span>
                <span className="font-semibold text-white">{activeTeam.settings.deadline} {activeTeam.settings.timezone}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
