import { NextResponse } from "next/server";
import { fetchUnstakingSnapshots, getSvsnSubgraphUrl } from "@/services/graph";
import { fetchVSNPrice } from "@/services/price";

export async function POST() {
  const queryUrl = getSvsnSubgraphUrl();

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
