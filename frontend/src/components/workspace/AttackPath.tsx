"use client";

import { motion } from "framer-motion";
import type { Vulnerability } from "@/lib/api";

interface AttackPathProps {
  vulnerability: Vulnerability;
}

export default function AttackPath({ vulnerability }: AttackPathProps) {
  const steps = parseAttackPath(vulnerability.exploit_path);

  return (
    <div className="bg-aegis-dark-card border border-aegis-dark-border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-aegis-critical">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <span className="text-xs font-medium text-white">Attack Path</span>
      </div>

      <div className="space-y-0">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: i * 0.15 }}
          >
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  i === 0
                    ? "bg-aegis-high-bg text-aegis-high border border-aegis-high/30"
                    : i === steps.length - 1
                    ? "bg-aegis-critical-bg text-aegis-critical border border-aegis-critical/30"
                    : "bg-white/[0.05] text-[#888] border border-[#333]"
                }`}>
                  {i + 1}
                </div>
                {i < steps.length - 1 && (
                  <div className="w-px h-6 bg-gradient-to-b from-[#333] to-[#222] my-0.5" />
                )}
              </div>
              <div className="pb-4 pt-0.5">
                <p className="text-xs text-[#ccc] leading-relaxed">{step}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function parseAttackPath(exploitPath: string): string[] {
  if (!exploitPath) return ["Attack path analysis pending..."];

  const separators = [" → ", " -> ", "\n"];
  let parts: string[] = [exploitPath];

  for (const sep of separators) {
    if (exploitPath.includes(sep)) {
      parts = exploitPath.split(sep).map((s) => s.trim()).filter(Boolean);
      break;
    }
  }

  return parts;
}
