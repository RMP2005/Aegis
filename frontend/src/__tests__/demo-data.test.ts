import { describe, it, expect } from "vitest";

describe("demo-data", () => {
  it("exports demo contracts", async () => {
    const { DEMO_CONTRACTS } = await import("@/lib/demo-data");
    expect(Object.keys(DEMO_CONTRACTS)).toHaveLength(3);
    expect(DEMO_CONTRACTS["Reentrancy.sol"]).toContain("pragma solidity");
    expect(DEMO_CONTRACTS["AccessControl.sol"]).toContain("pragma solidity");
    expect(DEMO_CONTRACTS["IntegerIssue.sol"]).toContain("pragma solidity");
  });

  it("exports demo vulnerabilities", async () => {
    const { DEMO_VULNERABILITIES } = await import("@/lib/demo-data");
    expect(DEMO_VULNERABILITIES.length).toBeGreaterThan(0);
    DEMO_VULNERABILITIES.forEach((v) => {
      expect(v).toHaveProperty("severity");
      expect(v).toHaveProperty("title");
      expect(v).toHaveProperty("location");
      expect(v).toHaveProperty("explanation");
      expect(["critical", "high", "medium", "low"]).toContain(v.severity);
    });
  });
});
