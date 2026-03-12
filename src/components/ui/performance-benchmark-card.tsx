import * as React from "react";
import { motion, useSpring, useTransform, useInView } from "framer-motion";
import { Share, Copy, BarChartHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Competitor {
  name: string;
  value: number;
  icon: React.ReactNode;
}

interface PerformanceLevel {
  label: string;
  value: number;
  color: string;
}

interface PerformanceCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  headerIcon: React.ReactNode;
  mainValue: number;
  percentageChange: number;
  benchmarkAverage: number;
  competitors: Competitor[];
  performanceLevels: PerformanceLevel[];
}

const AnimatedNumber = ({ value }: { value: number }) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });
  const spring = useSpring(0, {
    mass: 0.8,
    stiffness: 75,
    damping: 15,
  });
  const display = useTransform(spring, (current) =>
    Math.round(current).toLocaleString()
  );

  React.useEffect(() => {
    if (isInView) {
      spring.set(value);
    }
  }, [spring, value, isInView]);

  return <motion.span ref={ref}>{display}</motion.span>;
};

export const PerformanceCard = React.forwardRef<
  HTMLDivElement,
  PerformanceCardProps
>(
  (
    {
      className,
      title,
      headerIcon,
      mainValue,
      percentageChange,
      benchmarkAverage,
      competitors,
      performanceLevels,
      ...props
    },
    ref
  ) => {
    const cardRef = React.useRef(null);
    const isInView = useInView(cardRef, { once: true, margin: "-100px" });
    const maxValue = Math.max(
      mainValue,
      benchmarkAverage,
      ...competitors.map((c) => c.value)
    );
    const totalLevelValue = performanceLevels[performanceLevels.length - 1].value;

    return (
      <Card ref={ref} className={cn("w-full max-w-md", className)} {...props}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            {headerIcon}
            <CardTitle className="text-base font-semibold">{title}</CardTitle>
          </div>
          <Select defaultValue="delivery">
            <SelectTrigger className="w-auto h-8 text-xs gap-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="delivery">Delivery</SelectItem>
              <SelectItem value="dinein">Dine-in</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent ref={cardRef} className="space-y-6">
          {/* Main Metric Section */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="text-4xl font-bold">
                <AnimatedNumber value={mainValue} />
              </div>
              <p
                className={cn(
                  "text-xs font-medium",
                  percentageChange > 0 ? "text-emerald-500" : "text-red-500"
                )}
              >
                ▲ {percentageChange}% to last period
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex flex-col items-end">
                <span className="text-xs text-muted-foreground">Benchmark average</span>
                <span className="text-sm font-semibold">{benchmarkAverage.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Competitors Section */}
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground">Main competitors</p>
            {competitors.map((competitor, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                  {competitor.icon}
                </div>
                <span className="text-sm flex-1">{competitor.name}</span>
                <span className="text-sm font-medium">
                  {competitor.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          {/* Performance Levels Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <BarChartHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">
                Performance benchmark levels
              </span>
            </div>
            <div className="flex w-full h-2 rounded-full overflow-hidden">
              {performanceLevels.map((level, i) => {
                const prevValue = i > 0 ? performanceLevels[i - 1].value : 0;
                const width =
                  ((level.value - prevValue) / totalLevelValue) * 100;
                return (
                  <div
                    key={i}
                    className={cn("h-full", level.color)}
                    style={{ width: `${width}%` }}
                  />
                );
              })}
            </div>
            <div className="flex justify-between">
              {performanceLevels.map((level, i) => (
                <span key={i} className="text-[10px] text-muted-foreground">
                  {level.label}
                </span>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1">
              <Share className="w-3.5 h-3.5 mr-1.5" />
              Share
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <Copy className="w-3.5 h-3.5 mr-1.5" />
              Copy link
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
);

PerformanceCard.displayName = "PerformanceCard";
