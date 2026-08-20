"use client";

import { motion } from "framer-motion";
import type { Vulnerability } from "@/lib/api";

interface FindingCardProps {
  vulnerability: Vulnerability;
  index: number;
  isSelected: boolean;
  onClick: () => void;
}

const severityStyles = {
  critical: {
    bg: "bg-aegis-critical-bg",
    text: "text-aegis-critical",
    border: "border-aegis-critical/20",
    ring: "ring-aegis-critical/20",
    dot: "bg-aegis-critical",
  },
  high: {
    bg: "bg-aegis-high-bg",
    text: "text-aegis-high",
    border: "border-aegis-high/20",
    ring: "ring-aegis-high/20",
    dot: "bg-aegis-high",
  },
  medium: {
    bg: "bg-aegis-medium-bg",
    text: "text-aegis-medium",
    border: "border-aegis-medium/20",
    ring: "ring-aegis-medium/20",
    dot: "bg-aegis-medium",
  },
  low: {
    bg: "bg-aegis-low-bg",
    text: "text-aegis-low",
    border: "border-aegis-low/20",
    ring: "ring-aegis-low/20",
    dot: "bg-aegis-low",
  },
};

export default function FindingCard({
  vulnerability,
  index,
  isSelected,
  onClick,
}: FindingCardProps) {
  const config = severityStyles[vulnerability.severity];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      onClick={onClick}
      className={`p-4 rounded-lg border cursor-pointer transition-all ${
        isSelected
          ? `${config.bg} ${config.border} ring-1 ${config.ring}`
          : "bg-aegis-dark-card border-aegis-dark-border hover:border-[#333]"
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
          <span className={`text-[10px] uppercase tracking-wider font-medium ${config.text}`}>
            {vulnerability.severity}
          </span>
        </div>
        {vulnerability.line > 0 && (
          <span className="text-[10px] text-[#555] font-mono">
            L{vulnerability.line}
          </span>
        )}
      </div>

      <h4 className="text-sm font-medium text-white mb-1.5 leading-snug">
        {vulnerability.title}
      </h4>

      <p className="text-xs text-[#666] leading-relaxed line-clamp-2">
        {vulnerability.explanation}
      </p>

      {isSelected && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="mt-3 pt-3 border-t border-[#222]"
        >
          <p className="text-xs text-[#555] mb-2">
            <span className="text-[#888] font-medium">Location:</span>{" "}
            <span className="font-mono text-[#999]">{vulnerability.location}</span>
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
