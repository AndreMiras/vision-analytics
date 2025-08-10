import { Card, CardContent } from "@/components/ui/card";

interface MetricCardsProps {
  exchangeRate: number;
  apy: number | null;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  exchangeRate,
  apy,
}) => (
  <div className="grid grid-cols-2 gap-4 mb-6">
    <Card>
      <CardContent className="pt-6">
        <div className="text-2xl font-bold">{exchangeRate?.toFixed(4)} VSN</div>
        <div className="text-sm text-muted-foreground">
          Current Exchange Rate
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardContent className="pt-6">
        <div className="text-2xl font-bold">
          {apy ? `${apy.toFixed(2)}%` : "-"}
        </div>
        <div className="text-sm text-muted-foreground">Current APY</div>
      </CardContent>
    </Card>
  </div>
);
