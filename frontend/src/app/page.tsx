"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import RevealSection from "@/components/RevealSection";

const NAV_ITEMS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#pipeline" },
  { label: "Security", href: "#showcase" },
];

/* ─── Geometric Logo Mark ─── */
function AegisMark({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <path
        d="M12 2H20L27 9V20L27 23L20 30H12L5 23V20V9L12 2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      <line x1="10" y1="22" x2="14.5" y2="6" stroke="currentColor" strokeWidth="1.2" />
      <line x1="22" y1="22" x2="17.5" y2="6" stroke="currentColor" strokeWidth="1.2" />
      <line x1="11.5" y1="16" x2="20.5" y2="16" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="16" cy="16" r="1.2" fill="currentColor" />
    </svg>
  );
}

/* ─── Chapter Divider ─── */
function ChapterDivider({ number, label, align = "left" }: { number: string; label: string; align?: "left" | "right" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: "-60px" }}
      transition={{ duration: 0.6 }}
      className={`max-w-6xl mx-auto px-6 py-8 ${align === "right" ? "text-right" : ""}`}
    >
      <div className={`flex items-center gap-4 ${align === "right" ? "flex-row-reverse" : ""}`}>
        <span className="text-[28px] font-light text-black/[0.08] tracking-tight leading-none select-none">{number}</span>
        <div className="h-px flex-1 bg-black/[0.06]" />
        <span className="text-[8px] font-mono text-[#999] tracking-[0.2em] uppercase shrink-0">{label}</span>
      </div>
    </motion.div>
  );
}

/* ─── Scan Visualization (Hero) ─── */
function ScanVisualization() {
  const [stageIdx, setStageIdx] = useState(0);
  const [statusIdx, setStatusIdx] = useState(0);
  const [score, setScore] = useState(0);

  const stages = [
    { text: "Evidence collected", done: true },
    { text: "Patterns matched", done: true },
    { text: "Critical vulnerability detected", done: false, critical: true },
  ];

  const statuses = ["PARSING", "ANALYZING", "DETECTING", "SCORING", "COMPLETE"];

  useEffect(() => {
    const t = setInterval(() => {
      setStatusIdx((i) => (i + 1) % statuses.length);
    }, 2200);
    return () => clearInterval(t);
  }, [statuses.length]);

  useEffect(() => {
    const t = setInterval(() => {
      setStageIdx((i) => Math.min(i + 1, stages.length));
    }, 800);
    return () => clearInterval(t);
  }, [stages.length]);

  useEffect(() => {
    const target = 66;
    if (score < target) {
      const t = setTimeout(() => setScore((s) => Math.min(s + 1, target)), 30);
      return () => clearTimeout(t);
    }
  }, [score]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.4 }}
      className="w-full"
    >
      <div className="relative">
        <div className="absolute -top-3 -right-3 w-[1px] h-6 bg-aegis-accent/30" />
        <div className="absolute -top-3 -right-3 w-6 h-[1px] bg-aegis-accent/30" />
        <div className="absolute -bottom-3 -left-3 w-[1px] h-6 bg-aegis-accent/30" />
        <div className="absolute -bottom-3 -left-3 w-6 h-[1px] bg-aegis-accent/30" />

        <div className="bg-[#0C0C0E] border border-[#222] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#1a1a1e]">
            <div className="flex items-center gap-2">
              <AegisMark size={13} className="text-aegis-accent" />
              <span className="text-[10px] font-semibold text-white tracking-widest uppercase">Aegis</span>
              <span className="text-[8px] font-mono text-[#444] ml-1">v1.0</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-aegis-accent animate-scan-pulse" />
                <span className="text-[9px] text-aegis-accent font-mono tracking-wider">{statuses[statusIdx]}</span>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-[#666]">Vault.sol</span>
                <span className="text-[8px] font-mono text-[#333]">0.8.19</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full bg-aegis-accent animate-scan-pulse" />
                <span className="text-[9px] font-mono text-aegis-accent tracking-wider uppercase">
                  {statuses[statusIdx]}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-[8px] font-mono text-[#555]">
              <span>286 lines</span>
              <span className="text-[#222]">|</span>
              <span>4 functions</span>
              <span className="text-[#222]">|</span>
              <span>3 external calls</span>
            </div>

            <div className="space-y-1.5">
              {stages.map((item, i) => (
                <motion.div
                  key={item.text}
                  initial={{ opacity: 0, x: -6 }}
                  animate={i < stageIdx ? { opacity: 1, x: 0 } : { opacity: 0.25, x: -2 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-2"
                >
                  {item.done && i < stageIdx ? (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className="text-aegis-success flex-shrink-0">
                      <polyline points="20 6 9 17 4 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : i < stageIdx ? (
                    <div className="w-[10px] h-[10px] rounded-full border border-aegis-critical/60 flex items-center justify-center flex-shrink-0">
                      <div className="w-1 h-1 rounded-full bg-aegis-critical" />
                    </div>
                  ) : (
                    <div className="w-[10px] h-[10px] rounded-full border border-[#333] flex-shrink-0" />
                  )}
                  <span className={`text-[11px] ${i >= stageIdx ? "text-[#555]" : item.critical ? "text-aegis-critical font-medium" : "text-[#888]"}`}>
                    {item.text}
                  </span>
                </motion.div>
              ))}
            </div>

            <div className="h-px bg-[#1a1a1e]" />

            <div className="flex items-end justify-between">
              <div>
                <p className="text-[8px] uppercase tracking-[0.15em] text-[#555] mb-0.5 font-mono">Score</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-light text-aegis-high tabular-nums">{score}</span>
                  <span className="text-[10px] text-[#555]">/ 100</span>
                </div>
                <div className="w-full h-[2px] bg-[#1a1a1e] mt-1.5">
                  <motion.div
                    className="h-full bg-aegis-high"
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
              </div>
              <div className="text-right">
                <p className="text-[8px] uppercase tracking-[0.15em] text-[#555] mb-0.5 font-mono">Issues</p>
                <span className="text-sm font-semibold text-white">4</span>
                <p className="text-[8px] font-mono text-[#555] mt-0.5">1 critical</p>
              </div>
            </div>

            <div className="bg-[#111] border border-[#1a1a1e] p-2.5">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-1 h-1 rounded-full bg-aegis-critical" />
                  <span className="text-[8px] uppercase tracking-wider text-aegis-critical font-mono">Critical</span>
                </div>
                <span className="text-[8px] font-mono text-[#555]">L28</span>
              </div>
              <p className="text-[10px] text-[#aaa] font-mono">Reentrancy — external call before state update</p>
            </div>

            <div className="flex items-center justify-between text-[7px] font-mono text-[#444]">
              <span>SHA256: 7f2a...c91d</span>
              <span>T+0.34s</span>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute -top-5 -right-2 bg-aegis-bg border border-black/10 px-2 py-0.5"
        >
          <span className="text-[8px] font-mono text-[#999] tracking-wider">SECURITY ENGINE v1.0</span>
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ─── Main Page ─── */
export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 40]);

  return (
    <div className="min-h-screen bg-aegis-bg">
      {/* ─── Navigation ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-aegis-bg/80 backdrop-blur-xl border-b border-black/5">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <AegisMark size={22} className="text-aegis-accent" />
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold tracking-tight">Aegis</span>
              <span className="text-[8px] font-mono text-[#999] tracking-wider border border-black/[0.08] px-1.5 py-0.5 hidden sm:inline-block">
                SECURITY ENGINE / v1.0
              </span>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-7">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-[13px] text-aegis-text-secondary hover:text-aegis-text transition-colors"
              >
                {item.label}
              </a>
            ))}
            <Link
              href="/scan"
              className="text-[13px] font-medium bg-aegis-text text-white px-4 py-1.5 rounded-md hover:bg-aegis-text/90 transition-colors"
            >
              Launch App
            </Link>
          </div>
          <Link
            href="/scan"
            className="md:hidden text-[13px] font-medium bg-aegis-text text-white px-4 py-1.5 rounded-md"
          >
            Launch
          </Link>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section ref={heroRef} className="pt-32 pb-20 px-6">
        <motion.div
          style={{ opacity: heroOpacity, y: heroY }}
          className="max-w-6xl mx-auto"
        >
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-16 lg:gap-20 items-start">
            <div className="pt-4">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-[10px] font-mono uppercase tracking-[0.2em] text-aegis-accent mb-6"
              >
                Aegis Security Engine
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-[2.5rem] md:text-[4rem] font-light tracking-[-0.03em] leading-[1.02] text-balance mb-6"
              >
                <span className="font-light">Before attackers</span>
                <br />
                <span className="font-light">read your contract,</span>
                <br />
                <span className="font-semibold"><span className="aegis-gradient-text">Aegis</span> already did.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="text-[15px] text-aegis-text-secondary max-w-md leading-relaxed mb-8"
              >
                Static analysis combined with AI reasoning. Detect vulnerabilities,
                understand exploit paths, and receive actionable remediation
                before deployment.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.35 }}
                className="flex items-center gap-3"
              >
                <Link
                  href="/scan"
                  className="inline-flex items-center gap-2 bg-aegis-text text-white px-5 py-2.5 rounded-md font-medium text-[13px] hover:bg-aegis-text/90 transition-all"
                >
                  Scan Contract
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M3.5 8H12.5M12.5 8L8.5 4M12.5 8L8.5 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
                <a
                  href="#pipeline"
                  className="inline-flex items-center gap-2 text-[13px] text-aegis-text-secondary hover:text-aegis-text transition-colors border border-black/10 px-5 py-2.5 rounded-md"
                >
                  View Demo
                </a>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="text-[8px] font-mono text-[#bbb] mt-8 tracking-wider"
              >
                STATIC + AI REASONING · SOLIDITY 0.8.x · TRAIL OF BITS DETECTORS
              </motion.p>
            </div>

            <div className="lg:pt-8">
              <ScanVisualization />
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── Chapter 01 ─── */}
      <ChapterDivider number="01" label="Contract Intelligence" />

      <RevealSection className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-12">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-aegis-accent mb-6">
                01 / Contract Intelligence
              </p>
              <h2 className="text-[2rem] md:text-[2.75rem] font-light tracking-[-0.02em] leading-[1.1] max-w-3xl">
                Static scanners find{" "}
                <span className="font-semibold">patterns.</span>
                <br />
                Aegis understands{" "}
                <span className="font-semibold">consequences.</span>
              </h2>
            </div>
            <div className="hidden lg:flex flex-col justify-end items-end gap-3">
              <div className="text-right">
                <p className="text-[8px] font-mono text-[#888] tracking-wider leading-relaxed">
                  DETECTION MODE<br />
                  STATIC + DYNAMIC<br />
                  CONFIDENCE: 97.2%
                </p>
              </div>
              <div className="h-px w-12 bg-black/[0.08]" />
              <div className="text-right space-y-1">
                <p className="text-[7px] font-mono text-[#888] tracking-wider">ENGINE: Aegis Core</p>
                <p className="text-[7px] font-mono text-[#888] tracking-wider">STATUS: Analysis complete</p>
                <p className="text-[7px] font-mono text-[#888] tracking-wider">TARGET: Solidity 0.8.x</p>
              </div>
            </div>
          </div>
        </div>
      </RevealSection>

      {/* ─── Chapter 02 ─── */}
      <ChapterDivider number="02" label="Static Analysis" align="right" />

      <RevealSection
        id="pipeline"
        className="py-20 px-6"
      >
        <div className="max-w-5xl mx-auto">
          <div className="mb-16">
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-aegis-accent mb-4">
              02 / Static Analysis
            </p>
            <h2 className="text-[1.5rem] md:text-[2rem] font-light tracking-[-0.02em] leading-[1.15] max-w-2xl mb-4">
              From contract code to{" "}
              <span className="font-semibold">security intelligence.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] gap-4 md:gap-3 items-center">
            {[
              { label: "01", title: "Solidity\nContract" },
              { label: "02", title: "Static\nEvidence" },
              { label: "03", title: "AI\nReasoning" },
              { label: "04", title: "Security\nReport" },
            ].map((step, i) => (
              <div key={step.label} className="contents">
                <RevealSection delay={i * 0.1}>
                  <div className="border border-black/[0.06] p-4 md:p-5 relative group">
                    <p className="text-[9px] font-mono text-aegis-accent mb-2">{step.label}</p>
                    <p className="text-[13px] font-semibold leading-tight whitespace-pre-line">
                      {step.title}
                    </p>
                    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-aegis-accent/20" />
                  </div>
                </RevealSection>
                {i < 3 && (
                  <RevealSection delay={0.2 + i * 0.1}>
                    <div className="hidden md:flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#bbb]">
                        <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </RevealSection>
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {[
              {
                num: "01",
                title: "Code Analysis",
                desc: "Input your Solidity source. Aegis parses the contract structure and identifies entry points.",
              },
              {
                num: "02",
                title: "Static Evidence",
                desc: "Slither runs comprehensive detectors against your code, producing structured vulnerability data.",
              },
              {
                num: "03",
                title: "AI Reasoning",
                desc: "The reasoning layer interprets findings in context. Understanding exploitability, impact, and severity.",
              },
            ].map((item, i) => (
              <RevealSection key={item.num} delay={i * 0.08}>
                <p className="text-[9px] font-mono text-aegis-accent mb-2">{item.num}</p>
                <h3 className="text-[14px] font-semibold mb-1.5">{item.title}</h3>
                <p className="text-[13px] text-aegis-text-secondary leading-relaxed">{item.desc}</p>
              </RevealSection>
            ))}
          </div>

          <RevealSection delay={0.3}>
            <div className="flex items-center gap-4 mt-10 text-[7px] font-mono text-[#888] tracking-wider border-t border-black/[0.06] pt-4">
              <span>CONTRACT: Vault.sol</span>
              <span className="text-[#ccc]">|</span>
              <span>ANALYSIS: Complete</span>
              <span className="text-[#ccc]">|</span>
              <span>FINDINGS: 4 issues</span>
              <span className="text-[#ccc] hidden sm:inline">|</span>
              <span className="hidden sm:inline">SEVERITY: Critical</span>
            </div>
          </RevealSection>
        </div>
      </RevealSection>

      {/* ─── Chapter 03 ─── */}
      <ChapterDivider number="03" label="AI Security Reasoning" />

      <RevealSection
        id="showcase"
        className="py-24 px-6 bg-aegis-dark"
      >
        <div className="max-w-5xl mx-auto">
          <div className="flex items-start justify-between mb-14">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-aegis-accent mb-4">
                03 / AI Security Reasoning
              </p>
              <h2 className="text-[1.75rem] md:text-[2.5rem] font-light tracking-[-0.02em] leading-[1.1] text-white max-w-2xl">
                See what attackers see{" "}
                <span className="font-semibold">before they act.</span>
              </h2>
            </div>
            <div className="hidden md:block text-right">
              <p className="text-[8px] font-mono text-[#666] tracking-wider">EXPLOITABLE</p>
              <p className="text-[8px] font-mono text-aegis-critical tracking-wider mt-0.5">SEVERITY: CRITICAL</p>
            </div>
          </div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 border border-[#222]"
          >
            <div className="border-b md:border-b-0 md:border-r border-[#222]">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#222]">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#2a2a2e]" />
                  <div className="w-2 h-2 rounded-full bg-[#2a2a2e]" />
                  <div className="w-2 h-2 rounded-full bg-[#2a2a2e]" />
                </div>
                <span className="text-[10px] font-mono text-[#666] ml-1">Vault.sol</span>
                <span className="ml-auto text-[8px] font-mono text-aegis-critical tracking-wider">VULNERABLE</span>
              </div>
              <pre className="p-5 text-[12px] font-mono leading-[1.8] overflow-x-auto">
                <code>
                  <span className="text-[#555]">26:</span>{"  "}
                  <span className="text-[#888]">function</span>{" "}
                  <span className="text-aegis-accent">withdraw</span>
                  <span className="text-[#888]">(uint256 amount) external {"{"}</span>{"\n"}
                  <span className="text-[#555]">27:</span>{"    "}
                  <span className="text-[#888]">require</span>
                  <span className="text-[#777]">(balances[msg.sender] &gt;= amount);</span>{"\n"}
                  {"\n"}
                  <span className="text-[#555]">28:</span>{"    "}
                  <span className="text-[#777]">(bool success, ) = </span>
                  <span className="text-aegis-critical bg-aegis-critical/10 px-1">msg.sender.call{"{value: amount}"}(&quot;&quot;)</span>
                  <span className="text-[#777]">;</span>{"\n"}
                  <span className="text-[#555]">29:</span>{"    "}
                  <span className="text-[#888]">require</span>
                  <span className="text-[#777]">(success);</span>{"\n"}
                  {"\n"}
                  <span className="text-[#555]">30:</span>{"    "}
                  <span className="text-[#777]">balances[msg.sender] -= amount;</span>{"\n"}
                  <span className="text-[#888]">{"}"}</span>
                </code>
              </pre>
              <div className="px-5 pb-3 flex items-center justify-between text-[7px] font-mono text-[#555]">
                <span>L28 · EXTERNAL CALL · BEFORE STATE UPDATE</span>
                <span>SEVERITY: CRITICAL</span>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-1.5 h-1.5 rounded-full bg-aegis-critical" />
                <span className="text-[10px] uppercase tracking-wider text-aegis-critical font-semibold">Critical</span>
                <span className="text-[8px] font-mono text-[#666] ml-auto">CVSS 9.8</span>
              </div>

              <h3 className="text-[17px] font-semibold text-white mb-5">Reentrancy</h3>

              <div className="space-y-5">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.15em] text-[#666] mb-2 font-mono">Why it matters</p>
                  <p className="text-[13px] text-[#aaa] leading-relaxed">
                    External calls happen before state updates. An attacker can
                    re-enter the function before the balance is decremented, draining
                    the entire contract.
                  </p>
                </div>

                <div className="h-px bg-[#222]" />

                <div>
                  <p className="text-[9px] uppercase tracking-[0.15em] text-[#666] mb-2 font-mono">Recommended fix</p>
                  <p className="text-[13px] text-[#aaa] leading-relaxed">
                    Follow the checks-effects-interactions pattern. Update state
                    before external calls. Use{" "}
                    <code className="text-aegis-accent font-mono text-[12px]">ReentrancyGuard</code>.
                  </p>
                </div>

                <div className="h-px bg-[#222]" />

                <div>
                  <p className="text-[9px] uppercase tracking-[0.15em] text-[#666] mb-2 font-mono">Attack path</p>
                  <div className="bg-[#111] border border-[#222] p-3 mt-2">
                    <div className="space-y-1">
                      {[
                        { text: "Attacker deploys exploit", hl: false },
                        { text: "Calls withdraw(1 ETH)", hl: false },
                        { text: "Fallback re-enters withdraw()", hl: true },
                        { text: "Balance not yet updated", hl: true },
                        { text: "Repeat until drained", hl: true },
                      ].map((step, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className={`w-1 h-1 rounded-full ${step.hl ? "bg-aegis-critical" : "bg-[#555]"}`} />
                          <span className={`text-[11px] font-mono ${step.hl ? "text-[#ccc]" : "text-[#777]"}`}>
                            {step.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Dark section metadata */}
          <RevealSection delay={0.3}>
            <div className="flex items-center gap-4 mt-6 text-[7px] font-mono text-[#555] tracking-wider">
              <span>SCANNER: Slither v0.10.0</span>
              <span className="text-[#333]">|</span>
              <span>DETECTORS: 93 active</span>
              <span className="text-[#333]">|</span>
              <span>SCAN TIME: 0.8s</span>
              <span className="text-[#333] hidden sm:inline">|</span>
              <span className="hidden sm:inline">CONFIDENCE: High</span>
            </div>
          </RevealSection>
        </div>
      </RevealSection>

      {/* ─── Chapter 04 ─── */}
      <ChapterDivider number="04" label="Exploit Visualization" align="right" />

      <section id="features" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <RevealSection className="mb-20">
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-aegis-accent mb-4">
              04 / Exploit Visualization
            </p>
            <h2 className="text-[1.75rem] md:text-[2.25rem] font-light tracking-[-0.02em] leading-[1.1] max-w-2xl">
              Security analysis{" "}
              <span className="font-semibold">for code that holds value.</span>
            </h2>
          </RevealSection>

          {/* Feature 01 — Editorial chapter */}
          <RevealSection className="mb-20">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-10 items-start">
              <div>
                <p className="text-[9px] font-mono text-aegis-accent mb-4">01</p>
                <h3 className="text-[1.5rem] md:text-[1.75rem] font-semibold mb-4 tracking-[-0.02em] leading-[1.1]">
                  Attack Path Visualization
                </h3>
                <p className="text-[15px] text-aegis-text-secondary leading-relaxed mb-5">
                  Understand exactly how an attacker would exploit your contract.
                  Step-by-step exploit flow from initial access to maximum damage.
                </p>
                <div className="flex items-center gap-3 text-[10px] text-[#888] font-mono">
                  <div className="w-1 h-1 rounded-full bg-aegis-accent" />
                  Step-by-step exploit flow visualization
                </div>
              </div>
              <div className="bg-[#0C0C0E] border border-[#222] p-5">
                <p className="text-[8px] font-mono text-[#666] uppercase tracking-wider mb-3">Example Attack Flow</p>
                <div className="space-y-0">
                  {[
                    { step: "Attacker", color: "text-aegis-high" },
                    { step: "withdraw()", color: "text-[#999]" },
                    { step: "External call", color: "text-aegis-critical" },
                    { step: "State manipulation", color: "text-aegis-critical" },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-[8px] font-mono ${
                        i === 0 ? "border-aegis-high/40 text-aegis-high" : i >= 2 ? "border-aegis-critical/40 text-aegis-critical" : "border-[#333] text-[#666]"
                      }`}>
                        {i + 1}
                      </div>
                      <span className={`text-[12px] font-mono ${s.color}`}>{s.step}</span>
                      {i < 3 && <span className="text-[10px] text-[#444] ml-auto">&rarr;</span>}
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-[#222] flex items-center justify-between text-[7px] font-mono text-[#555]">
                  <span>EXPLOIT FLOW · 4 STAGES</span>
                  <span>SEVERITY: CRITICAL</span>
                </div>
              </div>
            </div>
          </RevealSection>

          {/* Feature 02 — Editorial chapter */}
          <RevealSection className="mb-20">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-10 items-start">
              <div>
                <p className="text-[9px] font-mono text-aegis-accent mb-4">02</p>
                <h3 className="text-[1.5rem] md:text-[1.75rem] font-semibold mb-4 tracking-[-0.02em] leading-[1.1]">
                  AI Security Analyst
                </h3>
                <p className="text-[15px] text-aegis-text-secondary leading-relaxed mb-5">
                  Convert technical scanner output into human reasoning. Context-aware
                  explanations that tell you why a finding matters, not just what it is.
                </p>
                <div className="flex items-center gap-3 text-[10px] text-[#888] font-mono">
                  <div className="w-1 h-1 rounded-full bg-aegis-accent" />
                  Context-aware vulnerability explanations
                </div>
              </div>
              <div className="bg-[#0C0C0E] border border-[#222] p-5">
                <p className="text-[8px] font-mono text-[#666] uppercase tracking-wider mb-3">AI Analysis Output</p>
                <div className="space-y-3">
                  {[
                    { label: "Finding", value: "Reentrancy in withdraw()", color: "text-aegis-critical" },
                    { label: "Severity", value: "Critical (CVSS 9.8)", color: "text-aegis-high" },
                    { label: "Impact", value: "Full contract drain possible", color: "text-[#aaa]" },
                    { label: "Recommendation", value: "Use ReentrancyGuard modifier", color: "text-aegis-success" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="text-[8px] font-mono text-[#555] uppercase w-20 shrink-0 pt-0.5">{item.label}</span>
                      <span className={`text-[12px] font-mono ${item.color}`}>{item.value}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-[#222] flex items-center justify-between text-[7px] font-mono text-[#555]">
                  <span>AI CONFIDENCE: 97.2%</span>
                  <span>MODEL: GPT-4o</span>
                </div>
              </div>
            </div>
          </RevealSection>

          {/* Feature 03 — Editorial chapter */}
          <RevealSection>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-10 items-start">
              <div>
                <p className="text-[9px] font-mono text-aegis-accent mb-4">03</p>
                <h3 className="text-[1.5rem] md:text-[1.75rem] font-semibold mb-4 tracking-[-0.02em] leading-[1.1]">
                  Remediation Engine
                </h3>
                <p className="text-[15px] text-aegis-text-secondary leading-relaxed mb-5">
                  Receive actionable guidance instead of generic warnings.
                  Code-level fixes with references to established security patterns.
                </p>
                <div className="flex items-center gap-3 text-[10px] text-[#888] font-mono">
                  <div className="w-1 h-1 rounded-full bg-aegis-accent" />
                  Specific fixes with pattern references
                </div>
              </div>
              <div className="bg-[#0C0C0E] border border-[#222] p-5">
                <p className="text-[8px] font-mono text-[#666] uppercase tracking-wider mb-3">Remediation Preview</p>
                <div className="bg-[#111] border border-[#222] p-3 mb-3">
                  <p className="text-[9px] font-mono text-[#666] mb-2">CHECKS-EFFECTS-INTERACTIONS PATTERN</p>
                  <pre className="text-[11px] font-mono leading-[1.7]">
                    <code>
                      <span className="text-[#888]">function</span>{" "}
                      <span className="text-aegis-success">withdraw</span>
                      <span className="text-[#888]">(uint256 amount) external {"{"}</span>{"\n"}
                      <span className="text-[#777]">{"// CHECKS"}</span>{"\n"}
                      <span className="text-[#888]">  require</span>
                      <span className="text-[#666]">(balances[msg.sender] &gt;= amount);</span>{"\n"}
                      {"\n"}
                      <span className="text-[#777]">{"// EFFECTS — update state first"}</span>{"\n"}
                      <span className="text-aegis-success">  balances[msg.sender] -= amount;</span>{"\n"}
                      {"\n"}
                      <span className="text-[#777]">{"// INTERACTIONS — external call last"}</span>{"\n"}
                      <span className="text-[#888]">  (bool s, ) = </span>
                      <span className="text-[#666]">msg.sender.call{"{value: amount}"}(&quot;&quot;);</span>{"\n"}
                      <span className="text-[#888]">  require</span><span className="text-[#666]">(s);</span>{"\n"}
                      <span className="text-[#888]">{"}"}</span>
                    </code>
                  </pre>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-[#888] font-mono">
                  <span className="text-aegis-success">&#10003;</span>
                  Pattern: OpenZeppelin ReentrancyGuard
                </div>
                <div className="mt-4 pt-3 border-t border-[#222] flex items-center justify-between text-[7px] font-mono text-[#555]">
                  <span>PATTERN: CHECKS-EFFECTS-INTERACTIONS</span>
                  <span>REFERENCE: OZ SECURITY</span>
                </div>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ─── Chapter 05 ─── */}
      <ChapterDivider number="05" label="Security Tooling" />

      <RevealSection className="py-20 px-6 bg-aegis-dark">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12">
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-aegis-accent mb-4">
              05 / Security Tooling
            </p>
            <h2 className="text-[1.5rem] md:text-[2rem] font-light tracking-[-0.02em] leading-[1.1] text-white max-w-2xl">
              Built on real{" "}
              <span className="font-semibold">security tooling.</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-[1px] bg-[#222]">
            {[
              { name: "Slither", role: "Static Analysis", detail: "Trail of Bits" },
              { name: "Solidity", role: "Target Language", detail: "0.8.x" },
              { name: "FastAPI", role: "Backend Runtime", detail: "Async Python" },
              { name: "AI Reasoning", role: "Analysis Layer", detail: "GPT-4o / Mock" },
            ].map((tech, i) => (
              <RevealSection key={tech.name} delay={i * 0.08}>
                <div className="bg-[#0C0C0E] p-5 relative">
                  <p className="text-[12px] font-semibold text-white mb-0.5">{tech.name}</p>
                  <p className="text-[9px] text-aegis-accent font-mono uppercase tracking-wider mb-2">{tech.role}</p>
                  <p className="text-[10px] text-[#666] font-mono">{tech.detail}</p>
                  <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-aegis-accent/20" />
                </div>
              </RevealSection>
            ))}
          </div>

          {/* Infrastructure metadata */}
          <RevealSection delay={0.3}>
            <div className="flex items-center gap-4 mt-6 text-[7px] font-mono text-[#555] tracking-wider">
              <span>RUNTIME: Python 3.11</span>
              <span className="text-[#333]">|</span>
              <span>FRAMEWORK: FastAPI 0.109</span>
              <span className="text-[#333]">|</span>
              <span>ANALYSIS: Parallel execution</span>
            </div>
          </RevealSection>
        </div>
      </RevealSection>

      {/* ─── Final CTA ─── */}
      <RevealSection className="py-28 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-aegis-accent mb-5">
            Start Scanning
          </p>
          <h2 className="text-[2rem] md:text-[2.75rem] font-light tracking-[-0.02em] leading-[1.1] mb-5">
            Secure your contracts{" "}
            <span className="font-semibold">before deployment.</span>
          </h2>
          <p className="text-[14px] text-aegis-text-secondary mb-8 max-w-lg leading-relaxed">
            Upload your Solidity contract and receive a full security analysis
            with attack paths, severity rankings, and remediation guidance.
          </p>
          <div className="flex items-center gap-3 mb-6">
            <Link
              href="/scan"
              className="inline-flex items-center gap-2 bg-aegis-text text-white px-5 py-2.5 rounded-md font-medium text-[13px] hover:bg-aegis-text/90 transition-all"
            >
              Start Scanning
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M3.5 8H12.5M12.5 8L8.5 4M12.5 8L8.5 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
          <div className="flex items-center gap-4 text-[7px] font-mono text-[#888] tracking-wider border-t border-black/[0.06] pt-4">
            <span>CONTRACT: .sol / .vy</span>
            <span className="text-[#ccc]">|</span>
            <span>ENGINE: Aegis Core</span>
            <span className="text-[#ccc]">|</span>
            <span>VERSION: 1.0.0</span>
            <span className="text-[#ccc] hidden sm:inline">|</span>
            <span className="hidden sm:inline">SCAN TIME: ~0.8s</span>
          </div>
        </div>
      </RevealSection>

      {/* ─── Footer ─── */}
      <motion.footer
        ref={footerRef}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: false, margin: "-60px" }}
        transition={{ duration: 0.6 }}
        className="py-6 px-6 border-t border-black/5"
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-aegis-text-secondary text-[13px]">
              <AegisMark size={14} className="text-aegis-text-secondary" />
              <span>Aegis Security</span>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-[11px] text-aegis-text-secondary">
                Smart Contract Security Analysis
              </p>
              <span className="text-[8px] font-mono text-[#888] tracking-wider border border-black/[0.08] px-1.5 py-0.5 hidden sm:inline-block">
                v1.0.0
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-[7px] font-mono text-[#888] tracking-wider border-t border-black/[0.05] pt-3">
            <span>AEGIS SECURITY ENGINE</span>
            <span className="text-[#ccc]">|</span>
            <span>SMART CONTRACT ANALYSIS PLATFORM</span>
            <span className="text-[#ccc]">|</span>
            <span>SOLIDITY 0.8.x</span>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
