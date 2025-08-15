import { strict as assert } from "assert";
import { NextRequest, NextResponse } from "next/server";
import { fetchPerformanceSnapshots, fetchTVLSnapshots } from "@/services/graph";

type MetricType = "performance" | "tvl";

const metricFetchers = {
  performance: fetchPerformanceSnapshots,
  tvl: fetchTVLSnapshots,
} as const;

const isValidMetricType = (type: string): type is MetricType =>
  Object.keys(metricFetchers).includes(type);

export async function POST(request: NextRequest) {
  const { timeframe, type = "performance" } = await request.json();

  if (!isValidMetricType(type)) {
    const validTypes = Object.keys(metricFetchers).join(", ");
    return NextResponse.json(
      { error: `Invalid metric type. Must be one of: ${validTypes}` },
      { status: 400 },
    );
  }

  const apiKey = process.env.THE_GRAPH_API_KEY;
  const subgraphId = "AFHGugzAJbgBSRvNnjEx4c1Wya5M4oMAWa5RsNnjQCrs";
  const queryUrl = `https://gateway.thegraph.com/api/${apiKey}/subgraphs/id/${subgraphId}`;
  const dayInSeconds = 24 * 60 * 60;
  const startTime = isNaN(timeframe)
    ? 1
    : Math.floor(Date.now() / 1000) - timeframe * dayInSeconds;
  const fetchMetrics = metricFetchers[type as keyof typeof metricFetchers];
  assert(fetchMetrics, `No fetcher found for type: ${type}`);
  const yieldSnapshots = await fetchMetrics(queryUrl, startTime);

  return NextResponse.json({
    data: {
      yieldSnapshots,
      type,
      timeframe,
    },
  });
}
