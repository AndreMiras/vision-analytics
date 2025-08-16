interface LiveCoinWatchResponse {
  rate: number;
  volume: number;
  cap: number | null;
  liquidity: number;
  delta: {
    hour: number;
    day: number;
    week: number;
    month: number | null;
    quarter: number | null;
    year: number | null;
  };
}

export const fetchVSNPrice = async (): Promise<number> => {
  const apiKey = process.env.LIVECOINWATCH_API_KEY ?? "";
  const response = await fetch("https://api.livecoinwatch.com/coins/single", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({
      currency: "USD",
      code: "_VSN",
      meta: false,
    }),
  });
  const data: LiveCoinWatchResponse = await response.json();
  return data.rate;
};
