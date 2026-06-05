import { describe, expect, it } from "vitest";
import type { Task } from "./types";

const sampleTask: Task = {
  id: "startup:demo",
  priority: "P1",
  task: "Research startup: Demo",
  domain: "Edge AI",
  time: "30m",
};

describe("workbench task shape", () => {
  it("supports string task ids for local queued work", () => {
    expect(typeof sampleTask.id).toBe("string");
    expect(sampleTask.task).toContain("Research startup");
  });
});
