import { afterEach, describe, expect, it, vi } from "vitest";

import { ensureSession, getUserHeaders, userIdFromToken } from "./identity";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("identity helpers", () => {
  it("extracts the user id from a signed session token", () => {
    expect(userIdFromToken("u_abc123.deadbeef")).toBe("u_abc123");
  });

  it("rejects values that are not session ids", () => {
    expect(userIdFromToken("sagar-patel.deadbeef")).toBe("");
    expect(userIdFromToken("")).toBe("");
  });

  it("uses the legacy header only for signed local sessions", async () => {
    await expect(getUserHeaders("u_abc123.deadbeef")).resolves.toEqual({
      "X-SignalForge-Token": "u_abc123.deadbeef",
    });
  });

  it("uses bearer authorization for account tokens", async () => {
    await expect(getUserHeaders("ey.account.jwt")).resolves.toEqual({
      Authorization: "Bearer ey.account.jwt",
    });
  });

  it("replaces an explicitly invalid local session", async () => {
    const values = new Map([["sf-session", "u_stale.bad-signature"]]);
    const localStorage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    };
    vi.stubGlobal("window", { localStorage });
    vi.stubGlobal("document", { cookie: "" });
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ authenticated: false }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: "u_fresh.good-signature" }),
      }));

    await expect(ensureSession()).resolves.toBe("u_fresh.good-signature");
    expect(values.get("sf-session")).toBe("u_fresh.good-signature");
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
