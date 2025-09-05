import { formatUSDValue, toHumanReadable } from "@/lib/utils";
import { MetricCard, MetricCardProps } from "./MetricCard";

interface StakingMetricCardsProps {
  currentPrice: number;
  totalVision: number;
  stakedVision: number;
  unstakedVision: number;
  stakingRatio: number;
  loading?: boolean;
}

export const StakingMetricCards = ({
  currentPrice,
  totalVision,
  stakedVision,
  unstakedVision,
  stakingRatio,
  loading = false,
}: StakingMetricCardsProps) => {
  const formatTokenAmount = (value: number) =>
    loading ? "Loading..." : toHumanReadable(value);

  const formatPercentage = (value: number) =>
    loading ? "Loading..." : `${value.toFixed(2)}%`;

  const metrics: MetricCardProps[] = [
    {
      value: `${formatTokenAmount(totalVision)} VSN`,
      secondaryValue: formatUSDValue(totalVision * currentPrice),
      label: "Total VISION Supply",
    },
    {
      value: `${formatTokenAmount(stakedVision)} sVSN`,
      secondaryValue: formatUSDValue(stakedVision * currentPrice),
      label: "Currently Staked",
    },
    {
      value: `${formatTokenAmount(unstakedVision)} VSN`,
      secondaryValue: formatUSDValue(unstakedVision * currentPrice),
      label: "Available to Stake",
    },
    {
      value: formatPercentage(stakingRatio),
      label: "Staking Ratio",
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
