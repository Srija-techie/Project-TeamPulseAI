import { useState } from "react";
import { useApp } from "../context/AppContext.js";
import { 
  Sparkles, 
  TrendingUp, 
  CreditCard, 
  Mail, 
  CheckCircle2, 
  Clock, 
  HelpCircle, 
  ShieldAlert,
  Zap,
  Activity
} from "lucide-react";
import { getTeamTheme } from "../theme.js";

interface SupportTicket {
  id: string;
  user: string;
  email: string;
  subject: string;
  status: "Open" | "Resolved";
  date: string;
}

export default function AdminPortalView() {
  const { activeTeam, user } = useApp();
  const theme = getTeamTheme(activeTeam?.settings?.theme);

  // Billing states
  const [billingPlan, setBillingPlan] = useState<"standard" | "enterprise">("standard");
  const [isUpgrading, setIsUpgrading] = useState(false);

  // Support tickets states (Simulated live resolve)
  const [tickets, setTickets] = useState<SupportTicket[]>([
    { id: "TK-9402", user: "John Carter", email: "john@company.com", subject: "Slack webhook fails with 404 forbidden error on retro channel", status: "Open", date: "2026-05-22" },
    { id: "TK-8124", user: "Emily Stone", email: "emily@company.com", subject: "Jira integration token doesn't sync some sprint descriptions", status: "Open", date: "2026-05-21" },
    { id: "TK-5390", user: "Dave Grohl", email: "dave@rock.com", subject: "How to edit standard morning scrum schedules", status: "Resolved", date: "2026-05-19" },
  ]);

  // API logs states
  const [apiHits, setApiHits] = useState(148);

  const handleResolveTicket = (id: string) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: "Resolved" } : t));
  };

  const handleUpgradePlan = () => {
    setIsUpgrading(true);
    setTimeout(() => {
      setBillingPlan("enterprise");
      setIsUpgrading(false);
      setApiHits(prev => prev + 5);
    }, 1200);
  };

  return (
    <div className="flex-1 p-8 space-y-8 bg-[#0c0d10] overflow-y-auto">
      {/* Header */}
      <div className="border-b border-gray-800 pb-5">
        <h2 className="text-3xl font-sans font-bold text-white tracking-tight leading-none mb-1">
          👑 Administrative Portal
        </h2>
        <p className="text-sm font-sans text-gray-400 mt-1">
          Monitor system metrics, aggregate API usage logs, configure workspace billing plans, and resolve support requests.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: Analytics Telemetry and Plans */}
        <div className="lg:col-span-2 space-y-6">
          {/* API Usage & Quota */}
          <div className="bg-[#16191f] p-6 border border-gray-800 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center space-x-2 border-b border-gray-850 pb-3">
              <Activity className={`h-5 w-5 ${theme.textAccent}`} />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-sans">
                Core API Telemetry & Quota Log
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-950/40 border border-gray-850 p-4 rounded-xl">
                <span className="text-[10px] text-gray-550 uppercase font-mono font-bold block mb-1">AI Gemini Tokens</span>
                <p className="text-xl font-bold text-white font-mono">15,248 <span className="text-xs text-gray-500">used</span></p>
                <div className="mt-2 h-1.5 bg-gray-900 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: "30.5%" }}></div>
                </div>
                <p className="text-[9px] text-gray-500 mt-1.5">Quota: 50,000 monthly</p>
              </div>

              <div className="bg-gray-950/40 border border-gray-850 p-4 rounded-xl">
                <span className="text-[10px] text-gray-550 uppercase font-mono font-bold block mb-1">Incoming Webhook Calls</span>
                <p className="text-xl font-bold text-white font-mono">{apiHits} <span className="text-xs text-gray-500">hits</span></p>
                <div className="mt-2 h-1.5 bg-gray-900 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-500 rounded-full animate-pulse" style={{ width: "74%" }}></div>
                </div>
                <p className="text-[9px] text-gray-500 mt-1.5">Latency average: 18ms</p>
              </div>

              <div className="bg-gray-950/40 border border-gray-850 p-4 rounded-xl">
                <span className="text-[10px] text-gray-550 uppercase font-mono font-bold block mb-1">Database Queries</span>
                <p className="text-xl font-bold text-white font-mono">4,192 <span className="text-xs text-gray-500">syncs</span></p>
                <div className="mt-2 h-1.5 bg-gray-900 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: "55%" }}></div>
                </div>
                <p className="text-[9px] text-gray-500 mt-1.5">I/O status: Highly Stable</p>
              </div>
            </div>
          </div>

          {/* Support Tickets Queue */}
          <div className="bg-[#16191f] p-6 border border-gray-800 rounded-2xl shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-gray-850 pb-3">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="h-5 w-5 text-rose-500" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-sans">
                  Active Support Tickets Queue
                </h3>
              </div>
              <span className="text-[10px] text-rose-400 font-mono font-bold bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">
                {tickets.filter(t => t.status === "Open").length} open requests
              </span>
            </div>

            <div className="space-y-3 font-sans">
              {tickets.map(t => (
                <div key={t.id} className="p-4 bg-gray-950/40 border border-gray-850 rounded-xl space-y-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2.5">
                      <span className="text-xs font-mono font-bold text-gray-400">{t.id}</span>
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
                        t.status === "Open" 
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" 
                          : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      }`}>
                        {t.status}
                      </span>
                      <span className="text-[10px] text-gray-500">{t.date}</span>
                    </div>
                    <p className="text-xs font-bold text-white pr-4">{t.subject}</p>
                    <p className="text-[10px] text-gray-400">Created by <b className="text-gray-300">{t.user}</b> ({t.email})</p>
                  </div>

                  {t.status === "Open" && (
                    <button
                      onClick={() => handleResolveTicket(t.id)}
                      className={`py-1.5 px-3 border border-transparent rounded-lg text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors cursor-pointer shrink-0 h-fit`}
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: Billing Tier configurations */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#16191f] p-6 border border-gray-800 rounded-2xl shadow-sm space-y-5">
            <div className="flex items-center space-x-2 border-b border-gray-800 pb-3">
              <CreditCard className={`h-5 w-5 ${theme.textAccent}`} />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-sans">
                Workspace Billing Config
              </h3>
            </div>

            <div className="space-y-4">
              <div className="bg-[#0c0d10] p-4 border border-gray-850 rounded-xl text-center space-y-1">
                <p className="text-[10px] uppercase font-mono text-gray-500 font-bold">Current Active Tier</p>
                <div className="flex justify-center items-center space-x-1.5">
                  <span className="text-2xl font-bold text-white capitalize">{billingPlan} Suite</span>
                  <Zap className="h-4.5 w-4.5 text-amber-400 fill-amber-400" />
                </div>
              </div>

              {billingPlan === "standard" ? (
                <div className="space-y-3.5 pt-2">
                  <p className="text-xs text-gray-400 leading-normal font-sans">
                    Your team is currently on the <b>Standard Agile Plan</b>. Elevate your workspace to configure unlimited Slack feeds, custom webhooks, and unlimited AI coach history syncs.
                  </p>
                  <button
                    onClick={handleUpgradePlan}
                    disabled={isUpgrading}
                    className="w-full py-2.5 px-4 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 transition-colors rounded-xl flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <span>{isUpgrading ? "Upgrading Workspace..." : "🚀 Upgrade to Enterprise ($49/mo)"}</span>
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl space-y-1 font-sans">
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs text-emerald-400 font-bold">Elite Enterprise Tier Active</span>
                  </div>
                  <p className="text-[10px] text-gray-400 leading-normal pt-1">
                    Billing cycle auto-renews on June 22, 2026. Custom Jira integrations and Slack webhook sockets are fully operational.
                  </p>
                </div>
              )}
            </div>

            <div className="border-t border-gray-850 pt-4 space-y-3">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase font-mono tracking-wider">Features unlocked on Enterprise</h4>
              <ul className="text-[10px] text-gray-400 space-y-1.5 font-sans">
                <li className="flex items-center space-x-1.5">
                  <span className="text-emerald-500">✓</span>
                  <span>Unlimited historical standups</span>
                </li>
                <li className="flex items-center space-x-1.5">
                  <span className="text-emerald-500">✓</span>
                  <span>Dedicated SMTP Relay Mailing Lists</span>
                </li>
                <li className="flex items-center space-x-1.5">
                  <span className="text-emerald-500">✓</span>
                  <span>Full Jira Auto-Populate Webhooks</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
