import { TrendingDown, TrendingUp } from "lucide-react";
import { MetricCard, MetricCardProps } from "@/components/metrics/MetricCard";
import { formatUSDValue, toHumanReadable } from "@/lib/utils";

interface TVLMetricCardsProps {
  currentTVL: number;
  tvlChange: number;
  allTimeHigh: number;
  currentPrice: number;
  timeframeDays: number | null;
  loading?: boolean;
}

export const TVLMetricCards = ({
  currentTVL,
  tvlChange,
  allTimeHigh,
  currentPrice,
  timeframeDays,
  loading = false,
}: TVLMetricCardsProps) => {
  const formatPercentage = (value: number) => {
    if (loading) return "Loading...";
    const isPositive = value >= 0;
    return (
      <div
        className={`flex items-center gap-1 ${
          isPositive ? "text-green-600" : "text-red-600"
        }`}
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
      secondaryValue: formatUSDValue(currentTVL * currentPrice),
      label: "Current TVL",
    },
    {
      value: formatPercentage(tvlChange),
      label: `${getTimeframeLabel()} Change`,
    },
    {
      value: `${toHumanReadable(allTimeHigh)} VSN`,
      secondaryValue: formatUSDValue(allTimeHigh * currentPrice),
      label: "All-time High",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
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
