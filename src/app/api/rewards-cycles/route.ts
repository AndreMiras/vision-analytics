import { NextResponse } from "next/server";
import {
  fetchRewardsCycles,
  fetchDistributeRewards,
  getSvsnSubgraphUrl,
} from "@/services/graph";
import { fetchVSNPrice } from "@/services/price";
import {
  CycleAnalytics,
  RewardsCyclesResponse,
} from "@/types/api/rewards-cycles";
import { ConvertedDistributeRewardsEvent } from "@/types/svsn/cycle-events";

const getCycleDistributions = (
  distributions: ConvertedDistributeRewardsEvent[],
  cycleStartTimestamp: number,
  cycleEndTimestamp: number,
) =>
  distributions.filter(
    (d) =>
      d.timestamp >= cycleStartTimestamp && d.timestamp <= cycleEndTimestamp,
  );

const getTotalDistributed = (
  distributions: ConvertedDistributeRewardsEvent[],
) => distributions.reduce((sum, d) => sum + d.rewards, 0);

export async function POST() {
  const queryUrl = getSvsnSubgraphUrl();

  // Fetch cycles (limit to 10 for historical average calculation)
  const [cycles, currentPrice] = await Promise.all([
    fetchRewardsCycles(queryUrl, 10),
    fetchVSNPrice(),
  ]);

  // Find current or most recent cycle
  const currentCycle =
    cycles.find((c) => c.status === "ongoing") || cycles[0] || null;

  let currentCycleAnalytics: CycleAnalytics | null = null;

  if (currentCycle) {
    const distributions = await fetchDistributeRewards(
      queryUrl,
      currentCycle.blockTimestamp,
    );

    const cycleDistributions = getCycleDistributions(
      distributions,
      currentCycle.blockTimestamp,
      currentCycle.rewardsCycleEndTimestamp,
    );

    const totalDistributed = getTotalDistributed(cycleDistributions);

    currentCycleAnalytics = {
      cycle: currentCycle,
      distributions: cycleDistributions,
      totalDistributed,
      remainingBudget: currentCycle.rewardsCycleAmount - totalDistributed,
      distributionCount: cycleDistributions.length,
      averageDistribution:
        cycleDistributions.length > 0
          ? totalDistributed / cycleDistributions.length
          : 0,
      utilizationPercent:
        currentCycle.rewardsCycleAmount > 0
          ? (totalDistributed / currentCycle.rewardsCycleAmount) * 100
          : 0,
    };
  }

  // Calculate historical averages from completed cycles
  const completedCycles = cycles.filter((c) => c.status === "completed");

  let historicalAverage = null;
  if (completedCycles.length > 0) {
    const avgDuration =
      completedCycles.reduce((sum, c) => sum + c.duration, 0) /
      completedCycles.length;

    const earliestCompletedCycleStart = Math.min(
      ...completedCycles.map((c) => c.blockTimestamp),
    );
    const historicalDistributions = await fetchDistributeRewards(
      queryUrl,
      earliestCompletedCycleStart,
    );

    const completedCycleStats = completedCycles.map((cycle) => {
      const cycleDistributions = getCycleDistributions(
        historicalDistributions,
        cycle.blockTimestamp,
        cycle.rewardsCycleEndTimestamp,
      );
      const totalDistributed = getTotalDistributed(cycleDistributions);

      return {
        totalDistributed,
        distributionCount: cycleDistributions.length,
      };
    });

    const totalDistributed = completedCycleStats.reduce(
      (sum, stats) => sum + stats.totalDistributed,
      0,
    );
    const distributionCount = completedCycleStats.reduce(
      (sum, stats) => sum + stats.distributionCount,
      0,
    );

    historicalAverage = {
      cycleDuration: avgDuration,
      totalDistributed: totalDistributed / completedCycles.length,
      distributionCount: distributionCount / completedCycles.length,
      averageDistribution:
        distributionCount > 0 ? totalDistributed / distributionCount : 0,
    };
  }

  const response: RewardsCyclesResponse = {
    currentCycle: currentCycleAnalytics,
    historicalAverage,
    currentPrice,
  };

  return NextResponse.json({ data: response });
}
