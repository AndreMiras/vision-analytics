"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TVLChart } from "@/components/metrics/TVLChart";
import { TVLMetricCards } from "@/components/metrics/TVLMetricCards";
import { ConvertedTVLSnapshot } from "@/types/snapshots";
import { defaultTimeframe, timeframes } from "@/lib/utils";

type TimeframeKey = keyof typeof timeframes;

export default function TVLPage() {
  const [timeframe, setTimeframe] = useState<TimeframeKey>(defaultTimeframe);
  const [yieldSnapshots, setYieldSnapshots] = useState<ConvertedTVLSnapshot[]>(
    [],
  );
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const queryUrl = "/api/metrics";
        const response = await fetch(queryUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            timeframe,
            type: "tvl",
          }),
        });

        const json = await response.json();
        setYieldSnapshots(json.data.yieldSnapshots);
        setCurrentPrice(json.data.currentPrice);
      } catch (error) {
        console.error("Error fetching TVL data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeframe]);

  // Calculate metrics from data
  const latestSnapshot = yieldSnapshots[yieldSnapshots.length - 1];
  const oldestSnapshot = yieldSnapshots[0];

  const currentTVL = latestSnapshot?.totalAssets || 0;

  // Calculate percentage change over the timeframe
  const tvlChange =
    oldestSnapshot && latestSnapshot
      ? ((latestSnapshot.totalAssets - oldestSnapshot.totalAssets) /
          oldestSnapshot.totalAssets) *
        100
      : 0;

  // Calculate all-time high (you might want to fetch this separately or maintain it)
  const allTimeHigh = Math.max(
    ...yieldSnapshots.map((d) => Number(d.totalAssets)),
  );

  return (
    <main>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Total Value Locked (TVL)</CardTitle>
            <Select
              value={timeframe}
              onValueChange={(tf: TimeframeKey) => setTimeframe(tf)}
            >
              <SelectTrigger className="w-32">
                <SelectValue>{timeframes[timeframe]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(timeframes) as TimeframeKey[]).map((tfValue) => (
                  <SelectItem key={tfValue} value={tfValue}>
                    {timeframes[tfValue]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <TVLMetricCards
            currentTVL={currentTVL}
            tvlChange={tvlChange}
            allTimeHigh={allTimeHigh}
            currentPrice={currentPrice}
            timeframeDays={timeframe === "max" ? null : parseInt(timeframe)}
            loading={loading}
          />
          <TVLChart data={yieldSnapshots} loading={loading} />
        </CardContent>
      </Card>
    </main>
  );
}
