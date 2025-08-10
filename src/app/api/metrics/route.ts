import { NextRequest, NextResponse } from "next/server";
import { fetchAllYieldSnapshots } from "@/services/graph";

export async function POST(request: NextRequest) {
  const { timeframe } = await request.json();
  const apiKey = process.env.THE_GRAPH_API_KEY;
  const subgraphId = "AFHGugzAJbgBSRvNnjEx4c1Wya5M4oMAWa5RsNnjQCrs";
  const queryUrl = `https://gateway.thegraph.com/api/${apiKey}/subgraphs/id/${subgraphId}`;
  const dayInSeconds = 24 * 60 * 60;
  const startTime = isNaN(timeframe)
    ? 1
    : Math.floor(Date.now() / 1000) - timeframe * dayInSeconds;
  const yieldSnapshots = await fetchAllYieldSnapshots(queryUrl, startTime);
  return NextResponse.json({ data: { yieldSnapshots } });
}
