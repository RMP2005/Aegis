"use client";

import { motion } from "framer-motion";
import type { Vulnerability } from "@/lib/api";

interface AnalystPanelProps {
  vulnerability: Vulnerability | null;
  isLoading: boolean;
}

const STAGES = [
  { label: "Scanner Evidence", description: "Slither static analysis results" },
  { label: "Context Analysis", description: "Understanding contract logic" },
  { label: "Risk Evaluation", description: "Assessing real-world impact" },
  { label: "Recommendation", description: "Generating remediation advice" },
];

export default function AnalystPanel({ vulnerability, isLoading }: AnalystPanelProps) {
  if (isLoading) {
    return (
      <div className="h-full bg-aegis-dark-surface rounded-lg border border-aegis-dark-border p-4">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-6 h-6 rounded-full bg-aegis-accent/10 flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-aegis-accent">
              <path d="M12 2a10 10 0 1 0 10 10H12V2z" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-xs font-medium text-white">Aegis Analyst</span>
          <span className="text-[10px] text-aegis-accent animate-pulse">Analyzing...</span>
        </div>

        <div className="space-y-4">
          {STAGES.map((stage, i) => (
            <motion.div
              key={stage.label}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.8, duration: 0.4 }}
              className="flex items-center gap-3"
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                i < 3 ? "bg-aegis-success/10 text-aegis-success" : "bg-aegis-accent/10 text-aegis-accent"
              }`}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-white font-medium">{stage.label}</p>
                <p className="text-[10px] text-[#555]">{stage.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  if (!vulnerability) {
    return (
      <div className="h-full bg-aegis-dark-surface rounded-lg border border-aegis-dark-border p-5 flex flex-col items-center justify-center text-center">
        <div className="w-10 h-10 rounded-full bg-aegis-accent/10 flex items-center justify-center mb-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-aegis-accent">
            <path d="M12 2a10 10 0 1 0 10 10H12V2z" strokeLinecap="round" />
          </svg>
        </div>
        <p className="text-xs text-[#888] font-medium mb-1.5">Aegis Analyst</p>
        <p className="text-[11px] text-[#555] max-w-[200px] leading-relaxed mb-4">
          Waiting for scan evidence...
        </p>
        <div className="space-y-1.5 text-left w-full max-w-[180px]">
          {["Scanner Evidence", "Context Analysis", "Risk Evaluation", "Remediation"].map((step) => (
            <div key={step} className="flex items-center gap-2 opacity-40">
              <div className="w-1.5 h-1.5 rounded-full bg-[#444]" />
              <span className="text-[10px] text-[#555]">{step}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-aegis-dark-surface rounded-lg border border-aegis-dark-border overflow-y-auto">
      <div className="p-4 border-b border-aegis-dark-border">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-aegis-accent/10 flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-aegis-accent">
              <path d="M12 2a10 10 0 1 0 10 10H12V2z" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-xs font-medium text-white">Aegis Analyst</span>
        </div>

        <h3 className="text-sm font-semibold text-white mb-1">{vulnerability.title}</h3>
        <p className="text-[10px] text-[#555] font-mono">{vulnerability.location}</p>
      </div>

      <div className="p-4 space-y-5">
        {/* Scanner Evidence */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-4 rounded bg-aegis-success/10 flex items-center justify-center">
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-aegis-success">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <span className="text-[10px] uppercase tracking-wider text-aegis-success font-medium">
              Scanner Evidence
            </span>
          </div>
          <p className="text-xs text-[#999] leading-relaxed pl-6">
            Static analysis detected <span className="text-white font-medium">{vulnerability.title.toLowerCase()}</span> at line {vulnerability.line}.
          </p>
        </motion.div>

        {/* Context Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-4 rounded bg-aegis-accent/10 flex items-center justify-center">
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-aegis-accent">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <span className="text-[10px] uppercase tracking-wider text-aegis-accent font-medium">
              Context Analysis
            </span>
          </div>
          <p className="text-xs text-[#999] leading-relaxed pl-6">
            {vulnerability.explanation}
          </p>
        </motion.div>

        {/* Risk Evaluation */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-4 rounded bg-aegis-critical/10 flex items-center justify-center">
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-aegis-critical">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <span className="text-[10px] uppercase tracking-wider text-aegis-critical font-medium">
              Risk Evaluation
            </span>
          </div>
          <p className="text-xs text-[#999] leading-relaxed pl-6">
            Severity: <span className="text-white font-medium capitalize">{vulnerability.severity}</span>
          </p>
        </motion.div>

        {/* Recommendation */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-4 rounded bg-aegis-low/10 flex items-center justify-center">
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-aegis-low">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <span className="text-[10px] uppercase tracking-wider text-aegis-low font-medium">
              Recommendation
            </span>
          </div>
          <p className="text-xs text-[#999] leading-relaxed pl-6">
            {vulnerability.recommendation}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
