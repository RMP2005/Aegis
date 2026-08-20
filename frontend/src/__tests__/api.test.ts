import { describe, it, expect } from "vitest";

describe("api types", () => {
  it("exports correct TypeScript interfaces", async () => {
    const mod = await import("@/lib/api");
    expect(mod.scanContract).toBeDefined();
    expect(mod.checkHealth).toBeDefined();
    expect(typeof mod.scanContract).toBe("function");
    expect(typeof mod.checkHealth).toBe("function");
  });
});
