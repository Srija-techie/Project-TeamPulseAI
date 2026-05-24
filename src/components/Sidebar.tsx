import { useApp } from "../context/AppContext.js";
import { 
  LayoutDashboard, 
  ClipboardCheck, 
  Users, 
  BarChart3, 
  FileText, 
  Settings, 
  LogOut, 
  ChevronDown, 
  Flame, 
  Sparkles,
  Award
} from "lucide-react";
import { useState } from "react";
import { getTeamTheme } from "../theme.js";

export default function Sidebar() {
  const { 
    user, 
    myTeams, 
    activeTeam, 
    setActiveTeamById, 
    logout, 
    currentView, 
    setView 
  } = useApp();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const theme = getTeamTheme(activeTeam?.settings?.theme);

  const menuItems = [
    { view: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { view: "standups", label: "Standups", icon: ClipboardCheck },
    { view: "teams", label: "Teams & Members", icon: Users },
    { view: "analytics", label: "Analytics & Trends", icon: BarChart3 },
    { view: "reports", label: "AI Bullet Reports", icon: FileText },
    { view: "coach", label: "Sprint Coach Q&A", icon: Sparkles },
    { view: "achievements", label: "Achievements", icon: Award },
    { view: "settings", label: "Schedule Settings", icon: Settings },
  ];

  if (user?.role === "Admin" || user?.role === "Manager") {
    // Insert admin panel just before scheduling settings
    menuItems.splice(7, 0, { view: "admin", label: "👑 Admin Portal", icon: Award });
  }

  if (!user) return null;

  return (
    <aside className="w-64 bg-[#111318] text-gray-300 flex flex-col h-screen shrink-0 border-r border-gray-800">
      {/* Branding Header */}
      <div className="p-6 flex items-center gap-2 border-b border-gray-800">
        <div className={`h-8 w-8 rounded-lg ${theme.bgAccent} flex items-center justify-center shadow-md`}>
          <div className="h-4 w-4 bg-white rounded-full animate-pulse"></div>
        </div>
        <span className="text-xl font-bold tracking-tight text-white">TeamPulse<span className={theme.textAccent}>AI</span></span>
      </div>

      {/* Team Dropdown Selector */}
      <div className="p-4 relative">
        <label className="block text-[10px] text-gray-500 uppercase font-sans tracking-wider font-semibold mb-1.5 px-1">
          Active Workspace
        </label>
        {myTeams.length > 0 ? (
          <div>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full flex items-center justify-between py-2.5 px-3 bg-[#16191f] hover:bg-gray-850 border border-gray-800 rounded-xl transition-all cursor-pointer text-sm text-white font-sans font-medium"
            >
              <span className="truncate flex items-center space-x-2">
                <span>{activeTeam?.settings?.emoji || "🚀"}</span>
                <span className="truncate">{activeTeam ? activeTeam.name : "Select Workspace"}</span>
              </span>
              <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>
            {dropdownOpen && (
              <div className="absolute left-4 right-4 mt-1 bg-[#16191f] border border-gray-800 rounded-xl shadow-xl z-50 py-1 overflow-hidden max-h-60 overflow-y-auto">
                {myTeams.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setActiveTeamById(t.id);
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm font-sans transition-colors block text-white ${
                      activeTeam?.id === t.id 
                        ? `${theme.bgAccent} font-semibold` 
                        : "hover:bg-gray-800"
                    }`}
                  >
                    <span className="flex items-center space-x-2">
                      <span>{t.settings?.emoji || "🚀"}</span>
                      <span className="truncate">{t.name}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => setView("teams")}
            className="w-full text-center py-2 px-3 bg-emerald-950/40 hover:bg-emerald-900/30 border border-emerald-850 text-emerald-300 rounded-xl text-xs font-sans transition-colors block cursor-pointer"
          >
            ➕ Create/Join Workspace
          </button>
        )}
      </div>

      {/* Navigation Tabs */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => setView(item.view)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-sans text-left transition-all cursor-pointer ${
                isActive
                  ? `bg-gray-800 ${theme.textAccent} font-semibold shadow-md border ${theme.borderAccent}`
                  : "hover:bg-gray-800/40 text-gray-400 hover:text-white"
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? theme.textAccent : "text-gray-400 group-hover:text-white"}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Logged User Card Info */}
      <div className="p-4 border-t border-gray-800 bg-gray-950/40">
        <div className="flex items-center space-x-3 mb-3">
          <div className="bg-gray-800 border border-gray-750 w-10 h-10 rounded-xl flex items-center justify-center text-lg select-none relative shrink-0">
            <span>{user.avatar || "🦊"}</span>
            <span className={`absolute -top-1.5 -right-1.5 ${theme.bgAccent} text-[10px] text-white font-mono font-bold w-4 h-4 rounded-full flex items-center justify-center`}>
              {user.streak}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-sans font-semibold text-white truncate leading-none mb-1">{user.name}</p>
            <div className="flex items-center space-x-1">
              <span className={`text-[9px] uppercase font-mono px-1.5 py-0.5 rounded-md font-bold ${
                user.role === "Admin" 
                  ? "bg-red-500/20 text-red-400 border border-red-500/30" 
                  : user.role === "Manager" 
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" 
                  : `${theme.badgeBg} ${theme.textAccent} border ${theme.borderAccent}`
              }`}>
                {user.role}
              </span>
              <span className="text-[10px] font-mono text-gray-500">Streak: {user.streak}d</span>
            </div>
          </div>
        </div>

        {/* Display Badge Snippet */}
        {user.badges.length > 0 && (
          <div className="py-1.5 px-2 bg-gray-800/40 border border-gray-800/80 rounded-lg flex items-center space-x-1.5 mb-3">
            <Award className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-[10px] text-amber-400 font-mono font-semibold truncate">
              {user.badges[user.badges.length - 1]} Accrued
            </span>
          </div>
        )}

        <button
          onClick={logout}
          className="w-full py-2 px-3 hover:bg-red-500/10 hover:text-red-400 rounded-xl text-xs font-sans text-gray-500 font-medium transition-colors flex items-center justify-center space-x-1.5 border border-dashed border-gray-800 hover:border-red-500/25 cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span>Exit Workspace</span>
        </button>
      </div>
    </aside>
  );
}
