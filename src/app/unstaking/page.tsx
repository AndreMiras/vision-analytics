"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { UnstakingChart } from "@/components/metrics/UnstakingChart";
import { UnstakingMetricCards } from "@/components/metrics/UnstakingMetricCards";
import { UnstakingList } from "@/components/metrics/UnstakingList";
import { ConvertedUnstakingSnapshot } from "@/types/svsn/converted";
import { ResponsiveCardContent } from "@/components/ui/responsive-card";
import { getUnstakingOverview } from "@/utils/unstaking";

export default function UnstakingPage() {
  const [unstakingSnapshots, setUnstakingSnapshots] = useState<
    ConvertedUnstakingSnapshot[]
  >([]);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [currentTimestamp] = useState(() => Math.floor(Date.now() / 1000));

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

  const { pendingCooldowns, totalPending, nextUnlock, chartData } =
    getUnstakingOverview(unstakingSnapshots, currentTimestamp);

  return (
    <main className="flex flex-col gap-2">
      <Card>
        <CardHeader>
          <CardTitle>Pending Unstaking (Cooldown)</CardTitle>
        </CardHeader>
        <ResponsiveCardContent>
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
        </ResponsiveCardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Unlocks</CardTitle>
        </CardHeader>
        <ResponsiveCardContent>
          <UnstakingList
            currentPrice={currentPrice}
            data={pendingCooldowns.slice(0, 10)}
            loading={loading}
          />
        </ResponsiveCardContent>
      </Card>
    </main>
  );
}
