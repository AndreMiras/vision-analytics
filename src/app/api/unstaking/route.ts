import { NextRequest, NextResponse } from "next/server";
import { fetchUnstakingSnapshots, getSubgraphUrl } from "@/services/graph";
import { fetchVSNPrice } from "@/services/price";

export async function POST(request: NextRequest) {
  const queryUrl = getSubgraphUrl();

  const [unstakingSnapshots, currentPrice] = await Promise.all([
    fetchUnstakingSnapshots(queryUrl),
    fetchVSNPrice(),
  ]);
  return NextResponse.json({
    data: {
      currentPrice,
      unstakingSnapshots,
    },
  });
}
