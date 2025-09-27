import {
  Area,
  ComposedChart,
  CartesianGrid,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatUSDValue, toHumanReadable } from "@/lib/utils";
import { ChartEmpty } from "@/components/metrics/ChartEmpty";
import { timestampToHumanReadable, toLocaleDateString } from "@/utils/time";

interface StakingRatioDataPoint {
  timestamp: number;
  date: string;
  stakingRatio: number;
  totalSupply: number;
  stakedAmount: number;
  unstakedAmount: number;
}

interface HistoricalStakingRatioChartProps {
  data: StakingRatioDataPoint[];
  loading?: boolean;
  currentPrice: number;
}

export const HistoricalStakingRatioChart = ({
  data,
  loading = false,
  currentPrice,
}: HistoricalStakingRatioChartProps) => {
  const tooltipFormatters = {
    stakingRatio: (value: number) => [`${value.toFixed(2)}%`, "Staking Ratio"],
    totalSupply: (value: number) => [
      `${toHumanReadable(value)} VSN (${formatUSDValue(value * currentPrice)})`,
      "Total Supply",
    ],
    stakedAmount: (value: number) => [
      `${toHumanReadable(value)} sVSN (${formatUSDValue(
        value * currentPrice,
      )})`,
      "Staked Amount",
    ],
    unstakedAmount: (value: number) => [
      `${toHumanReadable(value)} VSN (${formatUSDValue(value * currentPrice)})`,
      "Available to Stake",
    ],
  } as const;

  const formatTooltipValue = (value: number, name: string) => {
    const formatter = tooltipFormatters[name as keyof typeof tooltipFormatters];
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
            tickFormatter={(value) => toHumanReadable(value)}
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
            dataKey="stakedAmount"
            stackId="1"
            stroke="#10b981"
            fill="#10b981"
            name="Staked Amount"
          />
          <Area
            yAxisId="supply"
            type="monotone"
            dataKey="unstakedAmount"
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
