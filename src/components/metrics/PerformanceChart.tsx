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
import { timestampToHumanReadable } from "@/utils/time";
import { ConvertedPerformanceSnapshot } from "@/types/svsn/converted";

interface PerformanceChartProps {
  data: ConvertedPerformanceSnapshot[];
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({ data }) => (
  <div className="h-[400px]">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="timestamp" tickFormatter={timestampToHumanReadable} />
        <YAxis yAxisId="exchange" domain={["auto", "auto"]} />
        <Tooltip
          labelFormatter={timestampToHumanReadable}
          formatter={(value: number, name) => [
            name === "Exchange Rate"
              ? value.toFixed(4)
              : value.toFixed(2) + "%",
            name,
          ]}
        />
        <Legend />
        <Line
          yAxisId="exchange"
          type="monotone"
          dataKey="exchangeRate"
          stroke="#8884d8"
          strokeWidth={2}
          name="Exchange Rate"
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
);
