import { describe, it, expect, beforeEach } from "vitest";
import {
  getScanHistory,
  addScanHistory,
  getProjects,
  addProject,
  updateProjectScore,
} from "@/lib/storage";

describe("storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("ScanHistory", () => {
    it("returns empty array when no history exists", () => {
      expect(getScanHistory()).toEqual([]);
    });

    it("adds a scan history entry", () => {
      const entry = addScanHistory({
        filename: "Test.sol",
        contract: "Test",
        score: 85,
        critical: 0,
        high: 0,
        medium: 1,
        low: 2,
        duration: "1.2s",
      });

      expect(entry.id).toMatch(/^scan-/);
      expect(entry.status).toBe("completed");
      expect(entry.filename).toBe("Test.sol");
      expect(entry.score).toBe(85);
    });

    it("retrieves added entries in reverse chronological order", () => {
      addScanHistory({
        filename: "First.sol",
        contract: "First",
        score: 90,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        duration: "0.5s",
      });
      addScanHistory({
        filename: "Second.sol",
        contract: "Second",
        score: 50,
        critical: 1,
        high: 1,
        medium: 0,
        low: 0,
        duration: "1.0s",
      });

      const history = getScanHistory();
      expect(history).toHaveLength(2);
      expect(history[0].filename).toBe("Second.sol");
      expect(history[1].filename).toBe("First.sol");
    });
  });

  describe("Projects", () => {
    it("returns default projects on first load", () => {
      const projects = getProjects();
      expect(projects.length).toBeGreaterThan(0);
      expect(projects[0].name).toBe("DeFi Vault Protocol");
    });

    it("adds a new project", () => {
      const project = addProject({
        name: "My Contract",
        contractName: "MyContract.sol",
        description: "A test contract",
        chain: "Ethereum",
      });

      expect(project.id).toMatch(/^proj-/);
      expect(project.status).toBe("active");
      expect(project.score).toBeNull();
      expect(project.name).toBe("My Contract");
    });

    it("updates project score", () => {
      const project = addProject({
        name: "Scored Contract",
        contractName: "Scored.sol",
        description: "Will get a score",
        chain: "Ethereum",
      });

      updateProjectScore(project.id, 72);

      const projects = getProjects();
      const updated = projects.find((p) => p.id === project.id);
      expect(updated?.score).toBe(72);
    });

    it("handles missing project gracefully", () => {
      updateProjectScore("nonexistent-id", 50);
      expect(getProjects()).toBeDefined();
    });
  });
});
