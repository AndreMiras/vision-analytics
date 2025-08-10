import { YieldSnapshot } from "@/types/snapshots";

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

export const calculateCurrentAPY = (data: YieldSnapshot[]): number | null => {
  if (data.length < 2) return null;

  const firstPoint = data[0];
  const lastPoint = data[data.length - 1];

  return calculateAPY(
    parseFloat(firstPoint.exchangeRate),
    parseFloat(lastPoint.exchangeRate),
    parseInt(firstPoint.timestamp),
    parseInt(lastPoint.timestamp),
  );
};
