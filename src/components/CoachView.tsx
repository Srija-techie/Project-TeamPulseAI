import { useState, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext.js";
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  MessageSquare, 
  Trash2, 
  Clipboard, 
  Check, 
  ArrowRight,
  RefreshCw,
  Gauge
} from "lucide-react";
import { getTeamTheme } from "../theme.js";
import { motion, AnimatePresence } from "motion/react";

interface Message {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: Date;
}

// Custom simple parser to render Markdown styling correctly without package bloat
function FormattedCoachResponse({ text }: { text: string }) {
  const lines = text.split("\n");
  
  return (
    <div className="space-y-2 text-sm leading-relaxed text-gray-200">
      {lines.map((line, idx) => {
        // Headers
        if (line.startsWith("### ")) {
          return (
            <h4 key={idx} className="text-base font-bold text-white pt-2 pb-1 font-display tracking-tight border-b border-gray-800/40">
              {line.replace("### ", "")}
            </h4>
          );
        }
        if (line.startsWith("#### ")) {
          return (
            <h5 key={idx} className="text-sm font-bold text-white pt-1.5 pb-0.5 tracking-tight">
              {line.replace("#### ", "")}
            </h5>
          );
        }
        if (line.startsWith("## ")) {
          return (
            <h3 key={idx} className="text-lg font-bold text-white pt-3 pb-1 tracking-tight">
              {line.replace("## ", "")}
            </h3>
          );
        }
        if (line.startsWith("# ")) {
          return (
            <h2 key={idx} className="text-xl font-bold text-white pt-4 pb-2 tracking-tight">
              {line.replace("# ", "")}
            </h2>
          );
        }
        
        // Unordered lists
        if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
          const content = line.trim().substring(2);
          return (
            <div key={idx} className="flex items-start space-x-2 pl-3">
              <span className="text-emerald-500 mt-1.5 select-none text-[8px]">•</span>
              <span key={idx} className="flex-1" dangerouslySetInnerHTML={{ __html: parseBoldItalicCode(content) }} />
            </div>
          );
        }
        
        // Blank line
        if (!line.trim()) {
          return <div key={idx} className="h-2" />;
        }
        
        // Standard paragraph
        return (
          <p key={idx} className="font-sans text-gray-300" dangerouslySetInnerHTML={{ __html: parseBoldItalicCode(line) }} />
        );
      })}
    </div>
  );
}

// Safe formatting parser for inline Markdown tokens
function parseBoldItalicCode(str: string): string {
  let html = str;
  // Escape HTML tags to prevent XSS
  html = html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Bold **word**
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong class='text-white font-semibold'>$1</strong>");
  
  // Italic *word*
  html = html.replace(/\*(.*?)\*/g, "<em class='text-gray-100'>$1</em>");
  
  // Inline code `word`
  html = html.replace(/`(.*?)`/g, "<code class='bg-gray-900 border border-gray-800 px-1 py-0.5 rounded text-rose-400 font-mono text-xs'>$1</code>");

  return html;
}

export default function CoachView() {
  const { activeTeam, token, themeMode } = useApp();
  const theme = getTeamTheme(activeTeam?.settings?.theme);

  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem(`teampulse_chat_${activeTeam?.id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }));
      } catch (err) {
        return [];
      }
    }
    return [];
  });

  const [inputVal, setInputVal] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const endOfMessagesRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll to bottom on new items
  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Persists chat history per workspace team
  useEffect(() => {
    if (activeTeam?.id) {
      localStorage.setItem(`teampulse_chat_${activeTeam.id}`, JSON.stringify(messages));
    }
  }, [messages, activeTeam]);

  // Reset chat if team changes (will pull stored or start fresh)
  useEffect(() => {
    if (activeTeam?.id) {
      const saved = localStorage.getItem(`teampulse_chat_${activeTeam?.id}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setMessages(parsed.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp)
          })));
          return;
        } catch (_) {}
      }
      setMessages([]);
    }
  }, [activeTeam]);

  const handleSendMessage = async (textToSend: string) => {
    const textClean = textToSend.trim();
    if (!textClean || loading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      text: textClean,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputVal("");
    setLoading(true);

    try {
      // Gather raw dialogue logs to feed to backend API
      const historyPayload = messages.map(msg => ({
        role: msg.role,
        text: msg.text
      }));

      const response = await fetch(`/api/standups/${activeTeam?.id}/coach`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          question: textClean,
          chatHistory: historyPayload
        })
      });

      const body = await response.json();
      if (body.success && body.data?.answer) {
        const coachMessage: Message = {
          id: crypto.randomUUID(),
          role: "model",
          text: body.data.answer,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, coachMessage]);
      } else {
        throw new Error(body.message || "Failed to receive response from Sprint Coach");
      }
    } catch (error: any) {
      console.error(error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "model",
        text: `⚠️ **Sprint Coach Error**: ${error.message || "Something went wrong fetching AI coaching analysis. Please verify your internet connection or check back later."}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear your Sprint Coach chat history for this workspace?")) {
      setMessages([]);
      if (activeTeam?.id) {
        localStorage.removeItem(`teampulse_chat_${activeTeam.id}`);
      }
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Pre-determined coaching prompts
  const SUGGESTIONS = [
    { text: "🔍 What blockers have been reported recently?", label: "Recent Blockers" },
    { text: "📈 Analyze team mood trend and stress levels", label: "Sentiment Health" },
    { text: "📊 Provide a summary of completed work", label: "Work Progress" },
    { text: "🎯 Show which member has the best submission streak", label: "Streak Leaders" }
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0c0d10] font-sans">
      {/* Header section panel */}
      <div className="border-b border-gray-800 bg-[#111318]/60 py-4 px-6 md:px-8 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className={`h-10 w-10 rounded-xl ${theme.bgOpacity} border ${theme.borderAccent} flex items-center justify-center`}>
            <Sparkles className={`h-5 w-5 ${theme.textAccent}`} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-white font-display tracking-wide leading-none">
                AI Sprint Coach
              </h2>
              <span className={`text-[9px] uppercase tracking-widest font-mono font-bold px-1.5 py-0.5 rounded-full ${theme.bgOpacity} ${theme.textAccent} border ${theme.borderAccent}`}>
                Gemini 3.5 Active
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Ask questions regarding team trends, blockers, and standup history.
            </p>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="flex items-center space-x-1.5 text-xs text-gray-500 hover:text-red-400 transition-colors py-1.5 px-3 rounded-lg border border-gray-800 hover:border-red-500/20 bg-[#16191f] cursor-pointer"
            title="Clear Chat History"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Reset Dialogue</span>
          </button>
        )}
      </div>

      {/* Main message feed container */}
      <div className="flex-1 overflow-y-auto px-6 md:px-8 py-6 space-y-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-12 flex flex-col items-center justify-center text-center space-y-6"
            >
              <div className={`h-16 w-16 rounded-full bg-gradient-to-tr from-[#111318] to-gray-850 border border-gray-800 flex items-center justify-center shadow-xl`}>
                <Bot className={`h-8 w-8 ${theme.textAccent}`} />
              </div>
              
              <div className="space-y-2 max-w-md">
                <h3 className="text-lg font-bold text-white font-display tracking-wide">
                  Welcome to Sprint Coach!
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed font-sans px-4">
                  I can synthesize standups, spot recurring blockers, map collective psychological metrics, and formulate agile recommendations using your historical workspace files.
                </p>
              </div>

              {/* Sugestion prompt grid */}
              <div className="w-full max-w-xl pt-4">
                <p className="text-[10px] uppercase tracking-widest font-mono text-gray-500 font-bold mb-3">
                  Suggestion Chips
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {SUGGESTIONS.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(s.text)}
                      className="text-left py-3 px-4 rounded-xl border border-gray-850 hover:border-gray-700 bg-[#16191f] hover:bg-gray-850 transition-all text-xs text-white cursor-pointer flex items-center justify-between group shadow-sm font-sans"
                    >
                      <span className="font-medium mr-2 truncate">
                        {s.label}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-gray-500 group-hover:text-white group-hover:translate-x-1.5 transition-all shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {messages.map((msg) => {
                const isCoach = msg.role === "model";
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-start ${isCoach ? "justify-start" : "justify-end"} space-x-3`}
                  >
                    {isCoach && (
                      <div className={`h-8 w-8 rounded-lg ${theme.bgOpacity} border ${theme.borderAccent} flex items-center justify-center shrink-0 mt-0.5`}>
                        <Bot className={`h-4.5 w-4.5 ${theme.textAccent}`} />
                      </div>
                    )}

                    <div className={`max-w-xl rounded-2xl p-4 shadow-sm border font-sans group relative ${
                      isCoach 
                        ? "bg-[#16191f] border-gray-800 text-gray-300"
                        : `${theme.bgOpacity} ${theme.textAccent} border-${theme.primary}/40 text-sm`
                    }`}>
                      {/* Interactive metadata actions hover panel */}
                      {isCoach && (
                        <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1.5 z-10">
                          <button
                            onClick={() => copyToClipboard(msg.text, msg.id)}
                            className="bg-gray-950/80 hover:bg-gray-950 text-gray-400 hover:text-white p-1.5 rounded-lg border border-gray-800/80 transition-all cursor-pointer"
                            title="Copy reply to clipboard"
                          >
                            {copiedId === msg.id ? (
                              <Check className="h-3.5 w-3.5 text-emerald-400" />
                            ) : (
                              <Clipboard className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      )}

                      {/* Msg text */}
                      {isCoach ? (
                        <FormattedCoachResponse text={msg.text} />
                      ) : (
                        <p className="leading-relaxed whitespace-pre-wrap font-sans text-white text-[13px]">
                          {msg.text}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-2.5 pt-1.5 border-t border-gray-800/30">
                        <span className="text-[9px] font-mono text-gray-500 font-medium">
                          {isCoach ? "Sprint Coach AI" : "You (Team Member)"}
                        </span>
                        <span className="text-[9px] font-mono text-gray-500">
                          {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>

                    {!isCoach && (
                      <div className="h-8 w-8 rounded-lg bg-gray-800 border border-gray-750 flex items-center justify-center shrink-0 text-sm mt-0.5">
                        <User className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Prompt Loading Indicators */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-start space-x-3"
            >
              <div className={`h-8 w-8 rounded-lg ${theme.bgOpacity} border ${theme.borderAccent} flex items-center justify-center shrink-0 mt-0.5 animate-spin`}>
                <RefreshCw className={`h-4.5 w-4.5 ${theme.textAccent}`} />
              </div>
              <div className="bg-[#16191f] border border-gray-800 rounded-2xl p-4 text-gray-400 space-y-2 max-w-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-medium font-sans animate-pulse">Running Agile Analytics...</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className={`h-1.5 w-8 rounded-full ${theme.bgAccent}/30 overflow-hidden`}>
                    <div className={`h-full w-4 ${theme.bgAccent} animate-infinite-slide`} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={endOfMessagesRef} />
        </div>
      </div>

      {/* Input controls block */}
      <div className="border-t border-gray-800 bg-[#111318]/40 p-4 md:p-6 shrink-0">
        <div className="max-w-4xl mx-auto space-y-3">
          {/* Quick chip responses at input row */}
          {messages.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none select-none">
              <span className="text-[9px] uppercase font-mono text-gray-500 font-bold shrink-0">Follow ups:</span>
              <button
                onClick={() => handleSendMessage("Are any blockers critical enough to pause our goals?")}
                className="bg-[#16191f] border border-gray-850 hover:border-gray-700 hover:bg-gray-850 transition-colors text-[10px] font-sans font-medium text-white px-2.5 py-1 rounded-full cursor-pointer shrink-0"
              >
                Critical Blockers?
              </button>
              <button
                onClick={() => handleSendMessage("Recommend key actions for the Manager today")}
                className="bg-[#16191f] border border-gray-850 hover:border-gray-700 hover:bg-gray-850 transition-colors text-[10px] font-sans font-medium text-white px-2.5 py-1 rounded-full cursor-pointer shrink-0"
              >
                Manager Action Items
              </button>
              <button
                onClick={() => handleSendMessage("How is our general participation rates looking?")}
                className="bg-[#16191f] border border-gray-850 hover:border-gray-700 hover:bg-gray-850 transition-colors text-[10px] font-sans font-medium text-white px-2.5 py-1 rounded-full cursor-pointer shrink-0"
              >
                Participation Stats
              </button>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputVal);
            }}
            className="flex items-center space-x-3 w-full"
          >
            <input
              id="coach-user-input"
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Ask Sprint Coach a question about the team stands or logs..."
              disabled={loading}
              className="flex-1 bg-[#0c0d10] text-sm text-white placeholder-gray-500 border border-gray-800 focus:border-emerald-500 rounded-xl px-4 py-3 focus:outline-none transition-colors"
            />
            <button
              id="coach-send-btn"
              type="submit"
              disabled={loading || !inputVal.trim()}
              className={`p-3 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                loading || !inputVal.trim()
                  ? "bg-gray-800 text-gray-650 cursor-not-allowed"
                  : `${theme.bgAccent} hover:bg-opacity-90 text-white shadow-lg cursor-pointer transform hover:scale-105`
              }`}
            >
              <Send className="h-4.5 w-4.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
