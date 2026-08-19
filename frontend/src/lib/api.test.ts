import { afterEach, describe, expect, it, vi } from "vitest";

import { generateBriefStream } from "./api";

describe("generateBriefStream", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("reassembles SSE events split across arbitrary network chunks", async () => {
    const expected = {
      market_pulse: "Reliable stream",
      signals: [],
      timestamp: "now",
      source_mode: "live" as const,
      source_detail: "test",
    };
    const wire = [
      'data: {"chunk":"hel',
      'lo"}\n\ndata: {"done":true,"result":',
      `${JSON.stringify(expected)}}\n\n`,
    ];
    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        wire.forEach((chunk) => controller.enqueue(encoder.encode(chunk)));
        controller.close();
      },
    });
    vi.stubGlobal("fetch", vi.fn(async () => new Response(stream, { status: 200 })));
    const chunks: string[] = [];

    const result = await generateBriefStream((chunk) => chunks.push(chunk));

    expect(chunks).toEqual(["hello"]);
    expect(result).toEqual(expected);
  });
});
