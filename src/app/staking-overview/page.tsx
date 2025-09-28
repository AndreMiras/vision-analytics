"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { StakingChart } from "@/components/metrics/StakingChart";
import { StakingMetricCards } from "@/components/metrics/StakingMetricCards";
import { HistoricalStakingRatioChart } from "@/components/metrics/HistoricalStakingRatioChart";
import { ResponsiveCardContent } from "@/components/ui/responsive-card";
import { StakingRatioDataPoint } from "@/types/api/staking";

interface StakingData {
  totalVisionSupply: number;
  stakedVision: number;
  currentPrice: number;
}

export default function StakingOverviewPage() {
  const [stakingData, setStakingData] = useState<StakingData>({
    totalVisionSupply: 0,
    stakedVision: 0,
    currentPrice: 0,
  });
  const [historyData, setHistoryData] = useState<StakingRatioDataPoint[]>([]);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentData = async () => {
      try {
        setOverviewLoading(true);
        const queryUrl = "/api/staking-overview";
        const response = await fetch(queryUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });

        const json = await response.json();
        setStakingData({
          totalVisionSupply: json.data.totalVisionSupply,
          stakedVision: json.data.stakedVision,
          currentPrice: json.data.currentPrice,
        });
      } catch (error) {
        console.error("Error fetching staking overview data:", error);
      } finally {
        setOverviewLoading(false);
      }
    };

    const fetchHistoryData = async () => {
      try {
        setHistoryLoading(true);
        const response = await fetch("/api/staking-history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ daysBack: 30 }),
        });

        const json = await response.json();
        setHistoryData(json.data || []);
      } catch (error) {
        console.error("Error fetching staking history data:", error);
        setHistoryData([]);
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchCurrentData();
    fetchHistoryData();
  }, []);

  const unstakedVision =
    stakingData.totalVisionSupply - stakingData.stakedVision;
  const stakingRatio =
    stakingData.totalVisionSupply > 0
      ? (stakingData.stakedVision / stakingData.totalVisionSupply) * 100
      : 0;

  const chartSections = [
    {
      id: "current-ratio",
      title: "Current Staking Ratio",
      component: (
        <StakingChart
          stakedVision={stakingData.stakedVision}
          unstakedVision={unstakedVision}
          currentPrice={stakingData.currentPrice}
          loading={overviewLoading}
        />
      ),
    },
    {
      id: "historical-ratio",
      title: "Staking Ratio Over Time",
      component: (
        <HistoricalStakingRatioChart
          data={historyData}
          loading={historyLoading}
        />
      ),
    },
  ];

  return (
    <main>
      <Card>
        <CardHeader>
          <CardTitle>VISION Staking Overview</CardTitle>
        </CardHeader>
        <ResponsiveCardContent>
          <StakingMetricCards
            currentPrice={stakingData.currentPrice}
            totalVision={stakingData.totalVisionSupply}
            stakedVision={stakingData.stakedVision}
            unstakedVision={unstakedVision}
            stakingRatio={stakingRatio}
            loading={overviewLoading}
          />
          <div className="space-y-8">
            {chartSections.map((section) => (
              <div key={section.id}>
                <h3 className="text-lg font-semibold mb-4">{section.title}</h3>
                {section.component}
              </div>
            ))}
          </div>
        </ResponsiveCardContent>
      </Card>
    </main>
  );
}
