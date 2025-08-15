import { Card, CardContent } from "@/components/ui/card";

export interface MetricCardProps {
  value: string | React.ReactNode;
  label: string;
}

export const MetricCard = ({ value, label }: MetricCardProps) => (
  <Card>
    <CardContent className="pt-6">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </CardContent>
  </Card>
);
