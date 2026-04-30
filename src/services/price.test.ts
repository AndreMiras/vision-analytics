import { fetchVSNPrice } from "@/services/price";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

let fetchMock: ReturnType<typeof vi.fn<typeof fetch>>;

const jsonResponse = (body: unknown) =>
  new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json" },
  });

const getRequestInit = (callIndex: number): RequestInit => {
  const init = fetchMock.mock.calls[callIndex]?.[1];

  if (!init) {
    throw new Error(`Missing request init for fetch call ${callIndex}`);
  }

  return init;
};

describe("fetchVSNPrice", () => {
  beforeEach(() => {
    fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("posts to LiveCoinWatch with the configured api key, body, and Next.js fetch metadata", async () => {
    vi.stubEnv("LIVECOINWATCH_API_KEY", "test-api-key");
    fetchMock.mockResolvedValueOnce(jsonResponse({ rate: 1.23 }));

    const result = await fetchVSNPrice();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.livecoinwatch.com/coins/single",
      expect.objectContaining({
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": "test-api-key",
        },
        body: JSON.stringify({
          currency: "USD",
          code: "_VSN",
          meta: false,
        }),
        next: {
          revalidate: 3600,
          tags: ["vsn-price"],
        },
      }),
    );
    expect(result).toBe(1.23);
  });

  it("falls back to an empty x-api-key header when LIVECOINWATCH_API_KEY is unset", async () => {
    const originalKey = process.env.LIVECOINWATCH_API_KEY;
    delete process.env.LIVECOINWATCH_API_KEY;
    try {
      fetchMock.mockResolvedValueOnce(jsonResponse({ rate: 0 }));

      await fetchVSNPrice();

      const init = getRequestInit(0);
      const headers = init.headers as Record<string, string>;
      expect(headers["x-api-key"]).toBe("");
    } finally {
      if (originalKey !== undefined) {
        process.env.LIVECOINWATCH_API_KEY = originalKey;
      }
    }
  });
});
