import { describe, expect, it } from "vitest";
import {
  formatVerifiedDate,
  freshnessRank,
  getFreshnessState,
  currentCuratedItems,
  sortCuratedItems,
} from "./curated";

const NOW = new Date("2026-08-11T19:00:00Z");

describe("curated freshness", () => {
  it("uses content-specific freshness windows", () => {
    expect(getFreshnessState("2026-08-09", "brief", NOW)).toBe("current");
    expect(getFreshnessState("2026-08-08", "brief", NOW)).toBe("stale");
    expect(getFreshnessState("2026-08-04", "role", NOW)).toBe("current");
    expect(getFreshnessState("2026-08-03", "role", NOW)).toBe("stale");
    expect(getFreshnessState("2026-07-12", "startup", NOW)).toBe("current");
    expect(getFreshnessState("2026-07-11", "opportunity", NOW)).toBe("stale");
    expect(getFreshnessState("2026-05-13", "paper", NOW)).toBe("current");
    expect(getFreshnessState("2026-05-12", "paper", NOW)).toBe("stale");
  });

  it("treats missing, invalid, and future dates as unverified", () => {
    expect(getFreshnessState(undefined, "startup", NOW)).toBe("unverified");
    expect(getFreshnessState("not-a-date", "startup", NOW)).toBe("unverified");
    expect(getFreshnessState("2026-08-12", "startup", NOW)).toBe("unverified");
  });

  it("formats ISO dates without local-time drift", () => {
    expect(formatVerifiedDate("2026-08-11")).toBe("Aug 11, 2026");
    expect(formatVerifiedDate("bad")).toBe("Unknown");
  });

  it("sorts current content before stale and unverified content", () => {
    expect(["unverified", "current", "stale"].sort((a, b) =>
      freshnessRank(a as "current" | "stale" | "unverified") -
      freshnessRank(b as "current" | "stale" | "unverified")
    )).toEqual(["current", "stale", "unverified"]);

    const items = [
      { id: "unverified" },
      { id: "stale", last_verified: "2026-07-01" },
      { id: "current", last_verified: "2026-08-11" },
    ];
    expect(sortCuratedItems(items, "startup", NOW).map((item) => item.id)).toEqual([
      "current",
      "stale",
      "unverified",
    ]);
    expect(currentCuratedItems(items, "startup", NOW).map((item) => item.id)).toEqual([
      "current",
    ]);
  });
});
