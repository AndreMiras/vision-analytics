import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { toHumanReadable } from "@/lib/utils";
import { ChartEmpty } from "@/components/metrics/ChartEmpty";
import { toLocaleDateString } from "@/utils/time";

interface ChartDataPoint {
  date: string;
  amount: number;
  timestamp: number;
}

interface UnstakingChartProps {
  data: ChartDataPoint[];
  loading?: boolean;
}

export const UnstakingChart = ({
  data,
  loading = false,
}: UnstakingChartProps) => {
  const formatTooltipValue = (value: number) => {
    return [`${toHumanReadable(value)} sVSN`, "Unlock Amount"];
  };

  const formatTooltipLabel = (label: string) =>
    toLocaleDateString(new Date(label));

  // Transform data for the chart
  const chartData = data.map((item) => ({
    date: toLocaleDateString(new Date(item.date), true),
    amount: item.amount,
    fullDate: item.date,
  }));

  if (loading) return <ChartEmpty>loading chart...</ChartEmpty>;
  if (chartData.length === 0) return <ChartEmpty>loading chart...</ChartEmpty>;

  return (
    <div className="h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: "#666" }}
          />
          <YAxis
            tickFormatter={toHumanReadable}
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: "#666" }}
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
          <Bar
            dataKey="amount"
            fill="#f59e0b"
            name="Unlock Amount"
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
