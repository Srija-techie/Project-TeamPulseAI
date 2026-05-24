import { useApp } from "../context/AppContext";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";
import { getTeamTheme } from "../utils/theme";

export default function UnauthorizedView() {
  const { user, setView } = useApp();
  const theme = getTeamTheme();

  const handleGoBack = () => {
    setView("dashboard");
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-[#0c0d10] p-8">
      <div className="max-w-md w-full bg-[#16191f] border border-gray-800 rounded-2xl shadow-sm p-8 text-center">
        <div className={`h-20 w-20 mx-auto rounded-full ${theme.bgAccent} flex items-center justify-center mb-6`}>
          <ShieldAlert className={`h-10 w-10 ${theme.textAccent}`} />
        </div>

        <h2 className="text-2xl font-bold text-white font-sans mb-3">
          Access Denied
        </h2>

        <p className="text-sm text-gray-400 font-sans mb-6 leading-relaxed">
          You don't have permission to access this page. This feature is restricted to administrators only.
        </p>

        <div className="bg-gray-950/40 border border-gray-850 rounded-xl p-4 mb-6">
          <p className="text-xs text-gray-500 font-mono mb-1">Your current role:</p>
          <p className="text-lg font-bold text-white font-sans">{user?.role || "Member"}</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleGoBack}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${theme.bgAccent} hover:${theme.bgAccentHover} text-white flex items-center justify-center space-x-2`}
          >
            <Home className="h-4 w-4" />
            <span>Return to Dashboard</span>
          </button>

          <button
            onClick={handleGoBack}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer bg-gray-800 hover:bg-gray-750 text-gray-300 flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Go Back</span>
          </button>
        </div>

        <p className="text-[10px] text-gray-600 font-mono mt-6">
          If you believe this is an error, please contact your system administrator.
        </p>
      </div>
    </div>
  );
}
