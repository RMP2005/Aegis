"use client";

import { useState } from "react";
import Sidebar from "@/components/workspace/Sidebar";
import { motion } from "framer-motion";

const PATTERNS = [
  {
    id: "reentrancy",
    title: "Reentrancy",
    severity: "critical" as const,
    category: "State Management",
    cwe: "CWE-841",
    description:
      "A contract invokes an external contract before updating its own state. The external contract can call back into the vulnerable function, re-entering the same code path before the first execution completes.",
    impact: "Full drain of contract funds. Attacker can repeatedly withdraw without balance deduction.",
    example: `function withdraw(uint256 amount) external {
    require(balances[msg.sender] >= amount);

    // External call before state update
    (bool success, ) = msg.sender.call{value: amount}("");
    require(success);

    // State updated AFTER the external call
    balances[msg.sender] -= amount;
}`,
    fix: `function withdraw(uint256 amount) external {
    require(balances[msg.sender] >= amount);

    // State updated BEFORE the external call
    balances[msg.sender] -= amount;

    (bool success, ) = msg.sender.call{value: amount}("");
    require(success);
}`,
    detectionCount: 2847,
    lastSeen: "2026-08-19",
  },
  {
    id: "access-control",
    title: "Access Control",
    severity: "high" as const,
    category: "Authorization",
    cwe: "CWE-862",
    description:
      "Critical administrative functions lack proper access restrictions, or use insecure authorization checks like tx.origin instead of msg.sender. Allows unauthorized users to execute privileged operations.",
    impact: "Ownership takeover, fund theft, contract parameter manipulation, or complete contract compromise.",
    example: `function changeOwner(address newOwner) external {
    // tx.origin check is vulnerable to phishing
    require(tx.origin == owner, "Not owner");
    owner = newOwner;
}

function setAuthorized(address user, bool status) external {
    // No access control at all
    authorized[user] = status;
}`,
    fix: `function changeOwner(address newOwner) external {
    require(msg.sender == owner, "Not owner");
    owner = newOwner;
}

function setAuthorized(address user, bool status) external {
    require(msg.sender == owner, "Not owner");
    authorized[user] = status;
}`,
    detectionCount: 1923,
    lastSeen: "2026-08-18",
  },
  {
    id: "integer-overflow",
    title: "Integer Issues",
    severity: "medium" as const,
    category: "Arithmetic",
    cwe: "CWE-190",
    description:
      "Arithmetic operations that can overflow or underflow without proper checks. While Solidity 0.8+ has built-in overflow checks, unchecked blocks and legacy code can still be vulnerable.",
    impact: "Token minting, balance manipulation, or unexpected contract behavior due to arithmetic wraparound.",
    example: `function calculateReward(address user) external view returns (uint256) {
    uint256 timeSinceLast = block.timestamp - lastDeposit[user];
    // Potential underflow if lastDeposit > block.timestamp
    uint256 reward = balances[user] * timeSinceLast / 1 days;
    // Potential overflow with large balances
    return reward;
}`,
    fix: `function calculateReward(address user) external view returns (uint256) {
    require(block.timestamp > lastDeposit[user], "Invalid timestamp");
    uint256 timeSinceLast = block.timestamp - lastDeposit[user];
    uint256 reward = (balances[user] * timeSinceLast) / 1 days;
    return reward;
}`,
    detectionCount: 1456,
    lastSeen: "2026-08-17",
  },
  {
    id: "unchecked-return",
    title: "Unchecked Return Value",
    severity: "high" as const,
    category: "Error Handling",
    cwe: "CWE-252",
    description:
      "Low-level calls (call, send, delegatecall) return a boolean indicating success or failure. Ignoring this return value means failed transfers go undetected, potentially leaving the contract in an inconsistent state.",
    impact: "Failed ETH transfers go unnoticed. Contract state may become desynchronized with actual balances.",
    example: `function safeWithdraw(uint256 amount) external {
    require(balances[msg.sender] >= amount);
    balances[msg.sender] -= amount;

    // Return value not checked
    msg.sender.call{value: amount}("");
}`,
    fix: `function safeWithdraw(uint256 amount) external {
    require(balances[msg.sender] >= amount);
    balances[msg.sender] -= amount;

    (bool success, ) = msg.sender.call{value: amount}("");
    require(success, "Transfer failed");
}`,
    detectionCount: 2103,
    lastSeen: "2026-08-19",
  },
  {
    id: "tx-origin",
    title: "tx.origin Authorization",
    severity: "critical" as const,
    category: "Authorization",
    cwe: "CWE-346",
    description:
      "Using tx.origin for authorization is fundamentally unsafe. tx.origin always refers to the externally-owned account (EOA) that initiated the transaction, not the immediate caller. A malicious contract can relay calls through a victim's EOA.",
    impact: "Complete ownership takeover. Attacker can drain all funds and take over administrative functions.",
    example: `function changeOwner(address newOwner) external {
    require(tx.origin == owner, "Not owner");
    // Attacker tricks owner into calling malicious contract
    // tx.origin is still the owner's EOA
    owner = newOwner;
}`,
    fix: `function changeOwner(address newOwner) external {
    require(msg.sender == owner, "Not owner");
    // Only the direct caller is authorized
    owner = newOwner;
}`,
    detectionCount: 892,
    lastSeen: "2026-08-16",
  },
  {
    id: "selfdestruct",
    title: "Self-Destruct Abuse",
    severity: "high" as const,
    category: "Contract Lifecycle",
    cwe: "CWE-248",
    description:
      "Unprotected selfdestruct or suicide calls allow anyone to destroy the contract, permanently locking any remaining funds or breaking dependent contracts.",
    impact: "Permanent contract destruction. All funds locked forever. Dependent protocols break.",
    example: `function destroy() external {
    // No access control
    selfdestruct(payable(msg.sender));
}`,
    fix: `function destroy() external onlyOwner {
    require(address(this).balance == 0, "Contract has funds");
    selfdestruct(payable(msg.sender));
}`,
    detectionCount: 634,
    lastSeen: "2026-08-15",
  },
];

const SEVERITY_COLORS = {
  critical: { text: "text-aegis-critical", bg: "bg-aegis-critical-bg", border: "border-aegis-critical/20" },
  high: { text: "text-aegis-high", bg: "bg-aegis-high-bg", border: "border-aegis-high/20" },
  medium: { text: "text-aegis-medium", bg: "bg-aegis-medium-bg", border: "border-aegis-medium/20" },
  low: { text: "text-aegis-low", bg: "bg-aegis-low-bg", border: "border-aegis-low/20" },
};

export default function PatternsPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const filtered = PATTERNS.filter((p) => {
    const matchesFilter = filter === "all" || p.severity === filter;
    const matchesSearch = search === "" || 
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      p.cwe.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });
  const active = PATTERNS.find((p) => p.id === selected);

  return (
    <div className="flex h-screen bg-aegis-dark bg-grid-dark text-white">
      <Sidebar />
      <main className="flex-1 ml-[220px] overflow-y-auto">
        <div className="max-w-5xl mx-auto px-8 py-10">
          {/* Header */}
          <div className="mb-8">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#555] mb-2 font-mono">03 / Intelligence</p>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Vulnerability Patterns</h1>
            <p className="text-sm text-[#666] max-w-lg">
              Known vulnerability patterns detected across thousands of smart contract audits. Each pattern includes detection counts, real-world examples, and verified fixes.
            </p>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 mb-4">
            {["all", "critical", "high", "medium", "low"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded text-[11px] font-medium transition-colors ${
                  filter === f
                    ? f === "all"
                      ? "bg-white/10 text-white"
                      : `${SEVERITY_COLORS[f as keyof typeof SEVERITY_COLORS].bg} ${SEVERITY_COLORS[f as keyof typeof SEVERITY_COLORS].text}`
                    : "text-[#555] hover:text-[#888] hover:bg-white/[0.03]"
                }`}
              >
                {f === "all" ? "All Patterns" : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
            <span className="text-[10px] text-[#444] ml-2 font-mono">{filtered.length} patterns</span>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search vulnerabilities..."
                className="w-full bg-aegis-dark-surface border border-aegis-dark-border rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-[#444] focus:outline-none focus:border-aegis-accent/40 transition-colors"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] hover:text-white transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Pattern Grid */}
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-[#666] mb-1">No patterns found</p>
              <p className="text-xs text-[#444]">Try adjusting your search or filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filtered.map((pattern) => {
              const colors = SEVERITY_COLORS[pattern.severity];
              return (
                <motion.button
                  key={pattern.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setSelected(selected === pattern.id ? null : pattern.id)}
                  className={`text-left p-4 rounded-lg border transition-colors ${
                    selected === pattern.id
                      ? `${colors.border} ${colors.bg}`
                      : "border-aegis-dark-border hover:border-[#333]"
                  } bg-aegis-dark-surface`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] uppercase tracking-wider font-medium ${colors.text}`}>
                      {pattern.severity}
                    </span>
                    <span className="text-[10px] text-[#444] font-mono">{pattern.cwe}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-1">{pattern.title}</h3>
                  <p className="text-[11px] text-[#666] line-clamp-2 leading-relaxed">{pattern.description}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="text-[10px] text-[#555]">{pattern.detectionCount.toLocaleString()} detections</span>
                    <span className="text-[10px] text-[#444]">Last seen {pattern.lastSeen}</span>
                  </div>
                </motion.button>
              );
            })}
            </div>
          )}

          {/* Detail Panel */}
          {active && (
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 border border-aegis-dark-border rounded-lg bg-aegis-dark-surface overflow-hidden"
            >
              <div className="p-6 border-b border-aegis-dark-border">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded ${SEVERITY_COLORS[active.severity].bg} ${SEVERITY_COLORS[active.severity].text}`}>
                    {active.severity}
                  </span>
                  <span className="text-[10px] text-[#555] font-mono">{active.cwe}</span>
                  <span className="text-[10px] text-[#444]">{active.category}</span>
                </div>
                <h2 className="text-xl font-bold text-white mb-2">{active.title}</h2>
                <p className="text-sm text-[#888] leading-relaxed">{active.description}</p>
              </div>

              <div className="grid grid-cols-2 divide-x divide-aegis-dark-border">
                {/* Vulnerable Code */}
                <div className="p-5">
                  <p className="text-[10px] uppercase tracking-wider text-aegis-critical font-medium mb-3">Vulnerable Pattern</p>
                  <pre className="text-[11px] font-mono text-[#999] leading-relaxed overflow-x-auto bg-[#0A0A0C] rounded p-3 border border-aegis-dark-border">
                    <code>{active.example}</code>
                  </pre>
                </div>

                {/* Fixed Code */}
                <div className="p-5">
                  <p className="text-[10px] uppercase tracking-wider text-aegis-success font-medium mb-3">Recommended Fix</p>
                  <pre className="text-[11px] font-mono text-[#999] leading-relaxed overflow-x-auto bg-[#0A0A0C] rounded p-3 border border-aegis-dark-border">
                    <code>{active.fix}</code>
                  </pre>
                </div>
              </div>

              <div className="p-5 border-t border-aegis-dark-border">
                <p className="text-[10px] uppercase tracking-wider text-aegis-accent font-medium mb-2">Impact</p>
                <p className="text-xs text-[#888] leading-relaxed">{active.impact}</p>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
