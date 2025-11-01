import { formatUSDValue, toHumanReadable } from "@/lib/utils";
import { MetricCard, MetricCardProps } from "./MetricCard";
import { CycleAnalytics } from "@/types/api/rewards-cycles";

interface CycleMetricCardsProps {
  analytics: CycleAnalytics;
  currentPrice: number;
  loading?: boolean;
}

export const CycleMetricCards = ({
  analytics,
  currentPrice,
  loading = false,
}: CycleMetricCardsProps) => {
  const formatTokenAmount = (value: number) =>
    loading ? "Loading..." : `${toHumanReadable(value)} VSN`;

  const formatUSDAmount = (value: number) =>
    loading ? "" : formatUSDValue(value * currentPrice);

  const metrics: MetricCardProps[] = [
    {
      value: formatTokenAmount(analytics.cycle.rewardsCycleAmount),
      secondaryValue: formatUSDAmount(analytics.cycle.rewardsCycleAmount),
      label: "Total Allocated",
    },
    {
      value: formatTokenAmount(analytics.totalDistributed),
      secondaryValue: formatUSDAmount(analytics.totalDistributed),
      label: "Total Distributed",
    },
    {
      value: formatTokenAmount(analytics.remainingBudget),
      secondaryValue: formatUSDAmount(analytics.remainingBudget),
      label: "Remaining Budget",
    },
    {
      value: analytics.distributionCount.toString(),
      secondaryValue: `${analytics.utilizationPercent.toFixed(1)}% utilized`,
      label: "Distribution Events",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {metrics.map((metric, index) => (
        <MetricCard
          key={index}
          value={metric.value}
          label={metric.label}
          secondaryValue={metric.secondaryValue}
        />
      ))}
    </div>
  );
};
