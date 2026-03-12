import React from 'react';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp, Minus, Flame, UtensilsCrossed, Target, Trophy } from 'lucide-react';
import { ShimmerText } from "@/components/ui/shimmer-text";

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
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      className={cn("", className)}
    >
      <div className="bg-card rounded-2xl border border-border p-4 card-elevated h-full">
        <div className="flex items-center justify-between mb-3">
          {IconComponent && (
            <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center">
              <IconComponent className="h-4 w-4 text-primary" />
            </div>
          )}
        </div>
        <p className="text-2xl font-display font-bold tracking-tight">{value}</p>
        <p className="text-[11px] text-muted-foreground font-medium mt-1">{title}</p>
        {trendChange && (
          <p className={cn("text-[10px] flex items-center gap-1 mt-2 font-medium", trendColorClass)}>
            <TrendIcon className="h-3 w-3" />
            {trendChange}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export const ProgressOverview: React.FC = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-base font-display font-bold flex items-center gap-2">
        <Trophy size={16} className="text-primary" />
        <ShimmerText variant="orange" duration={2.5} delay={3}>Seu progresso</ShimmerText>
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
