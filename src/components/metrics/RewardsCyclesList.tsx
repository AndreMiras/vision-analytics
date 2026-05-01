import { CheckCircle2, Loader2 } from "lucide-react";
import { formatUSDValue, toHumanReadable } from "@/lib/utils";
import { RewardsCycleSummary } from "@/types/api/rewards-cycles";
import { toLocaleDateString } from "@/utils/time";

interface RewardsCyclesListProps {
  cycles: RewardsCycleSummary[];
  currentPrice: number;
  loading?: boolean;
}

const formatTokens = (value: number) => `${toHumanReadable(value)} VSN`;

const formatDate = (timestamp: number) =>
  toLocaleDateString(new Date(timestamp * 1000));

const statusMeta = {
  ongoing: {
    label: "Ongoing",
    icon: Loader2,
    iconClass: "text-green-500 animate-spin",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    iconClass: "text-blue-500",
  },
  upcoming: {
    label: "Upcoming",
    icon: Loader2,
    iconClass: "text-yellow-500",
  },
} as const;

export const RewardsCyclesList = ({
  cycles,
  currentPrice,
  loading = false,
}: RewardsCyclesListProps) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            className="p-4 border rounded-lg animate-pulse space-y-3"
          >
            <div className="flex justify-between">
              <div className="w-40 h-4 bg-gray-200 rounded" />
              <div className="w-24 h-4 bg-gray-200 rounded" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[...Array(4)].map((__, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="w-20 h-3 bg-gray-200 rounded" />
                  <div className="w-16 h-4 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (cycles.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No rewards cycles found
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {cycles.map(
        ({
          cycle,
          totalDistributed,
          remainingBudget,
          distributionCount,
          utilizationPercent,
        }) => {
          const meta = statusMeta[cycle.status];
          const StatusIcon = meta.icon;
          const allocatedUSD = formatUSDValue(
            cycle.rewardsCycleAmount * currentPrice,
          );
          const distributedUSD = formatUSDValue(
            totalDistributed * currentPrice,
          );
          const remainingUSD = formatUSDValue(remainingBudget * currentPrice);

          return (
            <div
              key={cycle.id}
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex flex-wrap justify-between gap-2 items-center">
                <div className="flex items-center gap-2">
                  <StatusIcon className={`w-4 h-4 ${meta.iconClass}`} />
                  <span className="font-medium">{meta.label}</span>
                </div>
                <div className="text-sm text-gray-600">
                  {formatDate(cycle.blockTimestamp)}
                  {" -> "}
                  {formatDate(cycle.rewardsCycleEndTimestamp)}
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div>
                  <div className="text-gray-500">Allocated</div>
                  <div className="font-medium">
                    {formatTokens(cycle.rewardsCycleAmount)}
                  </div>
                  <div className="text-gray-500 text-xs">{allocatedUSD}</div>
                </div>
                <div>
                  <div className="text-gray-500">Distributed</div>
                  <div className="font-medium">
                    {formatTokens(totalDistributed)}
                  </div>
                  <div className="text-gray-500 text-xs">{distributedUSD}</div>
                </div>
                <div>
                  <div className="text-gray-500">Remaining</div>
                  <div className="font-medium">
                    {formatTokens(remainingBudget)}
                  </div>
                  <div className="text-gray-500 text-xs">{remainingUSD}</div>
                </div>
                <div>
                  <div className="text-gray-500">Utilization</div>
                  <div className="font-medium">
                    {utilizationPercent.toFixed(1)}%
                  </div>
                  <div className="text-gray-500 text-xs">
                    {distributionCount} event
                    {distributionCount === 1 ? "" : "s"}
                  </div>
                </div>
              </div>
            </div>
          );
        },
      )}
    </div>
  );
};
