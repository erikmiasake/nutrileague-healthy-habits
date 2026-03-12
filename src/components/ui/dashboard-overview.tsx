import React from 'react';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, ArrowUp, Minus, Users, DollarSign, Clock, AlertCircle } from 'lucide-react';

type IconType = React.ElementType | React.FunctionComponent<React.SVGProps<SVGSVGElement>>;

export type TrendType = 'up' | 'down' | 'neutral';

export interface DashboardMetricCardProps {
  value: string;
  title: string;
  icon?: IconType;
  trendChange?: string;
  trendType?: TrendType;
  className?: string;
}

const DashboardMetricCard: React.FC<DashboardMetricCardProps> = ({
  value,
  title,
  icon: IconComponent,
  trendChange,
  trendType = 'neutral',
  className,
}) => {
  const TrendIcon = trendType === 'up' ? ArrowUp : trendType === 'down' ? ArrowDown : Minus;
  const trendColorClass =
    trendType === 'up'
      ? "text-green-600 dark:text-green-400"
      : trendType === 'down'
      ? "text-red-600 dark:text-red-400"
      : "text-muted-foreground";

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={cn("", className)}
    >
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          {IconComponent && (
            <IconComponent className="h-4 w-4 text-muted-foreground" />
          )}
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{value}</p>
          {trendChange && (
            <p className={cn("text-xs flex items-center gap-1 mt-1", trendColorClass)}>
              <TrendIcon className="h-3 w-3" />
              {trendChange} {trendType === 'up' ? "increase" : trendType === 'down' ? "decrease" : "change"}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

const ExampleUsage = () => {
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Dashboard Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardMetricCard title="Total Users" value="1,234" icon={Users} trendChange="2.5%" trendType="up" />
        <DashboardMetricCard title="Revenue" value="$5.6M" icon={DollarSign} trendChange="1.2%" trendType="down" />
        <DashboardMetricCard title="Avg. Session" value="4m 32s" icon={Clock} trendChange="0.0%" trendType="neutral" />
        <DashboardMetricCard title="Incidents" value="3" icon={AlertCircle} trendChange="5.0%" trendType="up" />
does      </div>
    </div>
  );
};

export default ExampleUsage;
export { DashboardMetricCard };
