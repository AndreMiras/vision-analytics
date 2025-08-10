import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { YieldSnapshot } from "@/types/snapshots";

interface PerformanceChartProps {
  data: YieldSnapshot[];
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({ data }) => (
  <div className="h-[400px]">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="timestamp"
          tickFormatter={(ts) => new Date(ts * 1000).toLocaleDateString()}
        />
        <YAxis yAxisId="exchange" domain={["auto", "auto"]} />
        <Tooltip
          labelFormatter={(ts) => new Date(ts * 1000).toLocaleString()}
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
          name="Exchange Rate"
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
);
