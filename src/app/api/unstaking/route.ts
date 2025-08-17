import { NextRequest, NextResponse } from "next/server";
import { fetchUnstakingSnapshots, getSubgraphUrl } from "@/services/graph";

export async function POST(request: NextRequest) {
  const queryUrl = getSubgraphUrl();
  const unstakingSnapshots = await fetchUnstakingSnapshots(queryUrl);
  return NextResponse.json({
    data: {
      unstakingSnapshots,
    },
  });
}
