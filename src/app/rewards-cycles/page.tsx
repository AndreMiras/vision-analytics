"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { CycleProgressCard } from "@/components/metrics/CycleProgressCard";
import { CycleMetricCards } from "@/components/metrics/CycleMetricCards";
import { DistributionEventsChart } from "@/components/metrics/DistributionEventsChart";
import { CycleHistoricalComparison } from "@/components/metrics/CycleHistoricalComparison";
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

  if (loading || !data?.currentCycle) {
    return (
      <main className="flex flex-col gap-2">
        <Card>
          <CardHeader>
            <CardTitle>Current Rewards Cycle</CardTitle>
          </CardHeader>
          <ResponsiveCardContent>
            <div className="text-center py-8 text-gray-500">
              {loading ? "Loading cycle data..." : "No active cycle found"}
            </div>
          </ResponsiveCardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex flex-col gap-2">
      <Card>
        <CardHeader>
          <CardTitle>Current Rewards Cycle</CardTitle>
        </CardHeader>
        <ResponsiveCardContent>
          <CycleProgressCard
            cycle={data.currentCycle.cycle}
            loading={loading}
          />
          <div className="mt-6">
            <CycleMetricCards
              analytics={data.currentCycle}
              currentPrice={data.currentPrice}
              loading={loading}
            />
          </div>
          <CycleHistoricalComparison data={data} loading={loading} />
        </ResponsiveCardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Distribution Events</CardTitle>
        </CardHeader>
        <ResponsiveCardContent>
          <DistributionEventsChart
            distributions={data.currentCycle.distributions}
            loading={loading}
          />
        </ResponsiveCardContent>
      </Card>
    </main>
  );
}
