import { NextResponse } from "next/server";
import { fetchVSNPrice } from "@/services/price";
import {
  fetchStakedVision,
  fetchTotalVisionSupply,
  getSvsnSubgraphUrl,
  getVsnSubgraphUrl,
} from "@/services/graph";

export async function POST() {
  const vsnQueryUrl = getVsnSubgraphUrl();
  const svsnQueryUrl = getSvsnSubgraphUrl();

  const [totalVisionSupply, stakedVision, currentPrice] = await Promise.all([
    fetchTotalVisionSupply(vsnQueryUrl),
    fetchStakedVision(svsnQueryUrl),
    fetchVSNPrice(),
  ]);

  return NextResponse.json({
    data: {
      totalVisionSupply,
      stakedVision,
      currentPrice,
    },
  });
}
