import { useApp } from "../context/AppContext.js";
import { 
  FileText, 
  Sparkles, 
  Download, 
  Calendar, 
  TrendingUp, 
  CheckCircle2, 
  Activity, 
  Smile, 
  HelpCircle,
  Clock
} from "lucide-react";
import { useState } from "react";
import { jsPDF } from "jspdf";

export default function ReportsView() {
  const { activeTeam, insights, standups, loading, triggerAICoachReport } = useApp();
  const [exporting, setExporting] = useState<boolean>(false);
  const [exportingPDF, setExportingPDF] = useState<boolean>(false);

  if (!activeTeam) {
    return (
      <div className="flex-1 p-8 flex justify-center items-center bg-[#0c0d10]">
        <div className="text-center p-8 max-w-lg bg-[#16191f] border border-gray-800 shadow-xl rounded-2xl">
          <FileText className="h-12 w-12 text-gray-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white font-sans">No Active Workspace</h3>
          <p className="text-sm text-gray-400 font-sans mt-1">
            Build your space first to access the AI intelligence reports.
          </p>
        </div>
      </div>
    );
  }

  // Handle triggered AI insights
  const handleTriggerAI = async () => {
    await triggerAICoachReport();
  };

  // Build professional clean PDF report using jsPDF
  const handleExportPDF = () => {
    if (standups.length === 0 && insights.length === 0) {
      alert("No workspace standups or AI digests recorded yet to perform exports.");
      return;
    }
    setExportingPDF(true);

    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      let y = 30; // starting vertical cursor position for content (after retrospective running headers)

      // Title Section (Document Cover / Main Header Area)
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(15, 23, 42); // slate-900 (#0f172a)
      doc.text("Workspace Sprint Report", 20, y);
      y += 8;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(16, 185, 129); // emerald-500 (#10b981)
      doc.text(`Team: ${activeTeam.name}`, 20, y);
      y += 10;

      // Overview box dimensions
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.setFillColor(248, 250, 252); // slate-50
      doc.rect(20, y, 170, 30, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text("WORKSPACE RUNTIME SUMMARY DATA", 25, y + 8);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105); // slate-600
      doc.text(`• Total Daily Standup Submissions: ${standups.length}`, 25, y + 15);
      doc.text(`• Overall AI Sprint Health Reports: ${insights.length}`, 25, y + 21);

      const latestStandup = standups[0];
      if (latestStandup) {
        doc.text(`• Most Recent Submission: ${latestStandup.userName} on ${latestStandup.date}`, 25, y + 27);
      } else {
        doc.text(`• Most Recent Submission: No activity logged yet`, 25, y + 27);
      }

      y += 38;

      // --- SECTION 1: AI COOPERATIVE INSIGHTS ---
      if (insights.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.setTextColor(15, 23, 42);
        doc.text("1. Historical AI Sprint Digests", 20, y);
        y += 6;

        insights.forEach((ins) => {
          // Check page boundary
          if (y > 230) {
            doc.addPage();
            y = 25;
          }

          // Header line of insight digest card block
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.setTextColor(16, 185, 129); // emerald-600
          doc.text(`Digest Report - ${ins.date} (Health Code Score: ${ins.healthScore}/100)`, 20, y);
          y += 5;

          // Horizontal light helper bar
          doc.setDrawColor(241, 245, 249);
          doc.setLineWidth(0.4);
          doc.line(20, y, 190, y);
          y += 5;

          // Trajectory wrap
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8.5);
          doc.setTextColor(71, 85, 105);
          doc.text("STRATEGIC WORKSPACE TRAJECTORY SUMMARY:", 20, y);
          y += 4.5;

          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(15, 23, 42);
          const rawSummaryLines: string[] = doc.splitTextToSize(ins.summary, 170);
          rawSummaryLines.forEach((line) => {
            if (y > 270) {
              doc.addPage();
              y = 25;
            }
            doc.text(line, 20, y);
            y += 4.5;
          });
          y += 3;

          // Action items
          if (ins.actionItems && ins.actionItems.length > 0) {
            if (y > 255) {
              doc.addPage();
              y = 25;
            }
            doc.setFont("helvetica", "bold");
            doc.setFontSize(8.5);
            doc.setTextColor(71, 85, 105);
            doc.text("TARGET SCRUM CORRECTIVE ACTIONS:", 20, y);
            y += 5;

            ins.actionItems.forEach((act) => {
              if (y > 270) {
                doc.addPage();
                y = 25;
              }
              doc.setFont("helvetica", "normal");
              doc.setFontSize(9);
              doc.setTextColor(15, 23, 42);
              
              const bulletText = `• ${act}`;
              const splitBullet: string[] = doc.splitTextToSize(bulletText, 165);
              splitBullet.forEach((bulletLine, idx) => {
                if (idx === 0) {
                  doc.text(bulletLine, 22, y);
                } else {
                  doc.text(bulletLine, 25, y); // indent line wrap
                }
                y += 4.5;
              });
            });
            y += 2;
          }

          // Trend and Blockers
          if (y > 255) {
            doc.addPage();
            y = 25;
          }
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8.5);
          doc.setTextColor(71, 85, 105);
          doc.text("PSYCHOLOGICAL SAFETY TRENDS:", 20, y);
          
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9);
          doc.setTextColor(15, 23, 42);
          doc.text(ins.moodTrend || "Stable environment indicators", 73, y);
          y += 6;

          // Blocker Group Keywords
          if (y > 255) {
            doc.addPage();
            y = 25;
          }
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8.5);
          doc.setTextColor(71, 85, 105);
          doc.text("IDENTIFIED SPRINT DELAY BLOCKERS:", 20, y);
          
          const blockerKeys = Object.entries(ins.blockerFrequency)
            .map(([word, freq]) => `${word} (${freq})`)
            .join(", ");
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(15, 23, 42);
          const wrappedBlockers: string[] = doc.splitTextToSize(blockerKeys || "No severe structural delays reported", 110);
          wrappedBlockers.forEach((bLine, bIdx) => {
            doc.text(bLine, 80, y + (bIdx * 4.5));
          });
          y += Math.max(8, (wrappedBlockers.length * 4.5) + 3);

          // Divider spacing
          y += 3;
        });
      }

      // --- SECTION 2: STANDUPS REGISTRY LOGS ---
      if (standups.length > 0) {
        if (y > 240) {
          doc.addPage();
          y = 25;
        } else {
          y += 6;
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.setTextColor(15, 23, 42);
        doc.text("2. Workspace Standup registries", 20, y);
        y += 8;

        standups.forEach((s) => {
          if (y > 240) {
            doc.addPage();
            y = 25;
          }

          // Record title bar header in a clean visual block format
          doc.setFillColor(248, 250, 252); // light background slug
          doc.rect(20, y, 170, 7, "F");
          
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9.5);
          doc.setTextColor(15, 23, 42);
          doc.text(`${s.userName}   |   ${s.date}`, 23, y + 5);

          // Mood badge
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8);
          doc.setTextColor(16, 185, 129); // green
          doc.text(`Mood: ${s.mood.toUpperCase()}`, 180, y + 5, { align: "right" });
          y += 11;

          // Yesterday's accomplishment wrap
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8.5);
          doc.setTextColor(71, 85, 105);
          doc.text("Yesterday's Completed Work:", 20, y);
          y += 4.5;

          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(15, 23, 42);
          const rawYesterday: string[] = doc.splitTextToSize(s.yesterday || "None", 165);
          rawYesterday.forEach((line) => {
            if (y > 270) {
              doc.addPage();
              y = 25;
            }
            doc.text(line, 22, y);
            y += 4.5;
          });
          y += 2;

          // Today objectives walk
          if (y > 255) {
            doc.addPage();
            y = 25;
          }
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8.5);
          doc.setTextColor(71, 85, 105);
          doc.text("Today's Standard Objectives Plan:", 20, y);
          y += 4.5;

          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(15, 23, 42);
          const rawToday: string[] = doc.splitTextToSize(s.today || "No active goals entered", 165);
          rawToday.forEach((line) => {
            if (y > 270) {
              doc.addPage();
              y = 25;
            }
            doc.text(line, 22, y);
            y += 4.5;
          });
          y += 2;

          // Blockers report
          if (y > 255) {
            doc.addPage();
            y = 25;
          }
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8.5);
          doc.setTextColor(71, 85, 105);
          doc.text("Active Friction/Delay Blockers:", 20, y);
          y += 4.5;

          doc.setFont("helvetica", "normal");
          if (s.blockers && s.blockers.toLowerCase() !== "none" && s.blockers.trim() !== "") {
            doc.setTextColor(244, 63, 94); // rose-500 red alert highlight
          } else {
            doc.setTextColor(71, 85, 105); // standard gray
          }
          
          const rawBlock: string[] = doc.splitTextToSize(s.blockers || "No active standard blockers in path.", 165);
          rawBlock.forEach((line) => {
            if (y > 270) {
              doc.addPage();
              y = 25;
            }
            doc.text(line, 22, y);
            y += 4.5;
          });
          y += 3;

          // AI Individual Standup Analysis if present
          if (s.aiSummary) {
            if (y > 255) {
              doc.addPage();
              y = 25;
            }
            doc.setFont("helvetica", "bold");
            doc.setFontSize(8);
            doc.setTextColor(16, 185, 129); // emerald
            doc.text("AI standup sentiment synthesis:", 20, y);
            y += 4;

            doc.setFont("helvetica", "normal");
            doc.setFontSize(8.5);
            doc.setTextColor(71, 85, 105);
            const rawAISummary: string[] = doc.splitTextToSize(s.aiSummary, 165);
            rawAISummary.forEach((line) => {
              if (y > 270) {
                doc.addPage();
                y = 25;
              }
              doc.text(line, 22, y);
              y += 4;
            });
            y += 3;
          }

          // Small separator line after registries
          y += 2;
        });
      }

      // --- RETROSPECTIVE OVER-PASS DOCUMENT DECORATION FOR ALL PAGES ---
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);

        // Header running slate bar
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139); // slate-500 (#64748b)
        doc.text("TEAMPULSE AI  |  SPRINT HEALTH & SYSTEM REPORT", 20, 12);

        doc.setDrawColor(203, 213, 225); // slate-300 (#cbd5e1)
        doc.setLineWidth(0.3);
        doc.line(20, 15, 190, 15);

        // Footer running text bar
        const nowStr = new Date().toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        });
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.text(`Generated: ${nowStr}`, 20, 285);
        doc.text(`Page ${i} of ${pageCount}`, 190, 285, { align: "right" });
      }

      // Download file action
      doc.save(`teampulse_sprint_report_${activeTeam.name.toLowerCase().replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Something went wrong while generating the professional PDF. Please verify your workspace logs.");
    } finally {
      setTimeout(() => setExportingPDF(false), 800);
    }
  };

  // Build real CSV export files using client-side blob download
  const handleExportCSV = () => {
    if (standups.length === 0) {
      alert("No standups recorded yet to perform exports.");
      return;
    }
    setExporting(true);

    try {
      const headers = ["ID", "Member Name", "Date", "Yesterday Accomps", "Today Objectives", "Blockers", "Mood", "AI Summary", "AI Mood Score"];
      const rows = standups.map(s => [
        s.id,
        s.userName,
        s.date,
        `"${s.yesterday.replace(/"/g, '""')}"`,
        `"${s.today.replace(/"/g, '""')}"`,
        `"${s.blockers?.replace(/"/g, '""') || 'None'}"`,
        s.mood,
        `"${s.aiSummary?.replace(/"/g, '""') || ''}"`,
        s.aiMoodScore || ""
      ]);

      const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `standup_report_${activeTeam.name.toLowerCase().replace(/\s+/g, '_')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setExporting(false), 800);
    }
  };

  return (
    <div className="flex-1 p-8 space-y-8 bg-[#0c0d10] overflow-y-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-800 pb-5">
        <div>
          <h2 className="text-3xl font-sans font-bold text-white tracking-tight leading-none mb-1">
            Bullet Reports
          </h2>
          <p className="text-sm font-sans text-gray-400">
            Export standup registries to CSV, download professional PDF summaries, and read compiled AI Coach insights.
          </p>
        </div>

        <div className="mt-4 sm:mt-0 flex flex-wrap gap-2 items-center shrink-0">
          <button
            onClick={handleExportCSV}
            disabled={exporting || standups.length === 0}
            className="flex items-center space-x-1.5 py-2.5 px-4 bg-gray-800 hover:bg-gray-750 text-white rounded-xl text-xs font-semibold select-none transition-colors border border-gray-700 disabled:opacity-50 cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>{exporting ? "Compiling..." : "Download CSV Raw"}</span>
          </button>

          <button
            id="export-pdf-report-btn"
            onClick={handleExportPDF}
            disabled={exportingPDF || (standups.length === 0 && insights.length === 0)}
            className="flex items-center space-x-1.5 py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold select-none transition-colors shadow-lg shadow-rose-950/20 disabled:opacity-50 cursor-pointer"
          >
            <FileText className="h-4 w-4" />
            <span>{exportingPDF ? "Generating PDF..." : "Export PDF Report"}</span>
          </button>
          
          <button
            onClick={handleTriggerAI}
            disabled={loading}
            className="flex items-center space-x-1.5 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold select-none transition-colors shadow-lg shadow-emerald-950/20 disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className="h-4 w-4 text-white" />
            <span>{loading ? "Modeling health..." : "Compile AI report"}</span>
          </button>
        </div>
      </div>

      {/* Grid containing reports */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Core detailed lists of reports */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="font-sans font-bold text-lg text-white tracking-tight">
            Historical AI Sprint Digests
          </h3>

          <div className="space-y-6">
            {insights.map((ins) => (
              <div key={ins.id} className="bg-[#16191f] p-6 border border-gray-800 rounded-2xl shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-gray-850 pb-3">
                  <div className="flex items-center space-x-2 font-sans">
                    <Calendar className="h-5 w-5 text-emerald-400" />
                    <div>
                      <h4 className="font-bold text-white text-sm">Sprint Report for {ins.date}</h4>
                      <p className="text-[10px] text-gray-500 font-mono mt-0.5">Team Health Score: {ins.healthScore}%</p>
                    </div>
                  </div>

                  <span className={`text-[10px] px-2.5 py-1 font-mono font-bold rounded-full ${
                    ins.healthScore >= 80 
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                      : ins.healthScore >= 60 
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" 
                      : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                  }`}>
                    Health Code: {ins.healthScore}/100
                  </span>
                </div>

                {/* Report layout sections */}
                <div className="space-y-4 text-xs font-sans text-gray-300">
                  <div className="space-y-1.5">
                    <h5 className="font-bold uppercase font-mono text-[9px] text-gray-400 tracking-wider">
                      Strategic trajectory
                    </h5>
                    <p className="bg-[#0c0d10] p-3 rounded-xl border border-gray-800 leading-relaxed font-sans text-gray-300">
                      {ins.summary}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <h5 className="font-bold uppercase font-mono text-[9px] text-gray-400 tracking-wider">
                      Target Scrum Corrective Action Plans
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {ins.actionItems.map((act, i) => (
                        <div key={i} className="p-2.5 bg-[#0e1115] border border-gray-850 rounded-xl flex items-start space-x-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="text-gray-300 leading-normal font-sans">{act}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-850 pt-3">
                    <div className="space-y-1">
                      <h5 className="font-bold uppercase font-mono text-[9px] text-gray-400 tracking-wider">
                        Psychological Safety Trend
                      </h5>
                      <span className="text-xs font-bold text-white font-sans block mt-1">{ins.moodTrend}</span>
                    </div>

                    <div className="space-y-1">
                      <h5 className="font-bold uppercase font-mono text-[9px] text-gray-400 tracking-wider">
                        Identified Delay Blockers Group
                      </h5>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {Object.keys(ins.blockerFrequency).length > 0 ? (
                          Object.entries(ins.blockerFrequency).map(([keyword, count]) => (
                            <span key={keyword} className="bg-rose-500/10 border border-rose-500/20 text-rose-400 font-mono text-[10px] px-2 py-0.5 rounded-md font-bold">
                              {keyword} ({count})
                            </span>
                          ))
                        ) : (
                          <span className="text-emerald-400 text-xs font-sans font-medium">None detected!</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {insights.length === 0 && (
              <div className="bg-[#16191f] border-2 border-dashed border-gray-800 p-12 rounded-2xl text-center space-y-4">
                <FileText className="h-10 w-10 text-gray-600 mx-auto" />
                <div>
                  <h4 className="text-sm font-sans font-semibold text-white">No Sprint Registers Compiled</h4>
                  <p className="text-xs text-gray-400 font-sans mt-1">
                    Once team members submit standard daily updates, trigger the "Compile AI Health Report" button in the upper right.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Coach Assistant Column info card */}
        <div className="lg:col-span-1 border border-gray-800 bg-[#16191f] p-6 rounded-2xl shadow-sm h-fit space-y-4">
          <div className="flex items-center space-x-2 border-b border-gray-850 pb-3 font-sans">
            <Sparkles className="h-5 w-5 text-emerald-400" />
            <h3 className="font-bold text-sm text-white uppercase tracking-wider">
              Weekly AI Compiler
            </h3>
          </div>
          <div className="space-y-3 font-sans text-xs inline-block">
            <p className="text-xs text-gray-450 leading-relaxed mb-3">
              TeamPulseAI uses deep agile modeling schemas to compile daily standups. This provides insights on:
            </p>
            <div className="space-y-2 text-gray-300">
              <div className="flex items-start space-x-2">
                <span className="font-bold text-emerald-400 shrink-0">1.</span>
                <span><b className="text-white">Action Trackers</b> — Highlights target goals and accountability structures</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="font-bold text-emerald-400 shrink-0">2.</span>
                <span><b className="text-white">Friction Hotpoints</b> — Groups blockers by keywords to indicate structural bottlenecks</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="font-bold text-emerald-400 shrink-0">3.</span>
                <span><b className="text-white">Psychological Trends</b> — Monitors stress levels across daily check-ins</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
