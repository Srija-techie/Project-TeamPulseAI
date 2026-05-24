import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { io } from "socket.io-client";

export interface UserContext {
  id: string;
  email: string;
  name: string;
  role: "Admin" | "Manager" | "Member";
  streak: number;
  badges: string[];
  teams: string[];
  avatar?: string;
  timezone?: string;
  notificationSettings?: {
    emailDigest: boolean;
    slackWebhookAlerts: boolean;
    dailyReminders: boolean;
  };
}

export interface Team {
  id: string;
  name: string;
  inviteCode: string;
  ownerId: string;
  settings: {
    questions: string[];
    standupTime: string;
    timezone: string;
    deadline: string;
    theme?: string;
    emoji?: string;
    weekdays?: string[];
    remindersEnabled?: boolean;
    slackChannel?: string;
    emailMailingList?: string;
    webhookUrl?: string;
    webhookToken?: string;
  };
  vacationUsers: string[];
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  timestamp: string;
}

export interface Standup {
  id: string;
  userId: string;
  userName: string;
  teamId: string;
  date: string;
  timestamp: string;
  yesterday: string;
  today: string;
  blockers: string;
  mood: "excellent" | "good" | "neutral" | "unhappy" | "stressed";
  isDraft: boolean;
  aiSummary?: string;
  aiBlockers?: string[];
  aiActionItems?: string[];
  aiMoodScore?: number;
  userAvatar?: string;
  comments?: Comment[];
  isBlocked?: boolean;
  stressLevel?: number;
}

export interface TeamInsight {
  id: string;
  teamId: string;
  date: string;
  healthScore: number;
  summary: string;
  actionItems: string[];
  blockerFrequency: { [key: string]: number };
  moodTrend: string;
}

export interface TeamAnalytics {
  totalMembers: number;
  submittedTodayCount: number;
  participationRate: number;
  averageMoodScore: number;
  totalBlockersCurrent: number;
  leaderboard: { id: string; name: string; streak: number; badges: string[] }[];
  last7DaysSubmissionsCount: number;
}

interface AppContextType {
  user: UserContext | null;
  token: string | null;
  myTeams: Team[];
  activeTeam: Team | null;
  teamMembers: any[];
  standups: Standup[];
  analytics: TeamAnalytics | null;
  insights: TeamInsight[];
  activeDraft: Standup | null;
  currentView: string;
  loading: boolean;
  errorMsg: string | null;
  successMsg: string | null;
  themeMode: "dark" | "light";
  
  setView: (view: string) => void;
  setActiveTeamById: (id: string) => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role: string) => Promise<boolean>;
  loginWithOAuth: (provider: "google" | "microsoft", name: string, email: string, avatar: string) => Promise<boolean>;
  logout: () => void;
  clearToast: () => void;
  createNewTeam: (name: string, questions: string[], standupTime: string, deadline: string) => Promise<boolean>;
  joinTeamByCode: (inviteCode: string) => Promise<boolean>;
  submitDailyStandup: (
    yesterday: string, 
    today: string, 
    blockers: string, 
    mood: "excellent" | "good" | "neutral" | "unhappy" | "stressed", 
    isDraft: boolean,
    isBlocked?: boolean,
    stressLevel?: number
  ) => Promise<boolean>;
  toggleVacationOOO: () => Promise<void>;
  updateSchedule: (
    questions: string[], 
    standupTime: string, 
    deadline: string, 
    timezone: string, 
    theme?: string, 
    emoji?: string, 
    weekdays?: string[], 
    name?: string,
    remindersEnabled?: boolean,
    slackChannel?: string,
    emailMailingList?: string,
    webhookUrl?: string,
    webhookToken?: string
  ) => Promise<boolean>;
  deleteTeamWorkspace: (teamId: string) => Promise<boolean>;
  triggerAICoachReport: () => Promise<boolean>;
  refreshActiveTeamData: () => Promise<void>;
  updateProfile: (name: string, avatar: string, notificationSettings: { emailDigest: boolean; slackWebhookAlerts: boolean; dailyReminders: boolean }, timezone?: string) => Promise<boolean>;
  addComment: (standupId: string, text: string) => Promise<boolean>;
  updateMemberRole: (userId: string, role: string) => Promise<boolean>;
  setThemeMode: (mode: "dark" | "light") => void;
  broadcastEmail: () => Promise<any>;
  broadcastSlack: () => Promise<any>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserContext | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("teampulse_token"));
  const [myTeams, setMyTeams] = useState<Team[]>([]);
  const [activeTeam, setActiveTeam] = useState<Team | null>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [standups, setStandups] = useState<Standup[]>([]);
  const [analytics, setAnalytics] = useState<TeamAnalytics | null>(null);
  const [insights, setInsights] = useState<TeamInsight[]>([]);
  const [activeDraft, setActiveDraft] = useState<Standup | null>(null);
  const [currentView, setCurrentView] = useState<string>("dashboard");
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [themeMode, setThemeModeState] = useState<"dark" | "light">(() => {
    return (localStorage.getItem("teampulse_theme") as "dark" | "light") || "dark";
  });

  const setThemeMode = (mode: "dark" | "light") => {
    setThemeModeState(mode);
    localStorage.setItem("teampulse_theme", mode);
  };

  useEffect(() => {
    if (themeMode === "light") {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    }
  }, [themeMode]);

  // Synchronize dynamic headers
  const getHeaders = () => {
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    };
  };

  const triggerToast = (type: "success" | "error", message: string) => {
    if (type === "success") {
      setSuccessMsg(message);
      setErrorMsg(null);
    } else {
      setErrorMsg(message);
      setSuccessMsg(null);
    }
    setTimeout(() => {
      clearToast();
    }, 4500);
  };

  const clearToast = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const logout = () => {
    localStorage.removeItem("teampulse_token");
    setToken(null);
    setUser(null);
    setMyTeams([]);
    setActiveTeam(null);
    setTeamMembers([]);
    setStandups([]);
    setAnalytics(null);
    setInsights([]);
    setActiveDraft(null);
    setCurrentView("dashboard");
    triggerToast("success", "Logged out securely");
  };

  // Profile loaders
  const loadProfile = async (authToken: string) => {
    try {
      const res = await fetch("/api/auth/me", {
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.data.user);
        return data.data.user;
      } else {
        logout();
      }
    } catch (e) {
      console.error("Failed to fetch profile:", e);
    }
    return null;
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("teampulse_token", data.data.token);
        setToken(data.data.token);
        setUser(data.data.user);
        triggerToast("success", "Welcome back to TeamPulseAI!");
        setLoading(false);
        return true;
      } else {
        triggerToast("error", data.message || "Failed to log in");
        setLoading(false);
        return false;
      }
    } catch (e) {
      triggerToast("error", "Unable to connect to service registry");
      setLoading(false);
      return false;
    }
  };

  const loginWithOAuth = async (provider: "google" | "microsoft", name: string, email: string, avatar: string): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/oauth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, name, email, avatar })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("teampulse_token", data.data.token);
        setToken(data.data.token);
        setUser(data.data.user);
        triggerToast("success", data.message);
        setLoading(false);
        return true;
      } else {
        triggerToast("error", data.message || "OAuth handshake failed");
        setLoading(false);
        return false;
      }
    } catch (err) {
      triggerToast("error", "OAuth authorization service offline");
      setLoading(false);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string, role: string): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("teampulse_token", data.data.token);
        setToken(data.data.token);
        setUser(data.data.user);
        triggerToast("success", "Account bootstrapped successfully!");
        setLoading(false);
        return true;
      } else {
        triggerToast("error", data.message || "Bootstrapping failed");
        setLoading(false);
        return false;
      }
    } catch (e) {
      triggerToast("error", "Failed to contact database registry");
      setLoading(false);
      return false;
    }
  };

  // Load team specifics
  const loadTeams = async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/teams", { headers: getHeaders() });
      const data = await res.json();
      if (data.success) {
        setMyTeams(data.data.teams);
        if (data.data.teams.length > 0 && !activeTeam) {
          setActiveTeam(data.data.teams[0]);
        }
      }
    } catch (e) {
      console.error("Failed to load teams:", e);
    }
  };

  const refreshActiveTeamData = async () => {
    if (!token || !activeTeam) return;
    try {
      // Load members
      const membersRes = await fetch(`/api/teams/${activeTeam.id}/members`, { headers: getHeaders() });
      const membersData = await membersRes.json();
      if (membersData.success) {
        setTeamMembers(membersData.data.members);
      }

      // Load submissions
      const standupsRes = await fetch(`/api/standups/${activeTeam.id}`, { headers: getHeaders() });
      const standupsData = await standupsRes.json();
      if (standupsData.success) {
        setStandups(standupsData.data.standups);
      }

      // Load draft
      const draftRes = await fetch(`/api/standups/${activeTeam.id}/draft`, { headers: getHeaders() });
      const draftData = await draftRes.json();
      if (draftData.success) {
        setActiveDraft(draftData.data.draft);
      } else {
        setActiveDraft(null);
      }

      // Load analytics telemetry
      const analyticsRes = await fetch(`/api/standups/${activeTeam.id}/analytics`, { headers: getHeaders() });
      const analyticsData = await analyticsRes.json();
      if (analyticsData.success) {
        setAnalytics(analyticsData.data.analytics);
      }

      // Load AI reports list
      const insightsRes = await fetch(`/api/standups/${activeTeam.id}/report`, { headers: getHeaders() });
      const insightsData = await insightsRes.json();
      if (insightsData.success) {
        setInsights(insightsData.data.insights);
      }
    } catch (err) {
      console.error("Failed to sync team database metrics:", err);
    }
  };

  const setActiveTeamById = (id: string) => {
    const found = myTeams.find(t => t.id === id);
    if (found) {
      setActiveTeam(found);
    }
  };

  const createNewTeam = async (name: string, questions: string[], standupTime: string, deadline: string): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ name, questions, standupTime, deadline })
      });
      const data = await res.json();
      if (data.success) {
        const team = data.data.team;
        setMyTeams(prev => [...prev, team]);
        setActiveTeam(team);
        triggerToast("success", `Team "${name}" successfully registered!`);
        setLoading(false);
        return true;
      } else {
        triggerToast("error", data.message || "Failed to initialize team");
        setLoading(false);
        return false;
      }
    } catch (e) {
      triggerToast("error", "Failed to communicate with SaaS controller");
      setLoading(false);
      return false;
    }
  };

  const joinTeamByCode = async (inviteCode: string): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch("/api/teams/join", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ inviteCode })
      });
      const data = await res.json();
      if (data.success) {
        const team = data.data.team;
        setMyTeams(prev => [...prev, team]);
        setActiveTeam(team);
        triggerToast("success", `Successfully linked with team "${team.name}"`);
        setLoading(false);
        return true;
      } else {
        triggerToast("error", data.message || "Failed to join team");
        setLoading(false);
        return false;
      }
    } catch (e) {
      triggerToast("error", "Invitation server offline");
      setLoading(false);
      return false;
    }
  };

  const submitDailyStandup = async (
    yesterday: string, 
    today: string, 
    blockers: string, 
    mood: any, 
    isDraft: boolean,
    isBlocked?: boolean,
    stressLevel?: number
  ): Promise<boolean> => {
    if (!activeTeam) {
      triggerToast("error", "Please register or select a team first");
      return false;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/standups", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          teamId: activeTeam.id,
          yesterday,
          today,
          blockers,
          mood,
          isDraft,
          isBlocked: !!isBlocked,
          stressLevel: stressLevel !== undefined ? stressLevel : 3
        })
      });
      const data = await res.json();
      if (data.success) {
        triggerToast("success", data.message);
        
        // Refresh session profile to update streak counter
        if (token) {
          await loadProfile(token);
        }
        await refreshActiveTeamData();
        setLoading(false);
        return true;
      } else {
        triggerToast("error", data.message || "Submission failed");
        setLoading(false);
        return false;
      }
    } catch (e) {
      triggerToast("error", "Standard telemetry connection disrupted");
      setLoading(false);
      return false;
    }
  };

  const toggleVacationOOO = async () => {
    if (!activeTeam) return;
    try {
      const res = await fetch(`/api/teams/${activeTeam.id}/vacation`, {
        method: "POST",
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success) {
        triggerToast("success", data.message);
        await refreshActiveTeamData();
      }
    } catch (e) {
      triggerToast("error", "Failed to update OOO registry");
    }
  };

  const updateSchedule = async (
    questions: string[],
    standupTime: string,
    deadline: string,
    timezone: string,
    theme?: string,
    emoji?: string,
    weekdays?: string[],
    name?: string,
    remindersEnabled?: boolean,
    slackChannel?: string,
    emailMailingList?: string,
    webhookUrl?: string,
    webhookToken?: string
  ): Promise<boolean> => {
    if (!activeTeam) return false;
    setLoading(true);
    try {
      const res = await fetch(`/api/teams/${activeTeam.id}/settings`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ 
          name, 
          questions, 
          standupTime, 
          deadline, 
          timezone, 
          theme, 
          emoji, 
          weekdays,
          remindersEnabled,
          slackChannel,
          emailMailingList,
          webhookUrl,
          webhookToken
        })
      });
      const data = await res.json();
      if (data.success) {
        const updated = data.data.team;
        setMyTeams(prev => prev.map(t => t.id === updated.id ? updated : t));
        setActiveTeam(updated);
        triggerToast("success", "Team scheduling updated successfully!");
        setLoading(false);
        return true;
      } else {
        triggerToast("error", data.message || "Failed to update scheduler");
        setLoading(false);
        return false;
      }
    } catch (e) {
      triggerToast("error", "Scheduler API offline");
      setLoading(false);
      return false;
    }
  };

  const deleteTeamWorkspace = async (teamId: string): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch(`/api/teams/${teamId}`, {
        method: "DELETE",
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success) {
        triggerToast("success", data.message || "Workspace purged completely.");
        const filteredTeams = myTeams.filter(t => t.id !== teamId);
        setMyTeams(filteredTeams);
        if (filteredTeams.length > 0) {
          setActiveTeam(filteredTeams[0]);
        } else {
          setActiveTeam(null);
        }
        setCurrentView("dashboard");
        setLoading(false);
        return true;
      } else {
        triggerToast("error", data.message || "Purge execution failed");
        setLoading(false);
        return false;
      }
    } catch (error) {
      triggerToast("error", "Purging service unreachable");
      setLoading(false);
      return false;
    }
  };

  const updateMemberRole = async (userId: string, role: string): Promise<boolean> => {
    if (!activeTeam) return false;
    setLoading(true);
    try {
      const res = await fetch(`/api/teams/${activeTeam.id}/members/${userId}/role`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ role })
      });
      const data = await res.json();
      if (data.success) {
        triggerToast("success", data.message);
        await refreshActiveTeamData();
        setLoading(false);
        return true;
      } else {
        triggerToast("error", data.message || "Failed to elevate user role");
        setLoading(false);
        return false;
      }
    } catch (error) {
      triggerToast("error", "Role designation service offline");
      setLoading(false);
      return false;
    }
  };

  const triggerAICoachReport = async (): Promise<boolean> => {
    if (!activeTeam) return false;
    setLoading(true);
    try {
      const res = await fetch(`/api/teams/${activeTeam.id}/report`, {
        method: "POST",
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success) {
        triggerToast("success", "Gemini Team Intelligence parsed successfully!");
        await refreshActiveTeamData();
        setLoading(false);
        return true;
      } else {
        triggerToast("error", data.message || "AI calculation failed");
        setLoading(false);
        return false;
      }
    } catch (e) {
      triggerToast("error", "AI service unreachable");
      setLoading(false);
      return false;
    }
  };

  // Profile bootstrapper
  const updateProfile = async (
    name: string,
    avatar: string,
    notificationSettings: { emailDigest: boolean; slackWebhookAlerts: boolean; dailyReminders: boolean },
    timezone?: string
  ): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ name, avatar, notificationSettings, timezone })
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.data.user);
        triggerToast("success", "Profile metadata updated successfully!");
        setLoading(false);
        if (activeTeam) {
          refreshActiveTeamData();
        }
        return true;
      } else {
        triggerToast("error", data.message || "Failed to update profile details");
        setLoading(false);
        return false;
      }
    } catch (e) {
      triggerToast("error", "Profile update server offline");
      setLoading(false);
      return false;
    }
  };

  const addComment = async (standupId: string, text: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/standups/${standupId}/comments`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ text })
      });
      const data = await res.json();
      if (data.success) {
        // Locally append immediately
        setStandups(prev => prev.map(s => {
          if (s.id === standupId) {
            const comments = s.comments || [];
            if (comments.some(c => c.id === data.data.comment.id)) return s;
            return {
              ...s,
              comments: [...comments, data.data.comment]
            };
          }
          return s;
        }));
        return true;
      } else {
        triggerToast("error", data.message || "Failed to append comment");
        return false;
      }
    } catch (e) {
      triggerToast("error", "Comment posting request offline");
      return false;
    }
  };

  useEffect(() => {
    const initBoot = async () => {
      if (token) {
        const loadedUser = await loadProfile(token);
        if (loadedUser) {
          await loadTeams();
        }
      }
    };
    initBoot();
  }, [token]);

  // Sync team configurations on shift
  useEffect(() => {
    if (activeTeam && token) {
      refreshActiveTeamData();
    }
  }, [activeTeam, token]);

  // Real-time syncing (short-polling simulating live Socket.IO feed safely)
  useEffect(() => {
    if (!token || !activeTeam) return;

    const interval = setInterval(() => {
      refreshActiveTeamData();
    }, 15000); // Polling optimized to 15s to reduce overhead, as comments are synced via real-time websockets

    return () => clearInterval(interval);
  }, [activeTeam, token]);

  // Socket.IO event listener for real-time comments
  useEffect(() => {
    if (!token || !activeTeam) return;

    const socket = io();

    socket.on("connect", () => {
      console.log("Socket connected! Joining team room:", activeTeam.id);
      socket.emit("join-team", activeTeam.id);
    });

    socket.on("comment_created", (payload: { standupId: string; comment: Comment }) => {
      console.log("Real-time comment received from SocketServer:", payload);
      setStandups(prev => prev.map(s => {
        if (s.id === payload.standupId) {
          const comments = s.comments || [];
          if (comments.some(c => c.id === payload.comment.id)) return s;
          return {
            ...s,
            comments: [...comments, payload.comment]
          };
        }
        return s;
      }));
    });

    return () => {
      socket.disconnect();
    };
  }, [activeTeam?.id, token]);

  const broadcastEmail = async (): Promise<any> => {
    if (!activeTeam) return { success: false, message: "Workspace active target missing" };
    try {
      const res = await fetch(`/api/teams/${activeTeam.id}/broadcast/email`, {
        method: "POST",
        headers: getHeaders()
      });
      const data = await res.json();
      if (data.success) {
        triggerToast("success", "Email report compiled and dispatched successfully!");
      } else {
        triggerToast("error", data.message || "Failed email broadcast");
      }
      return data;
    } catch (e) {
      triggerToast("error", "Failed dispatching email");
      return { success: false };
    }
  };

  const broadcastSlack = async (): Promise<any> => {
     if (!activeTeam) return { success: false, message: "Workspace active target missing" };
     try {
       const res = await fetch(`/api/teams/${activeTeam.id}/broadcast/slack`, {
         method: "POST",
         headers: getHeaders()
       });
       const data = await res.json();
       if (data.success) {
         triggerToast("success", "Slack channel notification posted successfully!");
       } else {
          triggerToast("error", data.message || "Failed slack webhook execution");
       }
       return data;
     } catch (e) {
       triggerToast("error", "Error posting to Slack channel");
       return { success: false };
     }
  };

  return (
    <AppContext.Provider value={{
      user,
      token,
      myTeams,
      activeTeam,
      teamMembers,
      standups,
      analytics,
      insights,
      activeDraft,
      currentView,
      loading,
      errorMsg,
      successMsg,
      setView: setCurrentView,
      setActiveTeamById,
      login,
      register,
      logout,
      clearToast,
      createNewTeam,
      joinTeamByCode,
      submitDailyStandup,
      toggleVacationOOO,
      updateSchedule,
      deleteTeamWorkspace,
      loginWithOAuth,
      triggerAICoachReport,
      refreshActiveTeamData,
      updateProfile,
      addComment,
      updateMemberRole,
      themeMode,
      setThemeMode,
      broadcastEmail,
      broadcastSlack
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used inside an AppProvider");
  }
  return context;
}
