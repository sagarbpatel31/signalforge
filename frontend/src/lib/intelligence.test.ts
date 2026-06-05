import { describe, expect, it } from "vitest";
import { formatRelativeRefresh, rankOpportunitiesForProfile, summarizeFeedStatus } from "./intelligence";
import type { Opportunity, UserProfile } from "./types";

describe("summarizeFeedStatus", () => {
  it("reports cold cache when no counts are present", () => {
    expect(
      summarizeFeedStatus({
        last_refresh: null,
        counts: {},
        source_mode: "fallback",
        source_detail: "Cache cold.",
      }).label
    ).toBe("Fallback-safe mode");
  });

  it("reports live intelligence when cached signals exist", () => {
    const result = summarizeFeedStatus({
      last_refresh: new Date().toISOString(),
      counts: { news: 5, jobs: 3, papers: 2 },
      source_mode: "live",
      source_detail: "Cache contains 10 tracked feed items.",
    });

    expect(result.label).toBe("Live intelligence");
    expect(result.detail).toContain("10 tracked feed items");
  });
});

describe("formatRelativeRefresh", () => {
  it("formats recent refresh times in minutes", () => {
    const ts = new Date(Date.now() - 5 * 60_000).toISOString();
    expect(formatRelativeRefresh(ts)).toBe("5m ago");
  });
});

describe("rankOpportunitiesForProfile", () => {
  const profile: UserProfile = {
    name: "Sagar Patel",
    handle: "@sagar",
    domains: ["Edge AI", "Robotics"],
    experience: "Senior Engineer",
    goal: "Build a startup",
    current_projects: "ROS2 bridge and edge inference benchmarking",
  };

  const opportunities: Opportunity[] = [
    {
      rank: "01",
      title: "ROS2 ↔ LLM Middleware Bridge",
      domain: "Robotics",
      signal: "MEDIUM",
      fit: 76,
      why: "Bridge for robotics teams building agent workflows.",
    },
    {
      rank: "02",
      title: "Zephyr RTOS Medical Stack",
      domain: "Embedded",
      signal: "HIGH",
      fit: 88,
      why: "Medical compliance tooling opportunity.",
    },
  ];

  it("pushes profile-aligned opportunities to the top", () => {
    const ranked = rankOpportunitiesForProfile(opportunities, profile);

    expect(ranked[0].title).toBe("ROS2 ↔ LLM Middleware Bridge");
    expect(ranked[0].matchReasons[0]).toContain("Matches your");
  });
});
