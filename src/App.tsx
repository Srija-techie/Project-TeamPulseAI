import { AppProvider, useApp } from "./context/AppContext.js";
import AuthPage from "./components/AuthPage.js";
import Sidebar from "./components/Sidebar.js";
import DashboardView from "./components/DashboardView.js";
import StandupsView from "./components/StandupsView.js";
import TeamsView from "./components/TeamsView.js";
import AnalyticsView from "./components/AnalyticsView.js";
import ReportsView from "./components/ReportsView.js";
import SettingsView from "./components/SettingsView.js";
import CoachView from "./components/CoachView.js";
import AchievementsView from "./components/AchievementsView.js";
import AdminPortalView from "./components/AdminPortalView.js";
import { AlertCircle, CheckCircle, Sparkles } from "lucide-react";

function RootAppContent() {
  const { user, token, currentView, successMsg, errorMsg, clearToast } = useApp();

  // If user is not logged in or token is not set, load AuthPage
  if (!token || !user) {
    return (
      <div className="relative">
        <AuthPage />
        <ToastNotification successMsg={successMsg} errorMsg={errorMsg} clearToast={clearToast} />
      </div>
    );
  }

  // Render current views based on view state
  const renderView = () => {
    switch (currentView) {
      case "dashboard":
        return <DashboardView />;
      case "standups":
        return <StandupsView />;
      case "teams":
        return <TeamsView />;
      case "analytics":
        return <AnalyticsView />;
      case "reports":
        return <ReportsView />;
      case "coach":
        return <CoachView />;
      case "achievements":
        return <AchievementsView />;
      case "admin":
        return <AdminPortalView />;
      case "settings":
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0c0d10]">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {renderView()}
        <ToastNotification successMsg={successMsg} errorMsg={errorMsg} clearToast={clearToast} />
      </main>
    </div>
  );
}

// Global Custom Floating Toast Notification Component
function ToastNotification({ 
  successMsg, 
  errorMsg, 
  clearToast 
}: { 
  successMsg: string | null; 
  errorMsg: string | null; 
  clearToast: () => void;
}) {
  if (!successMsg && !errorMsg) return null;

  const isSuccess = !!successMsg;
  const msgText = successMsg || errorMsg;

  return (
    <div className="absolute bottom-5 right-5 z-50 max-w-sm">
      <div 
        onClick={clearToast} 
        className={`p-4 shadow-2xl border rounded-2xl flex items-center space-x-3 cursor-pointer select-none transition-all ${
          isSuccess 
            ? "bg-[#16191f] text-gray-200 border-emerald-500/30" 
            : "bg-[#16191f] text-red-100 border-red-500/30"
        }`}
      >
        {isSuccess ? (
          <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
        ) : (
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
        )}
        <span className="text-xs font-sans font-medium tracking-wide">
          {msgText}
        </span>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <RootAppContent />
    </AppProvider>
  );
}
