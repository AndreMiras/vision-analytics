"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StakingChart } from "@/components/metrics/StakingChart";
import { StakingMetricCards } from "@/components/metrics/StakingMetricCards";

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
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
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const unstakedVision =
    stakingData.totalVisionSupply - stakingData.stakedVision;
  const stakingRatio =
    stakingData.totalVisionSupply > 0
      ? (stakingData.stakedVision / stakingData.totalVisionSupply) * 100
      : 0;

  return (
    <main>
      <Card>
        <CardHeader>
          <CardTitle>VISION Staking Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <StakingMetricCards
            currentPrice={stakingData.currentPrice}
            totalVision={stakingData.totalVisionSupply}
            stakedVision={stakingData.stakedVision}
            unstakedVision={unstakedVision}
            stakingRatio={stakingRatio}
            loading={loading}
          />
          <StakingChart
            stakedVision={stakingData.stakedVision}
            unstakedVision={unstakedVision}
            currentPrice={stakingData.currentPrice}
            loading={loading}
          />
        </CardContent>
      </Card>
    </main>
  );
}
