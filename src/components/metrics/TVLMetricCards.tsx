import { TrendingUp, TrendingDown } from "lucide-react";
import { MetricCard, MetricCardProps } from "@/components/metrics/MetricCard";
import { toHumanReadable } from "@/lib/utils";

interface TVLMetricCardsProps {
  currentTVL: number;
  tvlChange: number;
  allTimeHigh: number;
  totalSupply: number;
  timeframeDays: number | null;
  loading?: boolean;
}

export const TVLMetricCards = ({
  currentTVL,
  tvlChange,
  allTimeHigh,
  totalSupply,
  timeframeDays,
  loading = false,
}: TVLMetricCardsProps) => {
  const formatPercentage = (value: number) => {
    if (loading) return "Loading...";
    const isPositive = value >= 0;
    return (
      <div
        className={`flex items-center gap-1 ${isPositive ? "text-green-600" : "text-red-600"}`}
      >
        {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
        <span>
          {isPositive ? "+" : ""}
          {value.toFixed(2)}%
        </span>
      </div>
    );
  };

  const getTimeframeLabel = () => {
    if (!timeframeDays) return "All-time";
    if (timeframeDays === 1) return "24h";
    return `${timeframeDays}d`;
  };

  const metrics: MetricCardProps[] = [
    {
      value: `${toHumanReadable(currentTVL)} VSN`,
      label: "Current TVL",
    },
    {
      value: formatPercentage(tvlChange),
      label: `${getTimeframeLabel()} Change`,
    },
    {
      value: `${toHumanReadable(allTimeHigh)} VSN`,
      label: "All-time High",
    },
    {
      value: `${toHumanReadable(totalSupply)} sVSN`,
      label: "Total sVSN Supply",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {metrics.map((metric, index) => (
        <MetricCard key={index} value={metric.value} label={metric.label} />
      ))}
    </div>
  );
};
