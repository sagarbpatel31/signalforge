import { describe, expect, it } from "vitest";

import { userIdFromToken } from "./identity";

describe("identity helpers", () => {
  it("extracts the user id from a signed session token", () => {
    expect(userIdFromToken("u_abc123.deadbeef")).toBe("u_abc123");
  });

  it("rejects values that are not session ids", () => {
    expect(userIdFromToken("sagar-patel.deadbeef")).toBe("");
    expect(userIdFromToken("")).toBe("");
  });
});
