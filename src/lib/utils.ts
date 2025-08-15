import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const timeframes = {
  "1": "1 day",
  "7": "7 days",
  "30": "30 days",
  "90": "90 days",
  "365": "1 year",
  max: "Max",
} as const;

export const defaultTimeframe = "30" as keyof typeof timeframes;

export const fromWeiToToken = (weiAmount: string): number =>
  parseFloat(weiAmount) / Math.pow(10, 18);

export const toHumanReadable = (value: number) =>
  new Intl.NumberFormat("en", { notation: "compact" }).format(value);

export const timestampToHumanReadable = (unixTimestamp: number) =>
  new Date(unixTimestamp * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
