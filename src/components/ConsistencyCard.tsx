import * as React from "react";
import { motion, useSpring, useTransform, useInView } from "framer-motion";
import { Flame, Users, TrendingUp, Share2, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LeagueFriend {
  name: string;
  avatar: string;
  streak: number;
}

interface ConsistencyLevel {
  label: string;
  value: number;
  color: string;
}

interface ConsistencyCardProps extends React.HTMLAttributes<HTMLDivElement> {
  currentStreak: number;
  percentageChange: number;
  leagueAverage: number;
  friends: LeagueFriend[];
  levels: ConsistencyLevel[];
}

const AnimatedNumber = ({ value }: { value: number }) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });
  const spring = useSpring(0, { mass: 0.8, stiffness: 75, damping: 15 });
  const display = useTransform(spring, (current) => Math.round(current).toString());

  React.useEffect(() => {
    if (isInView) spring.set(value);
  }, [spring, value, isInView]);

  return <motion.span ref={ref}>{display}</motion.span>;
};

export const ConsistencyCard = React.forwardRef<HTMLDivElement, ConsistencyCardProps>(
  ({ className, currentStreak, percentageChange, leagueAverage, friends, levels, ...props }, ref) => {
    const totalLevelValue = levels[levels.length - 1].value;

    return (
      <div ref={ref} className={cn("bg-card rounded-2xl border border-border p-5 card-elevated", className)} {...props}>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center">
              <Flame size={16} className="text-primary" />
            </div>
            <h3 className="text-base font-display font-bold">Consistência</h3>
          </div>
          <Select defaultValue="week">
            <SelectTrigger className="w-auto h-8 text-xs gap-1.5 bg-secondary border-0 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Semana</SelectItem>
              <SelectItem value="month">Mês</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Main Metric */}
        <div className="flex items-start justify-between mb-6">
          <div className="space-y-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-display font-bold text-primary">
                <AnimatedNumber value={currentStreak} />
              </span>
              <span className="text-sm text-muted-foreground font-medium">dias</span>
            </div>
            <p className={cn(
              "text-xs font-medium flex items-center gap-1",
              percentageChange > 0 ? "text-success" : "text-destructive"
            )}>
              <TrendingUp size={12} />
              {percentageChange > 0 ? "+" : ""}{percentageChange}% em relação à última semana
            </p>
          </div>
          <div className="flex flex-col items-end bg-secondary/60 rounded-xl px-3 py-2">
            <span className="text-[10px] text-muted-foreground">Média da liga</span>
            <span className="text-sm font-bold">{leagueAverage} dias</span>
          </div>
        </div>

        {/* Friends */}
        <div className="space-y-3 mb-6">
          <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wide">
            <Users size={12} />
            Amigos da liga
          </p>
          {friends.map((friend, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary text-[11px] font-bold">
                {friend.avatar}
              </div>
              <span className="text-sm flex-1 font-medium">{friend.name}</span>
              <span className="text-sm font-bold text-primary">{friend.streak} dias</span>
            </div>
          ))}
        </div>

        {/* Consistency Levels */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-1.5">
            <TrendingUp size={12} className="text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Níveis de consistência</span>
          </div>
          <div className="flex w-full h-2 rounded-full overflow-hidden">
            {levels.map((level, i) => {
              const prevValue = i > 0 ? levels[i - 1].value : 0;
              const width = ((level.value - prevValue) / totalLevelValue) * 100;
              return <div key={i} className={cn("h-full", level.color)} style={{ width: `${width}%` }} />;
            })}
          </div>
          <div className="flex justify-between">
            {levels.map((level, i) => (
              <span key={i} className="text-[10px] text-muted-foreground font-medium">{level.label}</span>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" className="flex-1 text-xs rounded-xl h-9">
            <Share2 size={14} className="mr-1.5" />
            Compartilhar
          </Button>
          <Button variant="secondary" size="sm" className="flex-1 text-xs rounded-xl h-9">
            <Trophy size={14} className="mr-1.5" />
            Ver ranking
          </Button>
        </div>
      </div>
    );
  }
);

ConsistencyCard.displayName = "ConsistencyCard";
