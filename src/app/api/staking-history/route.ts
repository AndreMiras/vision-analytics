import { NextResponse } from "next/server";
import {
  fetchStakingRatioHistory,
  getSvsnSubgraphUrl,
  getVsnSubgraphUrl,
} from "@/services/graph";

export async function POST(request: Request) {
  const body = await request.json();
  const daysBack = body.daysBack || 30;

  const vsnQueryUrl = getVsnSubgraphUrl();
  const svsnQueryUrl = getSvsnSubgraphUrl();

  const historyData = await fetchStakingRatioHistory(
    vsnQueryUrl,
    svsnQueryUrl,
    daysBack,
  );

  return NextResponse.json({
    data: historyData,
  });
}
