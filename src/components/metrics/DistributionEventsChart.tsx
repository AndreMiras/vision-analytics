import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ConvertedDistributeRewardsEvent } from "@/types/svsn/cycle-events";
import { toHumanReadable } from "@/lib/utils";
import { ChartEmpty } from "./ChartEmpty";
import type { ValueType } from "recharts/types/component/DefaultTooltipContent";

interface DistributionEventsChartProps {
  distributions: ConvertedDistributeRewardsEvent[];
  loading?: boolean;
}

const toTooltipNumber = (value: ValueType | undefined) =>
  Array.isArray(value) ? Number(value[0]) : Number(value ?? 0);

export const DistributionEventsChart = ({
  distributions,
  loading = false,
}: DistributionEventsChartProps) => {
  if (loading) {
    return <ChartEmpty>Loading distribution data...</ChartEmpty>;
  }

  if (distributions.length === 0) {
    return <ChartEmpty>No distributions in current cycle yet</ChartEmpty>;
  }

  const chartData = distributions.map((dist) => ({
    timestamp: dist.timestamp,
    date: new Date(dist.timestamp * 1000).toLocaleDateString(),
    rewards: dist.rewards,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12 }}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => toHumanReadable(value)}
        />
        <Tooltip
          formatter={(value) => [
            `${toHumanReadable(toTooltipNumber(value))} VSN`,
            "Rewards",
          ]}
          labelFormatter={(label) => `Date: ${label}`}
        />
        <Bar dataKey="rewards" fill="#3b82f6" />
      </BarChart>
    </ResponsiveContainer>
  );
};
