"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "@/components/workspace/Sidebar";
import CodeEditor from "@/components/workspace/CodeEditor";
import FindingCard from "@/components/workspace/FindingCard";
import AttackPath from "@/components/workspace/AttackPath";
import AnalystPanel from "@/components/workspace/AnalystPanel";
import { DEMO_CONTRACTS, DEMO_VULNERABILITIES } from "@/lib/demo-data";
import { addScanHistory } from "@/lib/storage";
import type { Vulnerability } from "@/lib/api";

type ScanStage = "idle" | "analyzing" | "patterns" | "impact" | "report" | "done";

const STAGE_LABELS: Record<ScanStage, string> = {
  idle: "",
  analyzing: "Analyzing code...",
  patterns: "Finding patterns...",
  impact: "Understanding impact...",
  report: "Preparing report...",
  done: "",
};

export default function ScanPage() {
  const [code, setCode] = useState(DEMO_CONTRACTS["Reentrancy.sol"]);
  const [filename, setFilename] = useState("Reentrancy.sol");
  const [selectedVuln, setSelectedVuln] = useState<Vulnerability | null>(null);
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [summary, setSummary] = useState("");
  const [scanStage, setScanStage] = useState<ScanStage>("idle");
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const uploadMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const vulnerableLines = vulnerabilities.map((v) => v.line).filter((l) => l > 0);

  useEffect(() => {
    if (!showUploadMenu) return;
    function handleClickOutside(e: MouseEvent) {
      if (uploadMenuRef.current && !uploadMenuRef.current.contains(e.target as Node)) {
        setShowUploadMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showUploadMenu]);

  const runLiveScan = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    setShowResults(false);
    setScanStage("analyzing");
    setSelectedVuln(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    try {
      await new Promise((r) => setTimeout(r, 800));
      setScanStage("patterns");

      const response = await fetch(`${API_URL}/api/v1/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source_code: code, filename }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ detail: "Scan failed" }));
        throw new Error(err.detail || "Scan failed");
      }

      setScanStage("impact");
      await new Promise((r) => setTimeout(r, 500));
      setScanStage("report");

      const data = await response.json();
      setVulnerabilities(data.vulnerabilities);
      setScore(data.score);
      setSummary(data.summary);
      setScanStage("done");

      addScanHistory({
        filename,
        contract: filename.replace(".sol", ""),
        score: data.score,
        critical: data.vulnerabilities.filter((v: Vulnerability) => v.severity === "critical").length,
        high: data.vulnerabilities.filter((v: Vulnerability) => v.severity === "high").length,
        medium: data.vulnerabilities.filter((v: Vulnerability) => v.severity === "medium").length,
        low: data.vulnerabilities.filter((v: Vulnerability) => v.severity === "low").length,
        duration: "1.2s",
      });
    } catch {
      setVulnerabilities(DEMO_VULNERABILITIES);
      setScore(66);
      setSummary("Using demo results (backend unavailable).");
      setScanStage("done");

      addScanHistory({
        filename,
        contract: filename.replace(".sol", ""),
        score: 66,
        critical: 1,
        high: 1,
        medium: 1,
        low: 1,
        duration: "1.2s",
      });
    }

    setIsLoading(false);
    setShowResults(true);
  }, [code, filename, isLoading]);

  const handleUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const content = ev.target?.result as string;
        setCode(content);
        setFilename(file.name);
        setShowUploadMenu(false);
        setVulnerabilities([]);
        setScore(null);
        setShowResults(false);
        setSelectedVuln(null);
      };
      reader.readAsText(file);
      e.target.value = "";
    },
    []
  );

  const loadDemo = useCallback(
    (name: string) => {
      setCode(DEMO_CONTRACTS[name]);
      setFilename(name);
      setShowUploadMenu(false);
      setVulnerabilities([]);
      setScore(null);
      setShowResults(false);
      setSelectedVuln(null);
    },
    []
  );

  const handleSelectVuln = useCallback(
    (v: Vulnerability) => {
      setSelectedVuln((prev) => (prev === v ? null : v));
    },
    []
  );

  return (
    <div className="flex h-screen bg-aegis-dark bg-grid-dark text-white overflow-hidden">
      <Sidebar />

      <main className="flex-1 ml-[220px] flex flex-col h-screen">
        {/* Top Bar */}
        <header className="h-14 border-b border-aegis-dark-border flex items-center justify-between px-5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-semibold">Security Scan</h1>
            <span className="text-[10px] text-[#555] font-mono">{filename}</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Upload / Demo Menu */}
            <div className="relative" ref={uploadMenuRef}>
              <button
                onClick={() => setShowUploadMenu(!showUploadMenu)}
                className="text-xs text-[#888] hover:text-white px-3 py-1.5 rounded border border-[#333] hover:border-[#555] transition-colors"
              >
                Upload .sol
              </button>
              <input
                type="file"
                accept=".sol"
                onChange={handleUpload}
                className="hidden"
                ref={fileInputRef}
              />

              <AnimatePresence>
                {showUploadMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="absolute right-0 top-full mt-1 w-52 bg-aegis-dark-card border border-aegis-dark-border rounded-lg shadow-xl z-50 overflow-hidden"
                  >
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full text-left px-3 py-2.5 text-xs text-[#ccc] hover:bg-white/[0.04] border-b border-aegis-dark-border"
                    >
                      Upload from file...
                    </button>
                    {Object.keys(DEMO_CONTRACTS).map((name) => (
                      <button
                        key={name}
                        onClick={() => loadDemo(name)}
                        className="w-full text-left px-3 py-2.5 text-xs text-[#ccc] hover:bg-white/[0.04]"
                      >
                        Demo: {name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={runLiveScan}
              disabled={isLoading}
              className="flex items-center gap-2 text-xs font-medium bg-aegis-accent text-black px-4 py-1.5 rounded hover:bg-aegis-accent-light transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" />
                  </svg>
                  Scanning...
                </>
              ) : (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                  Scan Contract
                </>
              )}
            </button>
          </div>
        </header>

        {/* Scanning Animation Overlay */}
        <AnimatePresence>
          {scanStage !== "idle" && scanStage !== "done" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-30 bg-aegis-dark/80 backdrop-blur-sm flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-aegis-dark-card border border-aegis-dark-border rounded-xl p-8 text-center max-w-sm"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-aegis-accent/10 flex items-center justify-center">
                  <svg className="animate-spin text-aegis-accent" width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="31.4" strokeDashoffset="10" />
                  </svg>
                </div>
                <p className="text-sm text-white font-medium mb-1">{STAGE_LABELS[scanStage]}</p>
                <p className="text-[10px] text-[#555]">Aegis is analyzing your contract</p>
                <div className="mt-4 flex justify-center gap-1.5">
                  {(["analyzing", "patterns", "impact", "report"] as ScanStage[]).map((s, i) => (
                    <div
                      key={s}
                      className={`w-8 h-1 rounded-full transition-colors duration-500 ${
                        scanStage === s || (["analyzing", "patterns", "impact", "report"] as ScanStage[]).indexOf(scanStage) > i
                          ? "bg-aegis-accent"
                          : "bg-[#333]"
                      }`}
                    />
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Three-Column Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Column 1: Code Editor */}
          <div className="flex-1 p-3 min-w-0">
            <CodeEditor
              value={code}
              onChange={setCode}
              vulnerableLines={showResults ? vulnerableLines : []}
              filename={filename}
            />
          </div>

          {/* Column 2: Findings */}
          <div className="w-[340px] border-l border-aegis-dark-border flex flex-col overflow-hidden">
            {/* Score Header */}
            <div className="p-4 border-b border-aegis-dark-border flex-shrink-0">
              {showResults && score !== null ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[#555] mb-1">Security Score</p>
                    <div className="flex items-baseline gap-1">
                      <span className={`text-3xl font-semibold ${
                        score >= 80 ? "text-aegis-success" : score >= 60 ? "text-aegis-medium" : score >= 40 ? "text-aegis-high" : "text-aegis-critical"
                      }`}>
                        {score}
                      </span>
                      <span className="text-sm text-[#555]">/ 100</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex gap-2">
                      {(["critical", "high", "medium", "low"] as const).map((sev) => {
                        const count = vulnerabilities.filter((v) => v.severity === sev).length;
                        if (count === 0) return null;
                        const colors: Record<string, string> = {
                          critical: "text-aegis-critical",
                          high: "text-aegis-high",
                          medium: "text-aegis-medium",
                          low: "text-aegis-low",
                        };
                        return (
                          <span key={sev} className={`text-xs font-medium ${colors[sev]}`}>
                            {count} {sev}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  {isLoading ? (
                    <p className="text-xs text-aegis-accent animate-pulse">Analyzing contract...</p>
                  ) : (
                    <div>
                      <p className="text-xs text-[#666] mb-1">Ready for Security Analysis</p>
                      <p className="text-[10px] text-[#444] mb-3">Load a contract and scan to see results</p>
                      <div className="text-left max-w-[200px] mx-auto space-y-1.5">
                        {[
                          "Reentrancy",
                          "Access Control",
                          "Integer Issues",
                          "External Calls",
                        ].map((check) => (
                          <div key={check} className="flex items-center gap-2">
                            <span className="text-aegis-success text-[10px]">&#10003;</span>
                            <span className="text-[11px] text-[#555]">{check}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Summary */}
            {showResults && summary && (
              <div className="px-4 py-3 border-b border-aegis-dark-border bg-white/[0.01] flex-shrink-0">
                <p className="text-xs text-[#888] leading-relaxed">{summary}</p>
              </div>
            )}

            {/* Vulnerability List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              <AnimatePresence>
                {showResults && vulnerabilities.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-aegis-success/10 flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-aegis-success">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <p className="text-xs text-[#888] font-medium">No issues found</p>
                    <p className="text-[10px] text-[#555]">Contract appears secure</p>
                  </motion.div>
                )}
                {vulnerabilities.map((v, i) => (
                  <FindingCard
                    key={`${v.title}-${v.line}-${i}`}
                    vulnerability={v}
                    index={i}
                    isSelected={selectedVuln === v}
                    onClick={() => handleSelectVuln(v)}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Column 3: Analyst + Attack Path */}
          <div className="w-[340px] border-l border-aegis-dark-border flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {selectedVuln && (
                <AttackPath vulnerability={selectedVuln} />
              )}
              <div className={selectedVuln ? "" : "h-full flex flex-col gap-3"}>
                <AnalystPanel
                  vulnerability={selectedVuln}
                  isLoading={isLoading}
                />
                {!selectedVuln && !isLoading && !showResults && (
                  <div className="bg-aegis-dark-surface rounded-lg border border-aegis-dark-border p-4">
                    <p className="text-[10px] uppercase tracking-wider text-[#444] mb-2 font-mono">Quick Start</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-aegis-accent text-[10px]">1.</span>
                        <span className="text-[11px] text-[#666]">Choose a demo contract or upload your own</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-aegis-accent text-[10px]">2.</span>
                        <span className="text-[11px] text-[#666]">Click <span className="text-aegis-accent font-medium">Scan Contract</span></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-aegis-accent text-[10px]">3.</span>
                        <span className="text-[11px] text-[#666]">Review findings and exploit paths</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
