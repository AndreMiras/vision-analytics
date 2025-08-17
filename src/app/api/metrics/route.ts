import { strict as assert } from "assert";
import { NextRequest, NextResponse } from "next/server";
import {
  fetchPerformanceSnapshots,
  fetchTVLSnapshots,
  getSubgraphUrl,
} from "@/services/graph";
import { fetchVSNPrice } from "@/services/price";

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

  const queryUrl = getSubgraphUrl();
  const dayInSeconds = 24 * 60 * 60;
  const startTime = isNaN(timeframe)
    ? 1
    : Math.floor(Date.now() / 1000) - timeframe * dayInSeconds;
  const fetchMetrics = metricFetchers[type as keyof typeof metricFetchers];
  assert(fetchMetrics, `No fetcher found for type: ${type}`);
  const [yieldSnapshots, currentPrice] = await Promise.all([
    fetchMetrics(queryUrl, startTime),
    fetchVSNPrice(),
  ]);

  return NextResponse.json({
    data: {
      currentPrice,
      timeframe,
      type,
      yieldSnapshots,
    },
  });
}
