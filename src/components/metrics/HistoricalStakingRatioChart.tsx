import {
  Area,
  ComposedChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartEmpty } from "@/components/metrics/ChartEmpty";
import { timestampToHumanReadable, toLocaleDateString } from "@/utils/time";
import { StakingRatioDataPoint } from "@/types/api/staking";

interface HistoricalStakingRatioChartProps {
  data: StakingRatioDataPoint[];
  loading?: boolean;
}

const toPercent = (decimal: number, fixed = 0) =>
  `${(decimal * 100).toFixed(fixed)}%`;

export const HistoricalStakingRatioChart = ({
  data,
  loading = false,
}: HistoricalStakingRatioChartProps) => {
  const tooltipFormatters = {
    stakedPercent: (value: number) => [
      `${toPercent(value, 2)}`,
      "Staked Amount",
    ],
    unstakedPercent: (value: number) => [
      `${toPercent(value, 2)}`,
      "Available to Stake",
    ],
  } as const;

  const formatTooltipValue = (value: number, name: string, props: unknown) => {
    const dataKey = (props as { dataKey: keyof typeof tooltipFormatters })
      .dataKey;
    const formatter = tooltipFormatters[dataKey];
    return formatter ? formatter(value) : [value.toString(), name];
  };

  const formatXAxisLabel = (tickItem: number) => {
    const date = new Date(tickItem * 1000);
    return toLocaleDateString(date, true);
  };

  if (loading) {
    return <ChartEmpty>Loading historical data...</ChartEmpty>;
  }

  if (!data || data.length === 0) {
    return <ChartEmpty>No historical data available</ChartEmpty>;
  }

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="timestamp"
            type="number"
            scale="time"
            domain={["dataMin", "dataMax"]}
            tickFormatter={formatXAxisLabel}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            yAxisId="supply"
            orientation="left"
            tickFormatter={(value) => toPercent(value)}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            formatter={formatTooltipValue}
            labelFormatter={timestampToHumanReadable}
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
          <Legend />

          {/* Stacked Areas for Supply Breakdown */}
          <Area
            yAxisId="supply"
            type="monotone"
            dataKey="stakedPercent"
            stackId="1"
            stroke="#10b981"
            fill="#10b981"
            name="Staked Amount"
          />
          <Area
            yAxisId="supply"
            type="monotone"
            dataKey="unstakedPercent"
            stackId="1"
            stroke="#6b7280"
            fill="#6b7280"
            name="Available to Stake"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
