import { MetricCard } from "./MetricCard";
import { formatDuration } from "@/utils/time";
import { toHumanReadable } from "@/lib/utils";
import { RewardsCyclesResponse } from "@/types/api/rewards-cycles";

interface CycleHistoricalComparisonProps {
  data: RewardsCyclesResponse;
  loading?: boolean;
}

export const CycleHistoricalComparison = ({
  data,
  loading = false,
}: CycleHistoricalComparisonProps) => {
  if (loading || !data.currentCycle || !data.historicalAverage) {
    return null;
  }

  const currentDuration = data.currentCycle.cycle.duration;
  const avgDuration = data.historicalAverage.cycleDuration;

  const durationDiff = currentDuration - avgDuration;
  const durationDiffPercent =
    avgDuration > 0
      ? `${((durationDiff / avgDuration) * 100).toFixed(1)}% vs avg`
      : "No historical avg";

  const currentDistributed = data.currentCycle.totalDistributed;
  const avgDistributed = data.historicalAverage.totalDistributed;

  const distributedDiff = currentDistributed - avgDistributed;
  const distributedDiffPercent =
    avgDistributed > 0
      ? `${((distributedDiff / avgDistributed) * 100).toFixed(1)}% vs avg`
      : "No historical avg";

  return (
    <div className="mt-6 pt-6 border-t">
      <h3 className="text-sm font-medium text-gray-700 mb-4">
        Comparison to Historical Average
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <MetricCard
          value={formatDuration(currentDuration)}
          secondaryValue={durationDiffPercent}
          label="Current Cycle Duration"
        />
        <MetricCard
          value={`${toHumanReadable(currentDistributed)} VSN`}
          secondaryValue={distributedDiffPercent}
          label="Current Distribution"
        />
      </div>
    </div>
  );
};
