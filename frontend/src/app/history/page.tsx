"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/workspace/Sidebar";
import Link from "next/link";
import { motion } from "framer-motion";
import { getScanHistory, type ScanHistoryEntry } from "@/lib/storage";

function getScoreColor(score: number) {
  if (score >= 80) return "text-aegis-success";
  if (score >= 50) return "text-aegis-medium";
  if (score >= 30) return "text-aegis-high";
  return "text-aegis-critical";
}

function getScoreBg(score: number) {
  if (score >= 80) return "bg-aegis-low-bg";
  if (score >= 50) return "bg-aegis-medium-bg";
  if (score >= 30) return "bg-aegis-high-bg";
  return "bg-aegis-critical-bg";
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

export default function HistoryPage() {
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "score">("newest");
  const [history, setHistory] = useState<ScanHistoryEntry[]>([]);

  useEffect(() => {
    setHistory(getScanHistory());
  }, []);

  const sorted = [...history].sort((a, b) => {
    if (sortOrder === "newest") return new Date(b.date).getTime() - new Date(a.date).getTime();
    if (sortOrder === "oldest") return new Date(a.date).getTime() - new Date(b.date).getTime();
    return a.score - b.score;
  });

  const totalScans = history.length;
  const avgScore = totalScans > 0 ? Math.round(history.reduce((s, h) => s + h.score, 0) / totalScans) : 0;
  const totalCritical = history.reduce((s, h) => s + h.critical, 0);

  return (
    <div className="flex h-screen bg-aegis-dark bg-grid-dark text-white">
      <Sidebar />
      <main className="flex-1 ml-[220px] overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-10">
          {/* Header */}
          <div className="mb-8">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#555] mb-2 font-mono">02 / Audit Log</p>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Scan History</h1>
            <p className="text-sm text-[#666] max-w-lg">
              Complete record of all contract analyses. Track security improvements and maintain an audit trail for compliance.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 mb-8">
            {[
              { label: "Total Scans", value: totalScans.toString(), sub: "All time" },
              { label: "Avg Score", value: totalScans > 0 ? avgScore.toString() : "--", sub: "Security score" },
              { label: "Critical Found", value: totalCritical.toString(), sub: "Across all scans" },
              { label: "Last Scan", value: totalScans > 0 ? formatDate(history[0].date) : "--", sub: "Most recent" },
            ].map((stat) => (
              <div key={stat.label} className="bg-aegis-dark-surface border border-aegis-dark-border rounded-lg p-4">
                <p className="text-[10px] uppercase tracking-wider text-[#555] mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-[10px] text-[#444] mt-0.5">{stat.sub}</p>
              </div>
            ))}
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[10px] text-[#555] uppercase tracking-wider">Sort:</span>
            {(["newest", "oldest", "score"] as const).map((order) => (
              <button
                key={order}
                onClick={() => setSortOrder(order)}
                className={`px-2.5 py-1 rounded text-[10px] font-medium transition-colors ${
                  sortOrder === order ? "bg-white/10 text-white" : "text-[#555] hover:text-[#888]"
                }`}
              >
                {order === "score" ? "Lowest Score" : order.charAt(0).toUpperCase() + order.slice(1)}
              </button>
            ))}
          </div>

          {/* Scan List */}
          {sorted.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-white/[0.03] flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#444]">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <p className="text-sm text-[#666] mb-2">No scans yet</p>
              <p className="text-xs text-[#444] mb-4">Run a security scan to start building your audit history.</p>
              <Link
                href="/scan"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-aegis-accent/10 text-aegis-accent text-xs font-medium hover:bg-aegis-accent/20 transition-colors"
              >
                Run First Scan
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {sorted.map((scan, i) => (
                <motion.div
                  key={scan.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-4 p-4 rounded-lg border border-aegis-dark-border bg-aegis-dark-surface hover:border-[#333] transition-colors group"
                >
                  {/* Score */}
                  <div className={`w-12 h-12 rounded-lg ${getScoreBg(scan.score)} flex flex-col items-center justify-center flex-shrink-0`}>
                    <span className={`text-lg font-bold ${getScoreColor(scan.score)}`}>{scan.score}</span>
                    <span className="text-[8px] text-[#555] -mt-0.5">score</span>
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-sm font-semibold text-white truncate">{scan.contract}</h3>
                      <span className="text-[10px] text-[#555] font-mono">/ {scan.filename}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-[#555]">{formatDate(scan.date)}</span>
                      <span className="text-[10px] text-[#444]">{formatTime(scan.date)}</span>
                      <span className="text-[10px] text-[#444]">{scan.duration}</span>
                    </div>
                  </div>

                  {/* Findings */}
                  <div className="flex items-center gap-3">
                    {scan.critical > 0 && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-aegis-critical-bg text-aegis-critical">
                        {scan.critical} critical
                      </span>
                    )}
                    {scan.high > 0 && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-aegis-high-bg text-aegis-high">
                        {scan.high} high
                      </span>
                    )}
                    {scan.medium > 0 && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-aegis-medium-bg text-aegis-medium">
                        {scan.medium} med
                      </span>
                    )}
                    {scan.low > 0 && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-aegis-low-bg text-aegis-low">
                        {scan.low} low
                      </span>
                    )}
                    {scan.critical === 0 && scan.high === 0 && scan.medium === 0 && scan.low === 0 && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-aegis-low-bg text-aegis-low">
                        Clean
                      </span>
                    )}
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-aegis-success" />
                    <span className="text-[10px] text-[#555] capitalize">{scan.status}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Bottom CTA */}
          {sorted.length > 0 && (
            <div className="mt-8 text-center">
              <Link
                href="/scan"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-aegis-accent/10 text-aegis-accent text-xs font-medium hover:bg-aegis-accent/20 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                Run New Scan
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
