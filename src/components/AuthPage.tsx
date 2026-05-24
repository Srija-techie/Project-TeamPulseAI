import React, { useState } from "react";
import { useApp } from "../context/AppContext.js";
import { KeyRound, Mail, User, ShieldAlert, Sparkles, LogIn, UserPlus } from "lucide-react";

export default function AuthPage() {
  const { login, register, loginWithOAuth, loading } = useApp();
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [role, setRole] = useState<string>("Member");
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!email || !password) {
      setValidationError("Please fill out all required fields.");
      return;
    }

    if (!isLogin && !name) {
      setValidationError("Please specify your name.");
      return;
    }

    if (password.length < 5) {
      setValidationError("Password must contain at least 5 character credentials.");
      return;
    }

    if (isLogin) {
      await login(email, password);
    } else {
      await register(name, email, password, role);
    }
  };

  const handleOAuthLogin = async (provider: "google" | "microsoft") => {
    setValidationError(null);
    const defaultEmail = provider === "google" ? "alex.dev@google.com" : "sarah.lead@microsoft.com";
    const defaultName = provider === "google" ? "Alex Rivera (Google)" : "Sarah Chen (Microsoft)";
    const defaultAvatar = provider === "google" ? "🤖" : "👾";

    const emailInput = prompt(`Authorized ${provider === "google" ? "Google Workspaces" : "Microsoft 365"} SSO:\nEnter your organizational email:`, defaultEmail);
    if (emailInput === null) return;
    
    if (!emailInput.trim() || !emailInput.includes("@")) {
      setValidationError("A valid organizational email is required for Workspace authorization.");
      return;
    }

    const nameInput = prompt(`Enter screen name for workspace profile:`, defaultName);
    if (!nameInput || !nameInput.trim()) return;

    await loginWithOAuth(provider, nameInput.trim(), emailInput.trim(), defaultAvatar);
  };

  return (
    <div className="min-h-screen bg-[#0c0d10] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      <div className="absolute top-6 left-6 flex items-center space-x-2">
        <div className="bg-emerald-500/10 p-2 rounded-xl text-emerald-400 border border-emerald-500/20">
          <Sparkles className="h-5 w-5" />
        </div>
        <span className="font-sans font-bold text-xl text-white tracking-tight">TeamPulseAI</span>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-sans font-bold text-white tracking-tight">
          {isLogin ? "Sign in to TeamPulse" : "Create your account"}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          Or{" "}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setValidationError(null);
            }}
            className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors focus:outline-none cursor-pointer"
          >
            {isLogin ? "register a new team workspace" : "sign in to existing workspace"}
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#16191f] py-8 px-4 shadow-xl rounded-2xl sm:px-10 border border-gray-800">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {validationError && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-start space-x-2.5">
                <ShieldAlert className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <span className="text-xs text-amber-300 font-sans leading-normal">{validationError}</span>
              </div>
            )}

            {!isLogin && (
              <div>
                <label className="block text-xs font-bold text-gray-400 font-sans uppercase tracking-wider mb-2">Human Full Name</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-800 bg-[#0c0d10] text-gray-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 text-sm placeholder-gray-650 font-sans"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-400 font-sans uppercase tracking-wider mb-2">Business Email address</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-800 bg-[#0c0d10] text-gray-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 text-sm placeholder-gray-650 font-sans"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 font-sans uppercase tracking-wider mb-2">Account Password</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-800 bg-[#0c0d10] text-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 text-sm placeholder-gray-650 font-sans"
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-xs font-bold text-gray-400 font-sans uppercase tracking-wider mb-2">Desired Profile Role</label>
                <div className="mt-1 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole("Member")}
                    className={`py-3 px-4 border rounded-xl text-center text-xs font-mono uppercase tracking-wider font-bold transition-all cursor-pointer ${
                      role === "Member"
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold"
                        : "border-gray-800 bg-[#0c0d10] hover:border-gray-700 text-gray-400"
                    }`}
                  >
                    🚀 Team Member
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("Manager")}
                    className={`py-3 px-4 border rounded-xl text-center text-xs font-mono uppercase tracking-wider font-bold transition-all cursor-pointer ${
                      role === "Manager"
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold"
                        : "border-gray-800 bg-[#0c0d10] hover:border-gray-700 text-gray-400"
                    }`}
                  >
                    👑 Team Manager
                  </button>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-emerald-950/25 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 focus:outline-none transition-all disabled:opacity-50 cursor-pointer font-sans"
              >
                {loading ? (
                  <span className="flex items-center space-x-1.5 animate-pulse">
                    <span>Synchronizing session...</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-1.5">
                    {isLogin ? (
                      <>
                        <LogIn className="h-4 w-5" />
                        <span>Sign In Securely</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-5" />
                        <span>Create Account</span>
                      </>
                    )}
                  </span>
                )}
              </button>
            </div>

            {/* OAuth Dividers & Buttons */}
            <div className="relative my-4 flex py-1 items-center">
              <div className="flex-grow border-t border-gray-800"></div>
              <span className="flex-shrink mx-4 text-[10px] font-mono tracking-wider font-bold text-gray-500 uppercase leading-none">Or Single Sign-On</span>
              <div className="flex-grow border-t border-gray-800"></div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleOAuthLogin("google")}
                disabled={loading}
                className="py-2.5 px-3 border border-gray-800 bg-[#0c0d10] hover:border-gray-700 hover:bg-gray-900 rounded-xl text-center text-[11px] font-semibold text-gray-300 transition-all cursor-pointer flex items-center justify-center space-x-2"
              >
                <span className="text-sm">🌐</span>
                <span>Google SSO</span>
              </button>
              
              <button
                type="button"
                onClick={() => handleOAuthLogin("microsoft")}
                disabled={loading}
                className="py-2.5 px-3 border border-gray-800 bg-[#0c0d10] hover:border-gray-700 hover:bg-gray-900 rounded-xl text-center text-[11px] font-semibold text-gray-300 transition-all cursor-pointer flex items-center justify-center space-x-2"
              >
                <span className="text-sm">❖</span>
                <span>Microsoft SSO</span>
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-gray-850 pt-6">
            <h4 className="text-[10px] font-bold text-gray-500 tracking-wider uppercase font-mono mb-3 text-center">
              TeamPulseAI core capabilities
            </h4>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-[#0c0d10] border border-gray-850 rounded-lg">
                <p className="text-[9px] font-bold text-gray-300 font-sans">⚡ 10-Sec Standups</p>
              </div>
              <div className="p-2 bg-[#0c0d10] border border-gray-850 rounded-lg">
                <p className="text-[9px] font-bold text-gray-300 font-sans">🧠 AI Health Coach</p>
              </div>
              <div className="p-2 bg-[#0c0d10] border border-gray-850 rounded-lg">
                <p className="text-[9px] font-bold text-gray-300 font-sans">🔥 Streaks & Badges</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
