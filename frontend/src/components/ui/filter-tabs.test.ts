import { describe, it, expect } from "vitest";
import { matchesFilter } from "./FilterTabs";

describe("matchesFilter", () => {
  it("matches everything when the filter has no tags", () => {
    expect(matchesFilter(["robotics"], [])).toBe(true);
    expect(matchesFilter([], [])).toBe(true);
  });

  it("matches when any item tag is in the filter list", () => {
    expect(matchesFilter(["edge-ai", "embedded"], ["edge-ai"])).toBe(true);
  });

  it("is case-insensitive on the item tags", () => {
    expect(matchesFilter(["Robotics"], ["robotics"])).toBe(true);
  });

  it("returns false when there is no overlap", () => {
    expect(matchesFilter(["llm"], ["robotics", "physical-ai"])).toBe(false);
  });
});
