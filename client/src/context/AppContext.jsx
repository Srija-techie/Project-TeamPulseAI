import { createContext, useContext, useState, useEffect } from "react";
import { io } from "socket.io-client";
import { API_URL } from "../config";

const AppContext = createContext(undefined);

const fetch = (url, options) => {
  const targetUrl = typeof url === "string" && url.startsWith("/api") ? `${API_URL}${url}` : url;
  return window.fetch(targetUrl, options);
};

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("teampulse_token"));
  const [myTeams, setMyTeams] = useState([]);
  const [activeTeam, setActiveTeam] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [standups, setStandups] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [insights, setInsights] = useState([]);
  const [activeDraft, setActiveDraft] = useState(null);
  const [currentView, setCurrentView] = useState("dashboard");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [themeMode, setThemeModeState] = useState(() => {
    return localStorage.getItem("teampulse_theme") || "dark";
  });

  const setThemeMode = (mode) => {
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

  const getHeaders = () => {
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    };
  };

  const triggerToast = (type, message) => {
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

  const loadProfile = async (authToken) => {
    try {
      const res = await fetch("/api/auth/me", {
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (data.success) {
        const userWithSubscription = {
          ...data.data.user,
          subscription: data.data.user.subscription || {
            plan: "Free",
            status: "Active",
            billingCycle: "Monthly"
          }
        };
        setUser(userWithSubscription);
        return userWithSubscription;
      } else {
        logout();
      }
    } catch (e) {
      console.error("Failed to fetch profile:", e);
    }
    return null;
  };

  const login = async (email, password) => {
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

  const loginWithOAuth = async (provider, name, email, avatar) => {
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

  const register = async (name, email, password, role) => {
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
      const membersRes = await fetch(`/api/teams/${activeTeam.id}/members`, { headers: getHeaders() });
      const membersData = await membersRes.json();
      if (membersData.success) {
        setTeamMembers(membersData.data.members);
      }

      const standupsRes = await fetch(`/api/standups/${activeTeam.id}`, { headers: getHeaders() });
      const standupsData = await standupsRes.json();
      if (standupsData.success) {
        setStandups(standupsData.data.standups);
      }

      const draftRes = await fetch(`/api/standups/${activeTeam.id}/draft`, { headers: getHeaders() });
      const draftData = await draftRes.json();
      if (draftData.success) {
        setActiveDraft(draftData.data.draft);
      } else {
        setActiveDraft(null);
      }

      const analyticsRes = await fetch(`/api/standups/${activeTeam.id}/analytics`, { headers: getHeaders() });
      const analyticsData = await analyticsRes.json();
      if (analyticsData.success) {
        setAnalytics(analyticsData.data.analytics);
      }

      const insightsRes = await fetch(`/api/standups/${activeTeam.id}/report`, { headers: getHeaders() });
      const insightsData = await insightsRes.json();
      if (insightsData.success) {
        setInsights(insightsData.data.insights);
      }
    } catch (err) {
      console.error("Failed to sync team database metrics:", err);
    }
  };

  const setActiveTeamById = (id) => {
    const found = myTeams.find(t => t.id === id);
    if (found) {
      setActiveTeam(found);
    }
  };

  const createNewTeam = async (name, questions, standupTime, deadline) => {
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

  const joinTeamByCode = async (inviteCode) => {
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

  const submitDailyStandup = async (yesterday, today, blockers, mood, isDraft, isBlocked, stressLevel) => {
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
    questions,
    standupTime,
    deadline,
    timezone,
    theme,
    emoji,
    weekdays,
    name,
    remindersEnabled,
    slackChannel,
    emailMailingList,
    webhookUrl,
    webhookToken
  ) => {
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

  const deleteTeamWorkspace = async (teamId) => {
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

  const updateMemberRole = async (userId, role) => {
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

  const triggerAICoachReport = async () => {
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

  const updateProfile = async (name, avatar, notificationSettings, timezone) => {
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

  const addComment = async (standupId, text) => {
    try {
      const res = await fetch(`/api/standups/${standupId}/comments`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ text })
      });
      const data = await res.json();
      if (data.success) {
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

  useEffect(() => {
    if (activeTeam && token) {
      refreshActiveTeamData();
    }
  }, [activeTeam, token]);

  useEffect(() => {
    if (!token || !activeTeam) return;

    const interval = setInterval(() => {
      refreshActiveTeamData();
    }, 15000);

    return () => clearInterval(interval);
  }, [activeTeam, token]);

  useEffect(() => {
    if (!token || !activeTeam) return;

    const socket = io(API_URL);

    socket.on("connect", () => {
      console.log("Socket connected! Joining team room:", activeTeam.id);
      socket.emit("join-team", activeTeam.id);
    });

    socket.on("comment_created", (payload) => {
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

  const broadcastEmail = async () => {
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

  const broadcastSlack = async () => {
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
