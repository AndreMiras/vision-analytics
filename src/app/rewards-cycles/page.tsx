"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { CycleProgressCard } from "@/components/metrics/CycleProgressCard";
import { CycleMetricCards } from "@/components/metrics/CycleMetricCards";
import { DistributionEventsChart } from "@/components/metrics/DistributionEventsChart";
import { CycleHistoricalComparison } from "@/components/metrics/CycleHistoricalComparison";
import { RewardsCyclesList } from "@/components/metrics/RewardsCyclesList";
import { RewardsCyclesResponse } from "@/types/api/rewards-cycles";
import { ResponsiveCardContent } from "@/components/ui/responsive-card";

const SkeletonBar = ({
  className,
  style,
}: {
  className: string;
  style?: CSSProperties;
}) => (
  <div
    className={`animate-pulse rounded bg-gray-200 ${className}`}
    style={style}
  />
);

const CurrentRewardsCycleSkeleton = () => (
  <div data-testid="current-rewards-cycle-skeleton">
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <SkeletonBar className="h-3 w-3 rounded-full" />
          <SkeletonBar className="h-4 w-24" />
        </div>
        <SkeletonBar className="h-4 w-32" />
      </div>
      <SkeletonBar className="h-2 w-full" />
      <div className="flex justify-between gap-4">
        <SkeletonBar className="h-3 w-28" />
        <SkeletonBar className="h-3 w-24" />
      </div>
    </div>

    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, index) => (
        <div key={index} className="rounded-lg border p-4">
          <SkeletonBar className="h-7 w-3/4" />
          <SkeletonBar className="mt-4 h-5 w-1/2" />
          <SkeletonBar className="mt-4 h-4 w-2/3" />
        </div>
      ))}
    </div>

    <div className="mt-6 border-t pt-6">
      <SkeletonBar className="mb-4 h-4 w-56" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[...Array(2)].map((_, index) => (
          <div key={index} className="rounded-lg border p-4">
            <SkeletonBar className="h-7 w-2/3" />
            <SkeletonBar className="mt-4 h-5 w-1/2" />
            <SkeletonBar className="mt-4 h-4 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

const DistributionEventsSkeleton = () => (
  <div
    data-testid="distribution-events-skeleton"
    className="flex h-[300px] items-end gap-3 border-b border-l px-4 pb-4"
  >
    {[...Array(8)].map((_, index) => (
      <SkeletonBar
        key={index}
        className="flex-1"
        style={{ height: `${35 + (index % 4) * 14}%` }}
      />
    ))}
  </div>
);

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
          {loading ? (
            <CurrentRewardsCycleSkeleton />
          ) : data && currentCycle ? (
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

      {loading || currentCycle ? (
        <Card>
          <CardHeader>
            <CardTitle>Distribution Events</CardTitle>
          </CardHeader>
          <ResponsiveCardContent>
            {loading ? (
              <DistributionEventsSkeleton />
            ) : currentCycle ? (
              <DistributionEventsChart
                distributions={currentCycle.distributions}
                loading={loading}
              />
            ) : null}
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
