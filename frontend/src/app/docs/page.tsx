"use client";

import { useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/workspace/Sidebar";
import { motion } from "framer-motion";

const SECTIONS = [
  {
    id: "overview",
    title: "How Aegis Works",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4M12 8h.01" />
      </svg>
    ),
    content: [
      {
        heading: "Analysis Pipeline",
        text: "Aegis performs smart contract security analysis through a multi-stage pipeline. Each contract is processed through static analysis, AI-powered reasoning, and exploit path generation.",
      },
      {
        heading: "Static Analysis Layer",
        text: "Slither, Trail of Bits' static analysis framework, performs pattern-based detection across 80+ vulnerability detectors. This catches known vulnerability classes with high precision.",
      },
      {
        heading: "AI Reasoning Layer",
        text: "An LLM-based agent analyzes the Slither output in context of the full contract logic. It identifies logical flaws, validates findings, and generates human-readable explanations.",
      },
      {
        heading: "Exploit Generation",
        text: "For each confirmed vulnerability, Aegis generates a step-by-step exploit path showing how an attacker could exploit the flaw. This helps developers understand the real-world impact.",
      },
      {
        heading: "Security Scoring",
        text: "The final security score (0-100) is calculated based on vulnerability severity, exploitability, and contract complexity. Lower scores indicate higher risk.",
      },
    ],
  },
  {
    id: "detectors",
    title: "Supported Detectors",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
    content: [
      {
        heading: "Reentrancy",
        text: "Detects external calls made before state updates, which can be exploited for reentrancy attacks. Covers both single-function and cross-function reentrancy patterns.",
      },
      {
        heading: "Access Control",
        text: "Identifies missing or weak access control on critical functions. Detects tx.origin usage, unprotected selfdestruct, and unauthorized state modifications.",
      },
      {
        heading: "Arithmetic Issues",
        text: "Catches integer overflow, underflow, and precision loss in arithmetic operations. Particularly relevant for token contracts and DeFi protocols.",
      },
      {
        heading: "Unchecked Return Values",
        text: "Flags low-level calls (call, send, delegatecall) where the return value is not properly checked, potentially leading to silent failures.",
      },
      {
        heading: "Timestamp Dependence",
        text: "Detects reliance on block.timestamp for critical logic, which can be manipulated by miners within a ~15 second window.",
      },
      {
        heading: "Front-Running",
        text: "Identifies transaction ordering dependence (TOD) vulnerabilities where miners or bots can front-run pending transactions.",
      },
    ],
  },
  {
    id: "methodology",
    title: "Methodology",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
    content: [
      {
        heading: "Detection Approach",
        text: "Aegis combines static analysis (deterministic pattern matching) with AI reasoning (contextual understanding). Static analysis provides high-confidence baseline detections, while AI fills gaps by understanding contract-specific logic.",
      },
      {
        heading: "False Positive Reduction",
        text: "The AI layer validates each static analysis finding against the full contract context. It considers state variables, modifier logic, and external interactions to filter false positives.",
      },
      {
        heading: "Severity Classification",
        text: "Vulnerabilities are classified as Critical, High, Medium, or Low based on: (1) potential financial impact, (2) exploitability difficulty, (3) whether the vulnerability is on a public/external function, and (4) contract value at risk.",
      },
      {
        heading: "Exploit Path Generation",
        text: "For each vulnerability, Aegis constructs a concrete attack scenario showing the sequence of transactions, contract interactions, and state changes an attacker would need to execute.",
      },
    ],
  },
  {
    id: "limitations",
    title: "Limitations",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
    content: [
      {
        heading: "Not a Formal Verification",
        text: "Aegis does not perform formal verification. It uses heuristic pattern matching and AI reasoning, which can miss subtle logical errors or produce false positives.",
      },
      {
        heading: "Solidity Only",
        text: "Currently supports Solidity smart contracts only. Vyper, Rust (for Solana/CosmWasm), and other smart contract languages are not yet supported.",
      },
      {
        heading: "No Runtime Analysis",
        text: "Static analysis only. Aegis does not simulate contract execution, test gas optimization, or analyze MEV (Miner Extractable Value) scenarios.",
      },
      {
        heading: "AI Limitations",
        text: "The AI reasoning layer may occasionally misinterpret complex DeFi logic, cross-contract interactions, or upgradeable proxy patterns. Always verify findings manually.",
      },
      {
        heading: "No Third-Party Protocol Risk",
        text: "Aegis analyzes individual contracts in isolation. It does not assess risks from external protocol dependencies, oracle manipulation, or composability hazards.",
      },
    ],
  },
  {
    id: "api",
    title: "API Reference",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
    content: [
      {
        heading: "POST /api/v1/scan",
        text: "Submit a smart contract for analysis. Accepts JSON body with `source_code` (string) and `filename` (string, optional). Returns a ScanResult with score, summary, vulnerabilities array, and processing stages.",
      },
      {
        heading: "GET /health",
        text: "Health check endpoint. Returns 200 OK when the backend is operational and all dependencies (Slither, AI agent) are accessible.",
      },
      {
        heading: "Response Format",
        text: "ScanResult: `{ score: number, summary: string, vulnerabilities: Vulnerability[], stages: string[] }`. Each Vulnerability includes severity, title, location, line number, explanation, exploit_path, and recommendation.",
      },
    ],
  },
];

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("overview");

  const section = SECTIONS.find((s) => s.id === activeSection) || SECTIONS[0];

  return (
    <div className="flex h-screen bg-aegis-dark bg-grid-dark text-white">
      <Sidebar />
      <main className="flex-1 ml-[220px] overflow-y-auto">
        <div className="max-w-5xl mx-auto px-8 py-10">
          {/* Header */}
          <div className="mb-8">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#555] mb-2 font-mono">04 / Reference</p>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Documentation</h1>
            <p className="text-sm text-[#666] max-w-lg">
              Technical reference for the Aegis security analysis platform. How it works, what it detects, and its limitations.
            </p>
          </div>

          <div className="flex gap-8">
            {/* Sidebar Nav */}
            <nav className="w-48 flex-shrink-0">
              <div className="sticky top-10">
                <p className="text-[10px] uppercase tracking-wider text-[#444] mb-3 px-3 font-mono">Contents</p>
                {SECTIONS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setActiveSection(s.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs transition-colors mb-0.5 ${
                      activeSection === s.id
                        ? "bg-white/[0.06] text-white"
                        : "text-[#666] hover:text-white hover:bg-white/[0.03]"
                    }`}
                  >
                    <span className={activeSection === s.id ? "text-aegis-accent" : "text-[#444]"}>{s.icon}</span>
                    <span>{s.title}</span>
                  </button>
                ))}

                <div className="mt-6 pt-4 border-t border-aegis-dark-border">
                  <p className="text-[10px] uppercase tracking-wider text-[#444] mb-2 px-3 font-mono">Quick Links</p>
                  <Link href="/scan" className="flex items-center gap-2 px-3 py-1.5 rounded text-[11px] text-[#666] hover:text-aegis-accent transition-colors">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.35-4.35" />
                    </svg>
                    Open Scanner
                  </Link>
                  <Link href="/patterns" className="flex items-center gap-2 px-3 py-1.5 rounded text-[11px] text-[#666] hover:text-aegis-accent transition-colors">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                    </svg>
                    View Patterns
                  </Link>
                </div>
              </div>
            </nav>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-aegis-accent">{section.icon}</span>
                  <h2 className="text-xl font-bold text-white">{section.title}</h2>
                </div>

                <div className="space-y-6">
                  {section.content.map((item, i) => (
                    <div key={i} className="border-l-2 border-aegis-dark-border pl-5 hover:border-aegis-accent/30 transition-colors">
                      <h3 className="text-sm font-semibold text-white mb-2">{item.heading}</h3>
                      <p className="text-xs text-[#888] leading-relaxed">{item.text}</p>
                    </div>
                  ))}
                </div>

                {/* Technical Metadata */}
                <div className="mt-10 p-4 rounded-lg bg-[#0A0A0C] border border-aegis-dark-border">
                  <p className="text-[10px] uppercase tracking-wider text-[#555] mb-3 font-mono">Technical Details</p>
                  <div className="grid grid-cols-3 gap-4 text-[11px]">
                    <div>
                      <p className="text-[#555] mb-0.5">Backend</p>
                      <p className="text-[#999] font-mono">Python 3.11 / FastAPI</p>
                    </div>
                    <div>
                      <p className="text-[#555] mb-0.5">Static Analysis</p>
                      <p className="text-[#999] font-mono">Slither 0.10+</p>
                    </div>
                    <div>
                      <p className="text-[#555] mb-0.5">AI Agent</p>
                      <p className="text-[#999] font-mono">LLM via API</p>
                    </div>
                    <div>
                      <p className="text-[#555] mb-0.5">Supported</p>
                      <p className="text-[#999] font-mono">Solidity ^0.8.x</p>
                    </div>
                    <div>
                      <p className="text-[#555] mb-0.5">Detectors</p>
                      <p className="text-[#999] font-mono">80+ vulnerability classes</p>
                    </div>
                    <div>
                      <p className="text-[#555] mb-0.5">Avg Scan Time</p>
                      <p className="text-[#999] font-mono">~1.2 seconds</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
