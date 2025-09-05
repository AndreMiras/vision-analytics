import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatUSDValue, toHumanReadable } from "@/lib/utils";
import { ChartEmpty } from "@/components/metrics/ChartEmpty";
import { toLocaleDateString } from "@/utils/time";
import { useMemo } from "react";

interface ChartDataPoint {
  date: string;
  amount: number;
  timestamp: number;
}

interface UnstakingChartProps {
  data: ChartDataPoint[];
  currentPrice: number;
  loading?: boolean;
}

export const UnstakingChart = ({
  data,
  currentPrice,
  loading = false,
}: UnstakingChartProps) => {
  const formatTooltipValue = (value: number) => [
    `${toHumanReadable(value)} sVSN (${formatUSDValue(value * currentPrice)})`,
    "Unlock Amount",
  ];
  const formatTooltipLabel = (label: string) =>
    toLocaleDateString(new Date(label));

  // Transform data for the chart
  const chartData = useMemo(() => {
    return data.map((item) => ({
      date: toLocaleDateString(new Date(item.date), true),
      amount: item.amount,
      amountUSD: item.amount * currentPrice,
      fullDate: item.date,
    }));
  }, [data, currentPrice]);

  if (loading) return <ChartEmpty>loading chart...</ChartEmpty>;
  if (chartData.length === 0) return <ChartEmpty>loading chart...</ChartEmpty>;

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 80, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: "#666" }}
          />
          {/* Left axis: sVSN amounts */}
          <YAxis
            yAxisId="left"
            tickFormatter={toHumanReadable}
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: "#666" }}
            domain={[0, "auto"]}
          />
          {/* Right axis: USD values */}
          <YAxis
            yAxisId="right"
            orientation="right"
            tickFormatter={(value) => formatUSDValue(value)}
            label={{ value: "USD", angle: 90, position: "insideRight" }}
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: "#666" }}
            domain={[0, "auto"]}
          />
          <Tooltip
            formatter={formatTooltipValue}
            labelFormatter={formatTooltipLabel}
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
          <Legend />
          {/* Visible bar for sVSN values */}
          <Bar
            yAxisId="left"
            dataKey="amount"
            fill="#f59e0b"
            name="Unlock Amount"
            radius={[2, 2, 0, 0]}
          />
          {/* Invisible bar for USD axis scaling */}
          <Bar
            yAxisId="right"
            dataKey="amountUSD"
            fill="transparent"
            name="Unlock Amount (USD)"
            legendType="none"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
