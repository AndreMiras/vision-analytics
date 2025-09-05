"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UnstakingChart } from "@/components/metrics/UnstakingChart";
import { UnstakingMetricCards } from "@/components/metrics/UnstakingMetricCards";
import { UnstakingList } from "@/components/metrics/UnstakingList";
import { ConvertedUnstakingSnapshot } from "@/types/svsn/converted";

export default function UnstakingPage() {
  const [unstakingSnapshots, setUnstakingSnapshots] = useState<
    ConvertedUnstakingSnapshot[]
  >([]);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const queryUrl = "/api/unstaking";
        const response = await fetch(queryUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });

        const json = await response.json();
        setUnstakingSnapshots(json.data.unstakingSnapshots);
        setCurrentPrice(json.data.currentPrice);
      } catch (error) {
        console.error("Error fetching unstaking data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter for pending cooldowns (not yet unlocked)
  const now = Math.floor(Date.now() / 1000);
  const pendingCooldowns = unstakingSnapshots.filter(
    (item) => item.cooldownEnd > now,
  );

  // Calculate metrics
  const totalPending = pendingCooldowns.reduce(
    (sum, item) => sum + item.shares,
    0,
  );
  const nextUnlock =
    pendingCooldowns.length > 0
      ? Math.min(...pendingCooldowns.map((item) => item.cooldownEnd))
      : null;

  // Group by unlock date for chart
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

  return (
    <main>
      <Card>
        <CardHeader>
          <CardTitle>Pending Unstaking (Cooldown)</CardTitle>
        </CardHeader>
        <CardContent>
          <UnstakingMetricCards
            currentPrice={currentPrice}
            totalPending={totalPending}
            activeCooldowns={pendingCooldowns.length}
            nextUnlock={nextUnlock}
            loading={loading}
          />
          <UnstakingChart
            currentPrice={currentPrice}
            data={chartData}
            loading={loading}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Unlocks</CardTitle>
        </CardHeader>
        <CardContent>
          <UnstakingList
            currentPrice={currentPrice}
            data={pendingCooldowns.slice(0, 10)}
            loading={loading}
          />
        </CardContent>
      </Card>
    </main>
  );
}
