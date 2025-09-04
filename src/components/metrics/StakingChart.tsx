import {
  Cell,
  Legend,
  LegendPayload,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { formatUSDValue, toHumanReadable } from "@/lib/utils";
import { ChartEmpty } from "@/components/metrics/ChartEmpty";
import { Payload } from "recharts/types/component/DefaultTooltipContent";

interface StakingChartProps {
  stakedVision: number;
  unstakedVision: number;
  currentPrice: number;
  loading?: boolean;
}

interface StakingDataPoint {
  name: string;
  value: number;
  valueUSD: number;
  color: string;
}

export const StakingChart = ({
  stakedVision,
  unstakedVision,
  currentPrice,
  loading = false,
}: StakingChartProps) => {
  const data: StakingDataPoint[] = [
    {
      name: "Staked (sVSN)",
      value: stakedVision,
      valueUSD: stakedVision * currentPrice,
      color: "#10b981",
    },
    {
      name: "Available to Stake",
      value: unstakedVision,
      valueUSD: unstakedVision * currentPrice,
      color: "#6b7280",
    },
  ];

  const formatTooltipValue = (
    value: number,
    name: string,
    props: Payload<number, string>,
  ) => [
    `${toHumanReadable(value)} VSN (${formatUSDValue(props.payload.valueUSD)})`,
    name,
  ];

  const formatLegendValue = (value: string, entry: LegendPayload) => (
    <span style={{ color: entry.color }}>{value}</span>
  );

  if (loading) {
    return <ChartEmpty>Loading chart...</ChartEmpty>;
  }

  if (stakedVision === 0 && unstakedVision === 0) {
    return <ChartEmpty>No data available</ChartEmpty>;
  }

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={120}
            innerRadius={60}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={formatTooltipValue}
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={formatLegendValue}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
