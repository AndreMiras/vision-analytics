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
import { timestampToHumanReadable } from "@/utils/time";
import { ChartEmpty } from "@/components/metrics/ChartEmpty";
import { useMemo } from "react";
import { ConvertedTVLSnapshot } from "@/types/svsn/converted";

interface TVLChartProps {
  tvlSnapshots: ConvertedTVLSnapshot[];
  currentPrice: number;
  loading?: boolean;
}

export const TVLChart = ({
  tvlSnapshots,
  currentPrice,
  loading = false,
}: TVLChartProps) => {
  const formatTooltipValue = (value: number) => [
    `${toHumanReadable(value)} VSN (${formatUSDValue(value * currentPrice)})`,
    "TVL",
  ];

  const chartData = useMemo(() => {
    return tvlSnapshots.map((item) => ({
      ...item,
      totalAssetsUSD: item.totalAssets * currentPrice,
    }));
  }, [tvlSnapshots, currentPrice]);

  if (loading) {
    return <ChartEmpty>Loading chart...</ChartEmpty>;
  }

  if (tvlSnapshots.length === 0) {
    return <ChartEmpty>No data available</ChartEmpty>;
  }

  return (
    <div className="h-[300px] sm:h-[400px] lg:h-[500px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="timestamp"
            tickFormatter={timestampToHumanReadable}
            fontSize={12}
            tick={{ fontSize: 12 }}
            interval="preserveStartEnd"
          />
          <YAxis
            yAxisId="left"
            tickFormatter={toHumanReadable}
            domain={["auto", "auto"]}
            fontSize={12}
            tick={{ fontSize: 12 }}
            width={60}
          />
          <YAxis
            yAxisId="right"
            tickFormatter={(value) => formatUSDValue(value, true)}
            domain={["auto", "auto"]}
            orientation="right"
            fontSize={12}
            tick={{ fontSize: 12 }}
            width={60}
          />
          <Tooltip
            formatter={formatTooltipValue}
            labelFormatter={timestampToHumanReadable}
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "14px",
            }}
          />
          <Legend />

          {/* Visible line for VSN values */}
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="totalAssets"
            stroke="#10b981"
            strokeWidth={2}
            name="Total Value Locked"
            dot={false}
          />

          {/* Invisible line for USD axis - provides tick marks but doesn't show */}
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="totalAssetsUSD"
            stroke="transparent"
            strokeWidth={0}
            name="Total Value Locked (USD)"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
