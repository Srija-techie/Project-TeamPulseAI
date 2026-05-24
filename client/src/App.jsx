import { AppProvider, useApp } from "./context/AppContext";
import AuthPage from "./components/AuthPage";
import Sidebar from "./components/Sidebar";
import DashboardView from "./components/DashboardView";
import StandupsView from "./components/StandupsView";
import TeamsView from "./components/TeamsView";
import AnalyticsView from "./components/AnalyticsView";
import ReportsView from "./components/ReportsView";
import SettingsView from "./components/SettingsView";
import CoachView from "./components/CoachView";
import AchievementsView from "./components/AchievementsView";
import AdminPortalView from "./components/AdminPortalView";
import SubscriptionView from "./components/SubscriptionView";
import UnauthorizedView from "./components/UnauthorizedView";
import { AlertCircle, CheckCircle } from "lucide-react";

function RootAppContent() {
  const { user, token, currentView, successMsg, errorMsg, clearToast } = useApp();

  if (!token || !user) {
    return (
      <div className="relative">
        <AuthPage />
        <ToastNotification successMsg={successMsg} errorMsg={errorMsg} clearToast={clearToast} />
      </div>
    );
  }

  const renderView = () => {
    if (currentView === "admin" && user?.role !== "Admin") {
      return <UnauthorizedView />;
    }
    if (currentView === "settings" && user?.role !== "Admin") {
      return <UnauthorizedView />;
    }

    switch (currentView) {
      case "dashboard": return <DashboardView />;
      case "standups": return <StandupsView />;
      case "teams": return <TeamsView />;
      case "analytics": return <AnalyticsView />;
      case "reports": return <ReportsView />;
      case "coach": return <CoachView />;
      case "achievements": return <AchievementsView />;
      case "admin": return <AdminPortalView />;
      case "settings": return <SettingsView />;
      case "subscription": return <SubscriptionView />;
      default: return <DashboardView />;
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

function ToastNotification({ successMsg, errorMsg, clearToast }) {
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
