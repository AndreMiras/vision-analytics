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
import { timestampToHumanReadable, toHumanReadable } from "@/lib/utils";
import { ConvertedTVLSnapshot } from "@/types/snapshots";
import { TVLChartEmpty } from "@/components/metrics/TVLChartEmpty";

interface TVLChartProps {
  data: ConvertedTVLSnapshot[];
  loading?: boolean;
}

export const TVLChart = ({ data, loading = false }: TVLChartProps) => {
  const formatTooltipValue = (value: number) => [
    `${toHumanReadable(value)} VSN`,
    "TVL",
  ];

  if (loading) {
    return <TVLChartEmpty>loading chart...</TVLChartEmpty>;
  }

  if (data.length === 0) {
    return <TVLChartEmpty>No data available</TVLChartEmpty>;
  }

  return (
    <div className="h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" tickFormatter={timestampToHumanReadable} />
          <YAxis tickFormatter={toHumanReadable} domain={["auto", "auto"]} />
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
            type="monotone"
            dataKey="totalAssets"
            stroke="#10b981"
            strokeWidth={2}
            name="Total Value Locked"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
