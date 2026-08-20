"use client";

import { useState, useEffect, useRef } from "react";
import Sidebar from "@/components/workspace/Sidebar";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { getProjects, addProject, type Project } from "@/lib/storage";

function getScoreColor(score: number | null) {
  if (score === null) return "text-[#555]";
  if (score >= 80) return "text-aegis-success";
  if (score >= 50) return "text-aegis-medium";
  if (score >= 30) return "text-aegis-high";
  return "text-aegis-critical";
}

function getScoreRing(score: number | null) {
  if (score === null) return "stroke-[#333]";
  if (score >= 80) return "stroke-aegis-success";
  if (score >= 50) return "stroke-aegis-medium";
  if (score >= 30) return "stroke-aegis-high";
  return "stroke-aegis-critical";
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function ProjectsPage() {
  const [filter, setFilter] = useState<"all" | "active">("all");
  const [projects, setProjects] = useState<Project[]>(() => getProjects());
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newContract, setNewContract] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showModal) return;
    function handleClickOutside(e: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setShowModal(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showModal]);

  const filtered = filter === "all" ? projects : projects.filter((p) => p.status === filter);

  const handleCreate = () => {
    if (!newName.trim() || !newContract.trim()) return;
    const project = addProject({
      name: newName.trim(),
      contractName: newContract.trim(),
      description: newDescription.trim(),
      chain: "Ethereum",
    });
    setProjects((prev) => [project, ...prev]);
    setNewName("");
    setNewContract("");
    setNewDescription("");
    setShowModal(false);
  };

  return (
    <div className="flex h-screen bg-aegis-dark bg-grid-dark text-white">
      <Sidebar />
      <main className="flex-1 ml-[220px] overflow-y-auto">
        <div className="max-w-5xl mx-auto px-8 py-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#555] mb-2 font-mono">01 / Workspace</p>
              <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Projects</h1>
              <p className="text-sm text-[#666] max-w-lg">
                Organize contracts into projects for batch analysis, tracking, and ongoing security monitoring.
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-aegis-accent/10 text-aegis-accent text-xs font-medium hover:bg-aegis-accent/20 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              New Project
            </button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 mb-6">
            {(["all", "active"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded text-[11px] font-medium transition-colors ${
                  filter === f ? "bg-white/10 text-white" : "text-[#555] hover:text-[#888] hover:bg-white/[0.03]"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
            <span className="text-[10px] text-[#444] ml-2 font-mono">{filtered.length} projects</span>
          </div>

          {/* Project Grid */}
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-white/[0.03] flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#444]">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <p className="text-sm text-[#666] mb-2">No projects yet</p>
              <p className="text-xs text-[#444] mb-4">Create a project to organize your contracts.</p>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-aegis-accent/10 text-aegis-accent text-xs font-medium hover:bg-aegis-accent/20 transition-colors"
              >
                Create First Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filtered.map((project, i) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-5 rounded-lg border border-aegis-dark-border bg-aegis-dark-surface hover:border-[#333] transition-colors group"
                >
                  <div className="flex items-start gap-5">
                    {/* Score Ring */}
                    <div className="flex-shrink-0">
                      <div className="relative w-14 h-14">
                        <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                          <circle cx="28" cy="28" r="24" fill="none" stroke="#2A2A2E" strokeWidth="3" />
                          <circle
                            cx="28"
                            cy="28"
                            r="24"
                            fill="none"
                            className={getScoreRing(project.score)}
                            strokeWidth="3"
                            strokeDasharray={project.score !== null ? `${(project.score / 100) * 150.8} 150.8` : "0 150.8"}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className={`text-base font-bold ${getScoreColor(project.score)}`}>
                            {project.score !== null ? project.score : "--"}
                          </span>
                          <span className="text-[8px] text-[#555]">score</span>
                        </div>
                      </div>
                    </div>

                    {/* Project Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-semibold text-white">{project.name}</h3>
                        <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-aegis-success/10 text-aegis-success">
                          {project.status}
                        </span>
                        <span className="text-[10px] text-[#444] font-mono">{project.chain}</span>
                      </div>
                      <p className="text-xs text-[#666] mb-3 max-w-lg">{project.description}</p>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#555]">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                          </svg>
                          <span className="text-[10px] text-[#666]">{project.contractName}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#555]">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                          <span className="text-[10px] text-[#666]">Created {formatDate(project.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* CTA */}
          <div className="mt-8 text-center">
            <Link
              href="/scan"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-aegis-accent/10 text-aegis-accent text-xs font-medium hover:bg-aegis-accent/20 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              Scan a Contract
            </Link>
          </div>
        </div>
      </main>

      {/* New Project Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center"
          >
            <motion.div
              ref={modalRef}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-aegis-dark-card border border-aegis-dark-border rounded-xl p-6 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-white">New Project</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-[#555] hover:text-white transition-colors"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[11px] text-[#888] font-medium mb-1.5 block">Project Name</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. DeFi Vault Protocol"
                    className="w-full bg-[#0A0A0C] border border-aegis-dark-border rounded-lg px-3 py-2 text-sm text-white placeholder-[#444] focus:outline-none focus:border-aegis-accent/40 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#888] font-medium mb-1.5 block">Contract Name</label>
                  <input
                    type="text"
                    value={newContract}
                    onChange={(e) => setNewContract(e.target.value)}
                    placeholder="e.g. Vault.sol"
                    className="w-full bg-[#0A0A0C] border border-aegis-dark-border rounded-lg px-3 py-2 text-sm text-white placeholder-[#444] focus:outline-none focus:border-aegis-accent/40 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#888] font-medium mb-1.5 block">Description</label>
                  <textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Brief description of the project..."
                    rows={3}
                    className="w-full bg-[#0A0A0C] border border-aegis-dark-border rounded-lg px-3 py-2 text-sm text-white placeholder-[#444] focus:outline-none focus:border-aegis-accent/40 transition-colors resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg text-xs text-[#666] hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!newName.trim() || !newContract.trim()}
                  className="px-4 py-2 rounded-lg bg-aegis-accent text-black text-xs font-medium hover:bg-aegis-accent-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Create Project
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
