import { CardContent } from "./card";
import { ReactNode } from "react";

interface ResponsiveCardContentProps {
  children: ReactNode;
  className?: string;
}

export const ResponsiveCardContent = ({
  children,
  className = "",
}: ResponsiveCardContentProps) => (
  <CardContent className={`px-3 sm:px-6 space-y-4 ${className}`}>
    {children}
  </CardContent>
);
