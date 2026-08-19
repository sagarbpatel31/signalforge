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

  it("reports a failed source while preserving its cached count", () => {
    const result = summarizeFeedStatus({
      last_refresh: new Date().toISOString(),
      counts: { news: 5, jobs: 3, papers: 2 },
      source_mode: "degraded",
      source_detail: "Serving last-known-good data; source issues: jobs.",
      sources: {
        news: { status: "healthy", item_count: 5 },
        papers: { status: "healthy", item_count: 2 },
        jobs: { status: "error", item_count: 3, error_code: "timeout" },
      },
    });

    expect(result.label).toBe("Degraded intelligence");
    expect(result.sources.find((source) => source.key === "jobs")).toMatchObject({
      status: "error",
      itemCount: 3,
    });
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
      sourced_fact: "Robotics teams are adopting agent workflows.",
      editorial_take: "A middleware bridge is a strong fit for this profile.",
      last_verified: "2026-08-11",
      sources: [{ label: "Example", url: "https://example.com", published_at: "2026-08-11" }],
    },
    {
      rank: "02",
      title: "Zephyr RTOS Medical Stack",
      domain: "Embedded",
      signal: "HIGH",
      fit: 88,
      why: "Medical compliance tooling opportunity.",
      sourced_fact: "Medical firmware requires compliance tooling.",
      editorial_take: "This is less aligned with the active profile.",
      last_verified: "2026-08-11",
      sources: [{ label: "Example", url: "https://example.com", published_at: "2026-08-11" }],
    },
  ];

  it("pushes profile-aligned opportunities to the top", () => {
    const ranked = rankOpportunitiesForProfile(opportunities, profile);

    expect(ranked[0].title).toBe("ROS2 ↔ LLM Middleware Bridge");
    expect(ranked[0].matchReasons[0]).toContain("Matches your");
  });
});
