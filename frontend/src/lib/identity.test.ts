import { describe, expect, it } from "vitest";

import { deriveUserKey, normalizeUserKey } from "./identity";

describe("identity helpers", () => {
  it("normalizes user keys into a stable storage-safe slug", () => {
    expect(normalizeUserKey("@Sagar Patel")).toBe("sagar-patel");
  });

  it("prefers handle over name when deriving user keys", () => {
    expect(deriveUserKey({
      name: "Sagar Patel",
      handle: "@signalforge",
    })).toBe("signalforge");
  });
});
