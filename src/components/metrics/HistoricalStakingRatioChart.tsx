import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
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
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis
            dataKey="timestamp"
            type="number"
            scale="time"
            domain={["dataMin", "dataMax"]}
            tickFormatter={formatXAxisLabel}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            yAxisId="ratio"
            orientation="left"
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            yAxisId="supply"
            orientation="right"
            tickFormatter={(value) => toHumanReadable(value)}
            tick={{ fontSize: 12 }}
            hide
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
          <Line
            yAxisId="ratio"
            type="monotone"
            dataKey="stakingRatio"
            stroke="#10b981"
            strokeWidth={3}
            dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
            name="Staking Ratio"
            connectNulls={false}
          />
          <Line
            yAxisId="supply"
            type="monotone"
            dataKey="totalSupply"
            stroke="#6b7280"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            name="Total Supply"
            hide
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
