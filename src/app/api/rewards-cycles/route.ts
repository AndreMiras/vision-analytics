import { NextResponse } from "next/server";
import {
  fetchRewardsCycles,
  fetchDistributeRewards,
  getSvsnSubgraphUrl,
} from "@/services/graph";
import { fetchVSNPrice } from "@/services/price";
import {
  CycleAnalytics,
  RewardsCycleSummary,
  RewardsCyclesResponse,
} from "@/types/api/rewards-cycles";
import {
  ConvertedDistributeRewardsEvent,
  ConvertedRewardsCycle,
} from "@/types/svsn/cycle-events";

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

const summarizeCycle = (
  cycle: ConvertedRewardsCycle,
  distributions: ConvertedDistributeRewardsEvent[],
): RewardsCycleSummary => {
  const cycleDistributions = getCycleDistributions(
    distributions,
    cycle.blockTimestamp,
    cycle.rewardsCycleEndTimestamp,
  );
  const totalDistributed = getTotalDistributed(cycleDistributions);

  return {
    cycle,
    totalDistributed,
    remainingBudget: cycle.rewardsCycleAmount - totalDistributed,
    distributionCount: cycleDistributions.length,
    averageDistribution:
      cycleDistributions.length > 0
        ? totalDistributed / cycleDistributions.length
        : 0,
    utilizationPercent:
      cycle.rewardsCycleAmount > 0
        ? (totalDistributed / cycle.rewardsCycleAmount) * 100
        : 0,
  };
};

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

  const distributions =
    cycles.length > 0
      ? await fetchDistributeRewards(
          queryUrl,
          Math.min(...cycles.map((cycle) => cycle.blockTimestamp)),
        )
      : [];
  const cycleSummaries = cycles.map((cycle) =>
    summarizeCycle(cycle, distributions),
  );

  let currentCycleAnalytics: CycleAnalytics | null = null;

  if (currentCycle) {
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

    const completedCycleStats = cycleSummaries.filter(
      (summary) => summary.cycle.status === "completed",
    );

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
    cycles: cycleSummaries,
  };

  return NextResponse.json({ data: response });
}
