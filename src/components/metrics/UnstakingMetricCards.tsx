import { formatUSDValue, toHumanReadable } from "@/lib/utils";
import { formatRelativeTime } from "@/utils/time";
import { MetricCard, MetricCardProps } from "./MetricCard";

interface UnstakingMetricCardsProps {
  currentPrice: number;
  totalPending: number;
  activeCooldowns: number;
  nextUnlock: number | null;
  loading?: boolean;
}

export const UnstakingMetricCards = ({
  currentPrice,
  totalPending,
  activeCooldowns,
  nextUnlock,
  loading = false,
}: UnstakingMetricCardsProps) => {
  const formatTokenAmount = (value: number) =>
    loading ? "Loading..." : toHumanReadable(value);

  const formatNextUnlock = (timestamp: number | null) => {
    if (loading) return "Loading...";
    if (!timestamp) return "None";
    const date = new Date(timestamp * 1000);
    const now = new Date();
    return formatRelativeTime(date, now);
  };

  const metrics: MetricCardProps[] = [
    {
      value: (
        <div>
          <div>{formatTokenAmount(totalPending)} sVSN</div>
          <div className="text-lg text-muted-foreground">
            {formatUSDValue(totalPending * currentPrice)}
          </div>
        </div>
      ),
      label: "Total Pending",
    },
    {
      value: activeCooldowns.toString(),
      label: "Active Cooldowns",
    },
    {
      value: formatNextUnlock(nextUnlock),
      label: "Next Unlock",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      {metrics.map((metric, index) => (
        <MetricCard key={index} value={metric.value} label={metric.label} />
      ))}
    </div>
  );
};
