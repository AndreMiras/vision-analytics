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
import { MetricCards } from "@/components/metrics/MetricCards";
import { PerformanceChart } from "@/components/metrics/PerformanceChart";
import { YieldSnapshot } from "@/types/snapshots";
import { calculateCurrentAPY } from "@/utils/apy";

const timeframes = {
  "1": "1 day",
  "7": "7 days",
  "30": "30 days",
  "90": "90 days",
  "365": "1 year",
  max: "Max",
} as const;
type TimeframeKey = keyof typeof timeframes;

export default function Home() {
  const [timeframe, setTimeframe] = useState<TimeframeKey>("30");
  const [data, setData] = useState<YieldSnapshot[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const queryUrl = "/api/metrics";
        const response = await fetch(queryUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ timeframe }),
        });

        const json = await response.json();
        const rawData = json.data.yieldSnapshots;

        const processedData: YieldSnapshot[] = rawData.map(
          (snapshot: YieldSnapshot) => ({
            timestamp: parseInt(snapshot.timestamp),
            exchangeRate: parseFloat(snapshot.exchangeRate),
          }),
        );
        setData(processedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [timeframe]);

  const latestExchangeRate = Number(data[data.length - 1]?.exchangeRate);
  const currentAPY = calculateCurrentAPY(data);

  return (
    <main>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>sVSN performance vs VSN</CardTitle>
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
          <MetricCards exchangeRate={latestExchangeRate} apy={currentAPY} />
          <PerformanceChart data={data} />
        </CardContent>
      </Card>
    </main>
  );
}
