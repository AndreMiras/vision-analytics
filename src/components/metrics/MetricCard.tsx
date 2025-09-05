import { Card, CardContent } from "@/components/ui/card";

export interface MetricCardProps {
  value: string | React.ReactNode;
  label: string;
  secondaryValue?: string | React.ReactNode;
}

export const MetricCard = ({
  value,
  label,
  secondaryValue,
}: MetricCardProps) => (
  <Card>
    <CardContent className="px-3 sm:px-6 space-y-4">
      <div className="text-2xl font-bold">{value}</div>
      {secondaryValue && (
        <div className="text-lg text-muted-foreground">{secondaryValue}</div>
      )}
      <div className="text-sm text-muted-foreground">{label}</div>
    </CardContent>
  </Card>
);
