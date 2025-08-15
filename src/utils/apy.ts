import { ConvertedPerformanceSnapshot } from "@/types/snapshots";

export const calculateAPY = (
  startRate: number,
  endRate: number,
  startTime: number,
  endTime: number,
): number => {
  const timeDiffInYears = (endTime - startTime) / (365 * 24 * 60 * 60);
  const rateReturn = (endRate - startRate) / startRate;
  return (Math.pow(1 + rateReturn, 1 / timeDiffInYears) - 1) * 100;
};

export const calculateCurrentAPY = (
  data: ConvertedPerformanceSnapshot[],
): number | null => {
  if (data.length < 2) return null;

  const firstPoint = data[0];
  const lastPoint = data[data.length - 1];

  return calculateAPY(
    firstPoint.exchangeRate,
    lastPoint.exchangeRate,
    firstPoint.timestamp,
    lastPoint.timestamp,
  );
};
