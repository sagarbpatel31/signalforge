import { describe, expect, it } from "vitest";

import {
  emptyDailyProgress,
  mergeDailyProgress,
  pacificDateKey,
  signalProgressId,
} from "./daily";

describe("daily workflow helpers", () => {
  it("uses the Pacific calendar date around UTC rollover", () => {
    expect(pacificDateKey(new Date("2026-08-12T06:30:00Z"))).toBe("2026-08-11");
    expect(pacificDateKey(new Date("2026-08-12T08:30:00Z"))).toBe("2026-08-12");
  });

  it("merges same-day progress and keeps the newest day", () => {
    const local = {
      ...emptyDailyProgress("2026-08-11"),
      reviewedSignalIds: ["signal-a"],
      completedTaskIds: ["task-a"],
    };
    const remote = {
      ...emptyDailyProgress("2026-08-11"),
      reviewedSignalIds: ["signal-b"],
      postDone: true,
    };

    expect(mergeDailyProgress(local, remote)).toEqual({
      date: "2026-08-11",
      updatedAt: "",
      reviewedSignalIds: ["signal-b", "signal-a"],
      completedTaskIds: ["task-a"],
      postDone: true,
    });
    expect(mergeDailyProgress(emptyDailyProgress("2026-08-12"), remote).date)
      .toBe("2026-08-12");
  });

  it("keeps an explicit newer reset instead of restoring stale progress", () => {
    const staleRemote = {
      ...emptyDailyProgress("2026-08-11"),
      updatedAt: "2026-08-11T18:00:00.000Z",
      completedTaskIds: ["task-a"],
      postDone: true,
    };
    const localReset = {
      ...emptyDailyProgress("2026-08-11"),
      updatedAt: "2026-08-11T18:01:00.000Z",
    };

    expect(mergeDailyProgress(localReset, staleRemote)).toEqual(localReset);
  });

  it("creates deterministic signal ids from visible content", () => {
    const signal = {
      label: "EDGE",
      delta: "+8",
      color: "cyan" as const,
      text: "On-device inference demand is increasing.",
    };
    expect(signalProgressId(signal)).toBe(signalProgressId({ ...signal }));
    expect(signalProgressId(signal)).toMatch(/^signal:edge:/);
  });
});
