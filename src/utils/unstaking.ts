import { ConvertedUnstakingSnapshot } from "@/types/svsn/converted";

export interface UnstakingChartDatum {
  date: string;
  amount: number;
  timestamp: number;
}

export interface UnstakingOverview {
  pendingCooldowns: ConvertedUnstakingSnapshot[];
  totalPending: number;
  nextUnlock: number | null;
  chartData: UnstakingChartDatum[];
}

export const getUnstakingOverview = (
  snapshots: ConvertedUnstakingSnapshot[],
  nowSeconds: number,
): UnstakingOverview => {
  const pendingCooldowns = snapshots.filter(
    (item) => item.cooldownEnd > nowSeconds,
  );

  const totalPending = pendingCooldowns.reduce(
    (sum, item) => sum + item.shares,
    0,
  );

  const nextUnlock =
    pendingCooldowns.length > 0
      ? Math.min(...pendingCooldowns.map((item) => item.cooldownEnd))
      : null;

  const groupedByDate = pendingCooldowns.reduce(
    (acc, item) => {
      const date = new Date(item.cooldownEnd * 1000)
        .toISOString()
        .split("T")[0];
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += item.shares;
      return acc;
    },
    {} as Record<string, number>,
  );

  const chartData = Object.entries(groupedByDate)
    .map(([date, amount]) => ({
      date,
      amount,
      timestamp: new Date(date).getTime() / 1000,
    }))
    .sort((a, b) => a.timestamp - b.timestamp);

  return {
    pendingCooldowns,
    totalPending,
    nextUnlock,
    chartData,
  };
};
