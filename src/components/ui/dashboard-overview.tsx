import React from 'react';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, ArrowUp, Minus, Flame, UtensilsCrossed, Target, Trophy } from 'lucide-react';

type IconType = React.ElementType;
export type TrendType = 'up' | 'down' | 'neutral';

export interface ProgressMetricCardProps {
  value: string;
  title: string;
  icon?: IconType;
  trendChange?: string;
  trendType?: TrendType;
  className?: string;
}

const ProgressMetricCard: React.FC<ProgressMetricCardProps> = ({
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
      ? "text-success"
      : trendType === 'down'
      ? "text-destructive"
      : "text-muted-foreground";

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={cn("", className)}
    >
      <Card className="overflow-hidden border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground">
            {title}
          </CardTitle>
          {IconComponent && (
            <IconComponent className="h-4 w-4 text-primary" />
          )}
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-display font-bold">{value}</p>
          {trendChange && (
            <p className={cn("text-[10px] flex items-center gap-1 mt-1", trendColorClass)}>
              <TrendIcon className="h-3 w-3" />
              {trendChange}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const ProgressOverview: React.FC = () => {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold flex items-center gap-2">
        <Trophy size={14} className="text-primary" />
        Seu progresso
      </h2>
      <div className="grid grid-cols-2 gap-3">
        <ProgressMetricCard title="Sequência atual" value="12 dias" icon={Flame} trendChange="+2 dias nesta semana" trendType="up" />
        <ProgressMetricCard title="Refeições saudáveis" value="28" icon={UtensilsCrossed} trendChange="+6 nesta semana" trendType="up" />
        <ProgressMetricCard title="Desafios ativos" value="3" icon={Target} trendChange="1 concluído recentemente" trendType="neutral" />
        <ProgressMetricCard title="Posição no ranking" value="#2" icon={Trophy} trendChange="Subiu 1 posição" trendType="up" />
      </div>
    </div>
  );
};

export default ProgressOverview;
export { ProgressMetricCard };
