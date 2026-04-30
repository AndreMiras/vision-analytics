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
import type { ReactNode } from "react";
import type { ValueType } from "recharts/types/component/DefaultTooltipContent";

interface PerformanceChartProps {
  data: ConvertedPerformanceSnapshot[];
}

const toTooltipNumber = (value: ValueType | undefined) =>
  Array.isArray(value) ? Number(value[0]) : Number(value ?? 0);

const formatTooltipLabel = (label: ReactNode) =>
  timestampToHumanReadable(Number(label ?? 0));

export const PerformanceChart: React.FC<PerformanceChartProps> = ({ data }) => (
  <div className="h-[400px]">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="timestamp" tickFormatter={timestampToHumanReadable} />
        <YAxis yAxisId="exchange" domain={["auto", "auto"]} />
        <Tooltip
          labelFormatter={formatTooltipLabel}
          formatter={(value, name) => [
            name === "Exchange Rate"
              ? toTooltipNumber(value).toFixed(4)
              : toTooltipNumber(value).toFixed(2) + "%",
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
