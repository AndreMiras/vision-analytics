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
  const [data, setData] = useState<ConvertedTVLSnapshot[]>([]);
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
        const rawData = json.data.yieldSnapshots;

        const processedData: ConvertedTVLSnapshot[] = rawData.map(
          (snapshot: ConvertedTVLSnapshot) => ({
            timestamp: snapshot.timestamp,
            totalAssets: snapshot.totalAssets,
            totalSupply: snapshot.totalSupply,
          }),
        );
        setData(processedData);
      } catch (error) {
        console.error("Error fetching TVL data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeframe]);

  // Calculate metrics from data
  const latestSnapshot = data[data.length - 1];
  const oldestSnapshot = data[0];

  const currentTVL = latestSnapshot?.totalAssets || 0;
  const currentTotalSupply = latestSnapshot?.totalSupply || 0;

  // Calculate percentage change over the timeframe
  const tvlChange =
    oldestSnapshot && latestSnapshot
      ? ((latestSnapshot.totalAssets - oldestSnapshot.totalAssets) /
          oldestSnapshot.totalAssets) *
        100
      : 0;

  // Calculate all-time high (you might want to fetch this separately or maintain it)
  const allTimeHigh = Math.max(...data.map((d) => Number(d.totalAssets)));

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
            currentTVL={Number(currentTVL)}
            tvlChange={Number(tvlChange)}
            allTimeHigh={allTimeHigh}
            totalSupply={Number(currentTotalSupply)}
            timeframeDays={timeframe === "max" ? null : parseInt(timeframe)}
            loading={loading}
          />
          <TVLChart data={data} loading={loading} />
        </CardContent>
      </Card>
    </main>
  );
}
