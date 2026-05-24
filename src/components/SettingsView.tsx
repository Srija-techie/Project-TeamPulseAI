import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext.js";
import { 
  Settings, 
  Trash2, 
  PlusCircle, 
  Clock, 
  Globe, 
  User, 
  Save,
  Palette,
  Smile,
  ShieldAlert,
  Sun,
  Moon
} from "lucide-react";
import { getTeamTheme, THEME_PRESETS, PRESET_EMOJIS } from "../theme.js";

export default function SettingsView() {
  const { activeTeam, updateSchedule, deleteTeamWorkspace, updateProfile, user, loading, themeMode, setThemeMode } = useApp();
  const theme = getTeamTheme(activeTeam?.settings?.theme);

  // Workspace configuration states
  const [teamName, setTeamName] = useState<string>("");
  const [questions, setQuestions] = useState<string[]>([]);
  const [newQuestionText, setNewQuestionText] = useState<string>("");
  const [standupTime, setStandupTime] = useState<string>("10:00");
  const [deadline, setDeadline] = useState<string>("12:00");
  const [timezone, setTimezone] = useState<string>("UTC");
  const [selectedTheme, setSelectedTheme] = useState<string>("emerald");
  const [selectedEmoji, setSelectedEmoji] = useState<string>("🚀");
  const [selectedWeekdays, setSelectedWeekdays] = useState<string[]>(["Mon", "Tue", "Wed", "Thu", "Fri"]);
  const [remindersEnabled, setRemindersEnabled] = useState<boolean>(true);
  const [slackChannel, setSlackChannel] = useState<string>("#scrum-updates");
  const [emailMailingList, setEmailMailingList] = useState<string>("");
  const [webhookUrl, setWebhookUrl] = useState<string>("");
  const [webhookToken, setWebhookToken] = useState<string>("");

  // User Profile metadata states
  const [userName, setUserName] = useState<string>("");
  const [profileAvatar, setProfileAvatar] = useState<string>("🦊");
  const [userTimezone, setUserTimezone] = useState<string>("UTC");
  const [emailDigest, setEmailDigest] = useState<boolean>(true);
  const [slackWebhookAlerts, setSlackWebhookAlerts] = useState<boolean>(false);
  const [dailyReminders, setDailyReminders] = useState<boolean>(true);

  useEffect(() => {
    if (activeTeam) {
      setTeamName(activeTeam.name || "");
      setQuestions(activeTeam.settings.questions || []);
      setStandupTime(activeTeam.settings.standupTime || "10:00");
      setDeadline(activeTeam.settings.deadline || "12:00");
      setTimezone(activeTeam.settings.timezone || "UTC");
      setSelectedTheme(activeTeam.settings.theme || "emerald");
      setSelectedEmoji(activeTeam.settings.emoji || "🚀");
      setSelectedWeekdays(activeTeam.settings.weekdays || ["Mon", "Tue", "Wed", "Thu", "Fri"]);
      setRemindersEnabled(activeTeam.settings.remindersEnabled !== false);
      setSlackChannel(activeTeam.settings.slackChannel || "#scrum-updates");
      setEmailMailingList(activeTeam.settings.emailMailingList || "agile-squad@company.com");
      setWebhookUrl(`${window.location.origin}/api/webhooks/jira`);
      setWebhookToken(activeTeam.settings.webhookToken || "tp_sec_token_" + activeTeam.id.slice(0, 6));
    }
    if (user) {
      setUserName(user.name);
      setProfileAvatar(user.avatar || "🦊");
      setUserTimezone(user.timezone || "UTC");
      setEmailDigest(user.notificationSettings ? !!user.notificationSettings.emailDigest : true);
      setSlackWebhookAlerts(user.notificationSettings ? !!user.notificationSettings.slackWebhookAlerts : false);
      setDailyReminders(user.notificationSettings ? !!user.notificationSettings.dailyReminders : true);
    }
  }, [activeTeam, user]);

  const handleUpdateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTeam) return;
    if (!teamName.trim()) {
      alert("Workspace name cannot be empty.");
      return;
    }
    if (questions.length === 0) {
      alert("Please keep at least one active standup question prompt.");
      return;
    }
    await updateSchedule(
      questions, 
      standupTime, 
      deadline, 
      timezone, 
      selectedTheme, 
      selectedEmoji, 
      selectedWeekdays, 
      teamName.trim(),
      remindersEnabled,
      slackChannel,
      emailMailingList,
      webhookUrl,
      webhookToken
    );
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;
    await updateProfile(userName, profileAvatar, {
      emailDigest,
      slackWebhookAlerts,
      dailyReminders
    }, userTimezone);
  };

  const handleDeleteWorkspace = async () => {
    if (!activeTeam) return;
    const isOwner = activeTeam.ownerId === user?.id;
    const isAdmin = user?.role === "Admin";
    if (!isOwner && !isAdmin) {
      alert("Unauthorized: Only the Workspace Owner or System Admins can purge this team space.");
      return;
    }
    const confirmPurge = confirm(`Are you absolutely sure you want to permanently delete the "${activeTeam.name}" workspace?\nThis will erase all check-ins, comments, and AI coaching insights. THIS CANNOT BE UNDONE.`);
    if (!confirmPurge) return;

    await deleteTeamWorkspace(activeTeam.id);
  };

  const handleAddQuestion = () => {
    if (!newQuestionText.trim()) return;
    setQuestions(prev => [...prev, newQuestionText.trim()]);
    setNewQuestionText("");
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex-1 p-8 space-y-8 bg-[#0c0d10] overflow-y-auto">
      {/* Page Header */}
      <div className="border-b border-gray-800 pb-5">
        <h2 className="text-3xl font-sans font-bold text-white tracking-tight leading-none mb-1">
          Settings Room
        </h2>
        <p className="text-sm font-sans text-gray-400 mt-1">
          Tweak team scrum questions, set check-in clock schedules, custom thematic colors, and edit your user credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Profile Card settings */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#16191f] p-6 border border-gray-800 rounded-2xl shadow-sm space-y-5">
            <div className="flex items-center space-x-2 border-b border-gray-850 pb-3">
              <User className={`h-5 w-5 ${theme.textAccent}`} />
              <h3 className="font-sans font-bold text-sm text-white uppercase tracking-wider">
                Personal Credentials
              </h3>
            </div>
            
            <form onSubmit={handleUpdateProfile} className="space-y-4 font-sans text-xs">
              <div>
                <label className="block text-gray-400 font-bold uppercase font-mono text-[9px] mb-1.5">User name</label>
                <input
                  type="text"
                  required
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className={`block w-full px-3.5 py-2.5 bg-[#0c0d10] border border-gray-800 rounded-xl text-gray-200 focus:outline-none focus:ring-2 focus:ring-${theme.primary}/10 focus:border-${theme.primary} text-xs font-sans`}
                />
              </div>

              <div>
                <label className="block text-gray-400 font-bold uppercase font-mono text-[9px] mb-1.5">Email address</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ""}
                  className="block w-full px-3.5 py-2.5 bg-[#020305] border border-gray-900 rounded-xl text-gray-500 font-sans cursor-not-allowed opacity-60"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-bold uppercase font-mono text-[9px] mb-1.5">User Timezone (Primary)</label>
                <select
                  value={userTimezone}
                  onChange={(e) => setUserTimezone(e.target.value)}
                  className={`block w-full px-3.5 py-2.5 bg-[#0c0d10] border border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-${theme.primary}/10 focus:border-${theme.primary} text-xs font-sans text-gray-350`}
                >
                  <option value="UTC">UTC Universal</option>
                  <option value="EST">EST Eastern (US)</option>
                  <option value="CST">CST Central (US)</option>
                  <option value="PST">PST Pacific (US)</option>
                  <option value="GMT">GMT London (UK)</option>
                  <option value="IST">IST India (Standard)</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 font-bold uppercase font-mono text-[9px] mb-1.5">Account Role</label>
                <span className={`inline-block ${theme.badgeBg} border ${theme.borderAccent} ${theme.textAccent} font-mono font-bold px-2.5 py-1 rounded-md mb-2`}>
                  {user?.role || "Member"}
                </span>
              </div>

              {/* Avatar Mascot Picker */}
              <div className="space-y-2 border-t border-gray-850 pt-4">
                <label className="block text-gray-400 font-bold uppercase font-mono text-[9px]">Select User Avatar Mascot</label>
                <p className="text-[10px] text-gray-500 mb-2">Configure a unique profile emoji icon shared across scrum reports.</p>
                <div className="grid grid-cols-4 gap-2.5 p-3 bg-[#0c0d10] rounded-xl border border-gray-800">
                  {["🦊", "🐨", "🦁", "🐸", "🤖", "👾", "🐙", "🦄"].map((emoji) => {
                    const isSelected = profileAvatar === emoji;
                    return (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setProfileAvatar(emoji)}
                        className={`text-2xl p-1.5 rounded-xl transition-all cursor-pointer hover:bg-gray-800 select-none ${
                          isSelected
                            ? `${theme.bgOpacity} border-2 border-${theme.primary} scale-110 shadow-md`
                            : "opacity-55 hover:opacity-100"
                        }`}
                      >
                        {emoji}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notification Toggles */}
              <div className="space-y-3.5 border-t border-gray-850 pt-4">
                <label className="block text-gray-400 font-bold uppercase font-mono text-[9px]">Notification System settings</label>
                
                <div className="flex items-start justify-between space-x-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-xs leading-none mb-1">Email Scrum Digest</p>
                    <p className="text-[10px] text-gray-500 leading-normal">Receive standup digests and summaries weekly.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailDigest}
                    onChange={(e) => setEmailDigest(e.target.checked)}
                    className={`rounded text-slate-800 bg-[#0c0d10] border-gray-800 focus:ring-0 focus:ring-offset-0 h-4 w-4 cursor-pointer mt-0.5`}
                  />
                </div>

                <div className="flex items-start justify-between space-x-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-xs leading-none mb-1">Slack Channel Alerts</p>
                    <p className="text-[10px] text-gray-500 leading-normal">Relay AI-blockers summaries instantly to Slack.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={slackWebhookAlerts}
                    onChange={(e) => setSlackWebhookAlerts(e.target.checked)}
                    className="rounded text-slate-800 bg-[#0c0d10] border-gray-800 focus:ring-0 focus:ring-offset-0 h-4 w-4 cursor-pointer mt-0.5"
                  />
                </div>

                <div className="flex items-start justify-between space-x-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-xs leading-none mb-1">Daily Scrum Reminders</p>
                    <p className="text-[10px] text-gray-500 leading-normal">Get alerted before target standup clocks.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={dailyReminders}
                    onChange={(e) => setDailyReminders(e.target.checked)}
                    className="rounded text-slate-800 bg-[#0c0d10] border-gray-800 focus:ring-0 focus:ring-offset-0 h-4 w-4 cursor-pointer mt-0.5"
                  />
                </div>
              </div>

              {/* Form submit */}
              <div className="border-t border-gray-850 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-2.5 px-4 rounded-xl text-center text-xs font-bold transition-all text-white cursor-pointer ${theme.bgAccent} hover:${theme.bgAccentHover} shadow-md ${theme.shadowAccent}`}
                >
                  {loading ? "Saving Credentials..." : "Update Credentials"}
                </button>
              </div>
            </form>
          </div>

          {/* Theme Preference Settings Mode Selection */}
          <div className="bg-[#16191f] p-6 border border-gray-800 rounded-2xl shadow-sm space-y-5">
            <div className="flex items-center space-x-2 border-b border-gray-850 pb-3">
              <Palette className={`h-5 w-5 ${theme.textAccent}`} />
              <h3 className="font-sans font-bold text-sm text-white uppercase tracking-wider">
                Appearance Settings
              </h3>
            </div>
            
            <div className="space-y-3 font-sans">
              <p className="text-[11px] text-gray-400 leading-normal">
                Toggle between the standard Elegant Dark dashboard or default Light Mode configuration.
              </p>
              
              <div className="grid grid-cols-2 gap-3 pt-1">
                {/* Dark mode choice */}
                <button
                  id="theme-toggle-dark"
                  type="button"
                  onClick={() => setThemeMode("dark")}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-2 cursor-pointer transition-all ${
                    themeMode === "dark"
                      ? `${theme.bgOpacity} border-${theme.primary} text-white ring-1 ring-${theme.primary}/50 font-semibold`
                      : "bg-[#0c0d10] border-gray-800 text-gray-400 hover:border-gray-700 hover:text-gray-200"
                  }`}
                >
                  <Moon className="h-4.5 w-4.5" />
                  <span className="text-[11px] font-semibold">Elegant Dark</span>
                </button>
                
                {/* Light mode choice */}
                <button
                  id="theme-toggle-light"
                  type="button"
                  onClick={() => setThemeMode("light")}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-2 cursor-pointer transition-all ${
                    themeMode === "light"
                      ? `${theme.bgOpacity} ${theme.textAccent} border-${theme.primary} ring-1 ring-${theme.primary}/50 font-semibold`
                      : "bg-[#0c0d10] border-gray-800 text-gray-400 hover:border-gray-700 hover:text-gray-200"
                  }`}
                >
                  <Sun className="h-4.5 w-4.5" />
                  <span className="text-[11px] font-semibold">Light Mode</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Team Schedule & Questions Form */}
        <div className="lg:col-span-2">
          {activeTeam ? (
            <div className="bg-[#16191f] p-6 border border-gray-800 rounded-2xl shadow-sm space-y-6">
              
              <div className="flex items-center space-x-2 border-b border-gray-850 pb-3">
                <Settings className={`h-5 w-5 ${theme.textAccent}`} />
                <h3 className="font-sans font-bold text-sm text-white uppercase tracking-wider">
                  Workspace settings & Customizations
                </h3>
              </div>

              <form onSubmit={handleUpdateSchedule} className="space-y-6">
                
                {/* Rename Workspace Input */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase font-mono tracking-wider mb-2">
                    Rename Workspace / Team Space
                  </label>
                  <input
                    type="text"
                    required
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className={`block w-full px-3.5 py-2.5 bg-[#0c0d10] border border-gray-800 rounded-xl text-gray-205 focus:outline-none focus:ring-2 focus:ring-${theme.primary}/10 focus:border-${theme.primary} text-xs font-sans`}
                  />
                  <p className="text-[10px] text-gray-550 mt-1">Changes the display name of this hub for all members.</p>
                </div>

                {/* Questions Block editors */}
                <div className="space-y-4">
                  <label className="block text-xs font-bold text-gray-400 uppercase font-mono tracking-wider">
                    Custom Standup Questions List
                  </label>
                  
                  <div className="space-y-2.5">
                    {questions.map((q, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-[#0c0d10] rounded-xl border border-gray-800 font-sans">
                        <span className="text-xs text-gray-300 truncate mr-3">
                          <span className="font-bold text-gray-500 font-mono mr-1.5">Q{idx+1}:</span> {q}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestion(idx)}
                          className="p-1.5 text-gray-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add new inline question input */}
                  <div className="flex items-center space-x-2 pt-2">
                    <input
                      type="text"
                      value={newQuestionText}
                      onChange={(e) => setNewQuestionText(e.target.value)}
                      placeholder="e.g., What did you learn that was helpful?"
                      className={`block flex-1 px-3.5 py-2 border border-gray-800 bg-[#0c0d10] text-gray-200 focus:outline-none focus:ring-2 focus:ring-${theme.primary}/10 focus:border-${theme.primary} text-sm placeholder-gray-650 font-sans rounded-xl`}
                    />
                    <button
                      type="button"
                      onClick={handleAddQuestion}
                      className={`py-2 px-3.5 ${theme.bgOpacity} ${theme.textAccent} hover:${theme.bgAccentHover}/20 border ${theme.borderAccent} rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1`}
                    >
                      <PlusCircle className="h-4 w-4" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>

                {/* Times scheduler grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 border-t border-gray-850 pt-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase font-mono tracking-wider mb-2">
                      Scrum Daily Clock Time
                    </label>
                    <div className="relative">
                      <Clock className="absolute top-3 left-3 h-4.5 w-4.5 text-gray-500 pointer-events-none" />
                      <input
                        type="time"
                        required
                        value={standupTime}
                        onChange={(e) => setStandupTime(e.target.value)}
                        className={`block w-full pl-10 pr-3 py-2 border border-gray-800 bg-[#0c0d10] text-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-${theme.primary}/10 focus:border-${theme.primary} text-sm font-sans`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase font-mono tracking-wider mb-2">
                      Check-in Deadline
                    </label>
                    <div className="relative">
                      <Clock className="absolute top-3 left-3 h-4.5 w-4.5 text-gray-500 pointer-events-none" />
                      <input
                        type="time"
                        required
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        className={`block w-full pl-10 pr-3 py-2 border border-gray-800 bg-[#0c0d10] text-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-${theme.primary}/10 focus:border-${theme.primary} text-sm font-sans`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase font-mono tracking-wider mb-2">
                      Timezone System
                    </label>
                    <div className="relative">
                      <Globe className="absolute top-3 left-3 h-4.5 w-4.5 text-gray-500 pointer-events-none" />
                      <select
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className={`block w-full pl-10 pr-3 py-2.5 border border-gray-800 bg-[#0c0d10] rounded-xl focus:outline-none focus:ring-2 focus:ring-${theme.primary}/10 focus:border-${theme.primary} text-xs font-sans text-gray-300`}
                      >
                        <option value="UTC" className="bg-[#16191f] text-gray-300">UTC Universal</option>
                        <option value="EST" className="bg-[#16191f] text-gray-300">EST Eastern (US)</option>
                        <option value="CST" className="bg-[#16191f] text-gray-300">CST Central (US)</option>
                        <option value="PST" className="bg-[#16191f] text-gray-300">PST Pacific (US)</option>
                        <option value="GMT" className="bg-[#16191f] text-gray-300">GMT London (UK)</option>
                        <option value="IST" className="bg-[#16191f] text-gray-300">IST India (Standard)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Standup Schedule Weekdays Settings Checklist */}
                <div className="border-t border-gray-850 pt-5">
                  <label className="block text-xs font-bold text-gray-400 uppercase font-mono tracking-wider mb-2.5">
                    Standup Workdays Schedule
                  </label>
                  <p className="text-[10px] text-gray-500 mb-3.5">
                    Configure active days on which members should expect standup reminder alerts and check-in prompt flags.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => {
                      const isSelected = selectedWeekdays.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setSelectedWeekdays(prev => prev.filter(d => d !== day));
                            } else {
                              setSelectedWeekdays(prev => [...prev, day]);
                            }
                          }}
                          className={`py-2 px-3.5 text-xs font-mono font-bold rounded-lg border transition-all cursor-pointer ${
                            isSelected
                              ? `${theme.bgOpacity} ${theme.textAccent} border-${theme.primary} ring-1 ring-${theme.primary}/50`
                              : "bg-[#0c0d10] border-gray-850 text-gray-400 hover:border-gray-700 hover:text-gray-300"
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Automation & Team Integrations */}
                <div className="border-t border-gray-850 pt-5 space-y-4">
                  <h4 className="text-xs font-bold text-gray-300 uppercase font-mono tracking-wider">
                    🛰️ Integrations & Team Automations
                  </h4>
                  <p className="text-[10px] text-gray-500">
                    Enable auto-alerts of scrum reports, notify Slack workspaces, or auto-sync Jira board tickets closed yesterday.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Auto-reminders toggle */}
                    <div className="bg-[#0b0c0f] p-4 border border-gray-800 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-gray-200">Auto Reminders (30 mins early)</p>
                          <p className="text-[10px] text-gray-500">Ping teammates who haven't filed standups yet.</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={remindersEnabled}
                          onChange={(e) => setRemindersEnabled(e.target.checked)}
                          className="h-4 w-4 rounded border-gray-800 text-emerald-500 focus:ring-emerald-500/20"
                        />
                      </div>
                    </div>

                    {/* Slack Channel integration */}
                    <div className="bg-[#0b0c0f] p-4 border border-gray-800 rounded-xl space-y-2">
                      <label className="block text-[10px] font-bold text-gray-400 font-mono uppercase">Slack Broadcast Channel</label>
                      <input
                        type="text"
                        value={slackChannel}
                        onChange={(e) => setSlackChannel(e.target.value)}
                        placeholder="e.g., #scrum-updates"
                        className="block w-full px-3 py-2 border border-gray-850 bg-[#0c0d10] text-gray-205 rounded-xl text-xs placeholder-gray-650"
                      />
                    </div>

                    {/* Email Mailing List compilation */}
                    <div className="bg-[#0b0c0f] p-4 border border-gray-800 rounded-xl space-y-2">
                      <label className="block text-[10px] font-bold text-gray-400 font-mono uppercase">Email Delivery Recipient List</label>
                      <input
                        type="email"
                        value={emailMailingList}
                        onChange={(e) => setEmailMailingList(e.target.value)}
                        placeholder="e.g., product-scrum@company.com"
                        className="block w-full px-3 py-2 border border-gray-850 bg-[#0c0d10] text-gray-205 rounded-xl text-xs placeholder-gray-650"
                      />
                    </div>

                    {/* Jira incoming webhook connection */}
                    <div className="bg-[#0b0c0f] p-4 border border-gray-800 rounded-xl space-y-2 md:col-span-2">
                      <div className="flex justify-between items-center">
                        <label className="block text-[10px] font-bold text-gray-400 font-mono uppercase"> JIRA Webhook Endpoint URL</label>
                        <span className="text-[9px] text-emerald-500 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">Secure SSL Enabled</span>
                      </div>
                      <p className="text-[10px] text-gray-500 leading-normal">
                        Configure Jira's webhook system to send issue-complete triggers. It will auto-populate targets under "yesterday's goals".
                      </p>
                      <input
                        type="text"
                        readOnly
                        value={webhookUrl}
                        className="block w-full px-3 py-2 bg-[#020305] border border-gray-900 text-gray-500 rounded-xl text-xs font-mono cursor-not-allowed select-all"
                      />
                      <div className="flex items-center space-x-2 pt-1 justify-between">
                        <span className="text-[9px] text-gray-550 font-mono">Secret Key: <code className="text-gray-400">{webhookToken}</code></span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(webhookUrl);
                            alert("Webhook URL copied successfully!");
                          }}
                          className={`${theme.textAccent} hover:underline font-bold text-[9px]`}
                        >
                          Copy Endpoint URL
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Team Customization (Emoji and Theme) */}
                <div className="border-t border-gray-850 pt-5 space-y-6">
                  {/* Emoji selection block */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-1.5">
                      <Smile className={`h-4 w-4 ${theme.textAccent}`} />
                      <h4 className="text-xs font-bold text-gray-300 uppercase font-mono tracking-wider">
                        Workspace Mascot Emoji
                      </h4>
                    </div>
                    <p className="text-xs text-gray-400 font-sans">
                      Select an emoji to represent this team in workspace navigation tabs, reports, and summary views.
                    </p>
                    <div className="flex flex-wrap gap-2 p-3.5 bg-[#0c0d10] rounded-xl border border-gray-800">
                      {PRESET_EMOJIS.map((emoji) => {
                        const isEmojiSelected = selectedEmoji === emoji;
                        return (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => setSelectedEmoji(emoji)}
                            className={`text-xl p-2.5 rounded-xl transition-all cursor-pointer hover:bg-gray-800 select-none ${
                              isEmojiSelected
                                ? `${theme.bgOpacity} border-2 border-${theme.primary} scale-110 shadow-md`
                                : "opacity-65 hover:opacity-100"
                            }`}
                          >
                            {emoji}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Theme selection block */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-1.5">
                      <Palette className={`h-4 w-4 ${theme.textAccent}`} />
                      <h4 className="text-xs font-bold text-gray-300 uppercase font-mono tracking-wider">
                        Workspace Brand Color Theme
                      </h4>
                    </div>
                    <p className="text-xs text-gray-400 font-sans">
                      Select a visual theme to personalize buttons, indicators, and charts across all screens for your team.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {Object.entries(THEME_PRESETS).map(([id, preset]) => {
                        const isThemeSelected = selectedTheme === id;
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => setSelectedTheme(id)}
                            className={`p-3 rounded-xl border text-xs font-semibold font-sans transition-all flex items-center space-x-2.5 cursor-pointer text-left ${
                              isThemeSelected
                                ? `bg-[#0e1115] border-${preset.colors.primary} text-white shadow-md relative overflow-hidden ring-2 ring-${preset.colors.primary}/20`
                                : "bg-[#0c0d10] border-gray-800 text-gray-400 hover:border-gray-700 hover:text-gray-300"
                            }`}
                          >
                            <span className={`w-3.5 h-3.5 rounded-full ${preset.colors.bgAccent} inline-block shrink-0`} />
                            <span className="truncate">{preset.name}</span>
                            {isThemeSelected && (
                              <span className={`absolute top-0 right-0 w-3 h-3 ${preset.colors.bgAccent} rounded-bl-lg`} />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Form submit footer */}
                <div className="flex justify-end border-t border-gray-850 pt-5">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`py-2.5 px-6 shrink-0 ${theme.bgAccent} hover:${theme.bgAccentHover} text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all shadow-lg ${theme.shadowAccent} cursor-pointer`}
                  >
                    <Save className="h-4 w-4" />
                    <span>{loading ? "Syncing Workspace..." : "Save Workspace Customizations"}</span>
                  </button>
                </div>

              </form>

              {/* Danger Zone */}
              <div className="bg-[#16191f] p-6 border border-red-950 bg-red-950/5 rounded-2xl shadow-sm space-y-4 pt-5 mt-6 border-t border-gray-850">
                <div className="flex items-center space-x-2 border-b border-red-950 pb-3">
                  <span className="text-red-400 text-sm">⚠</span>
                  <h3 className="font-sans font-bold text-sm text-red-300 uppercase tracking-wider">
                    Danger Zone - Workspace Actions
                  </h3>
                </div>
                <p className="text-xs text-gray-400 font-sans leading-relaxed">
                  Permanently purge the active team workspace. All standup reports, historical metrics, AI analytics briefings, and custom questions backlogs will be removed. This action is **irreversible**.
                </p>
                <div className="flex pt-1 flex-wrap gap-3 justify-between items-center text-xs">
                  <span className="text-gray-500 font-mono text-[10px]">
                    Authorized to Workspace Owner & Admin Roles only.
                  </span>
                  <button
                    type="button"
                    onClick={handleDeleteWorkspace}
                    disabled={loading}
                    className="py-2.5 px-4 bg-red-950 border border-red-900/40 hover:bg-red-900 hover:text-white transition-all text-red-200 font-bold rounded-xl text-xs cursor-pointer inline-flex items-center space-x-1.5"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete Team Workspace</span>
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-[#16191f] border border-gray-800 p-8 rounded-2xl shadow-sm text-center">
              <Settings className="h-8 w-8 text-gray-600 mx-auto mb-2" />
              <p className="text-xs text-gray-400 font-sans">
                Create or join a team first to configure scheduler and scrum questions profiles.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
