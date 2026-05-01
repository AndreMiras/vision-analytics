"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { CycleProgressCard } from "@/components/metrics/CycleProgressCard";
import { CycleMetricCards } from "@/components/metrics/CycleMetricCards";
import { DistributionEventsChart } from "@/components/metrics/DistributionEventsChart";
import { CycleHistoricalComparison } from "@/components/metrics/CycleHistoricalComparison";
import { RewardsCyclesList } from "@/components/metrics/RewardsCyclesList";
import { RewardsCyclesResponse } from "@/types/api/rewards-cycles";
import { ResponsiveCardContent } from "@/components/ui/responsive-card";

export default function RewardsCyclesPage() {
  const [data, setData] = useState<RewardsCyclesResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/rewards-cycles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });

        const json = await response.json();
        setData(json.data);
      } catch (error) {
        console.error("Error fetching rewards cycles data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const currentCycle = data?.currentCycle ?? null;
  const cycles = data?.cycles ?? [];
  const currentPrice = data?.currentPrice ?? 0;

  return (
    <main className="flex flex-col gap-2">
      <Card>
        <CardHeader>
          <CardTitle>Current Rewards Cycle</CardTitle>
        </CardHeader>
        <ResponsiveCardContent>
          {data && currentCycle ? (
            <>
              <CycleProgressCard cycle={currentCycle.cycle} loading={loading} />
              <div className="mt-6">
                <CycleMetricCards
                  analytics={currentCycle}
                  currentPrice={currentPrice}
                  loading={loading}
                />
              </div>
              <CycleHistoricalComparison data={data} loading={loading} />
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {loading ? "Loading cycle data..." : "No active cycle found"}
            </div>
          )}
        </ResponsiveCardContent>
      </Card>

      {currentCycle ? (
        <Card>
          <CardHeader>
            <CardTitle>Distribution Events</CardTitle>
          </CardHeader>
          <ResponsiveCardContent>
            <DistributionEventsChart
              distributions={currentCycle.distributions}
              loading={loading}
            />
          </ResponsiveCardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Rewards Cycles</CardTitle>
        </CardHeader>
        <ResponsiveCardContent>
          <RewardsCyclesList
            cycles={cycles}
            currentPrice={currentPrice}
            loading={loading}
          />
        </ResponsiveCardContent>
      </Card>
    </main>
  );
}
