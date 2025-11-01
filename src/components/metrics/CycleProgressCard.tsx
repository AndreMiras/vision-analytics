import { Progress } from "@/components/ui/progress";
import { formatTimeRemaining } from "@/utils/time";
import { ConvertedRewardsCycle } from "@/types/svsn/cycle-events";

interface CycleProgressCardProps {
  cycle: ConvertedRewardsCycle;
  loading?: boolean;
}

export const CycleProgressCard = ({
  cycle,
  loading = false,
}: CycleProgressCardProps) => {
  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-4 bg-gray-200 rounded animate-pulse" />
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  const statusColor = {
    ongoing: "bg-green-500",
    completed: "bg-blue-500",
    upcoming: "bg-yellow-500",
  }[cycle.status];

  const statusLabel = {
    ongoing: "In Progress",
    completed: "Completed",
    upcoming: "Upcoming",
  }[cycle.status];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`h-3 w-3 rounded-full ${statusColor}`} />
          <span className="text-sm font-medium text-gray-700">
            {statusLabel}
          </span>
        </div>
        <span className="text-sm text-gray-500">
          {cycle.status === "ongoing"
            ? `${formatTimeRemaining(cycle.rewardsCycleEndTimestamp)} remaining`
            : new Date(
                cycle.rewardsCycleEndTimestamp * 1000,
              ).toLocaleDateString()}
        </span>
      </div>
      <Progress value={cycle.progressPercent} className="h-2" />
      <div className="flex justify-between text-xs text-gray-500">
        <span>
          Started: {new Date(cycle.blockTimestamp * 1000).toLocaleDateString()}
        </span>
        <span>
          Ends:{" "}
          {new Date(cycle.rewardsCycleEndTimestamp * 1000).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};
