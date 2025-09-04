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
import { ConvertedTVLSnapshot } from "@/types/snapshots";
import { ChartEmpty } from "@/components/metrics/ChartEmpty";
import { useMemo } from "react";

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
    return <ChartEmpty>loading chart...</ChartEmpty>;
  }

  if (tvlSnapshots.length === 0) {
    return <ChartEmpty>No data available</ChartEmpty>;
  }

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 80, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" tickFormatter={timestampToHumanReadable} />
          <YAxis
            yAxisId="left"
            tickFormatter={toHumanReadable}
            domain={["auto", "auto"]}
          />
          <YAxis
            yAxisId="right"
            tickFormatter={formatUSDValue}
            domain={["auto", "auto"]}
            orientation="right"
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
