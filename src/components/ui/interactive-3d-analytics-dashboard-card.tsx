import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Loader2, AlertCircle } from 'lucide-react';

interface DataPoint {
  month: string;
  value: number;
}

const AnimatedBar = ({ 
  value, 
  index, 
  maxValue 
}: { 
  value: number; 
  index: number; 
  maxValue: number;
}) => {
  const barHeight = `${(value / maxValue) * 100}%`;

  return (
    <motion.div
      className="relative flex-1 h-full flex items-end justify-center group cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
    >
      <motion.div
        className="w-full max-w-[28px] rounded-t-lg bg-primary/80 relative overflow-hidden"
        initial={{ height: 0 }}
        animate={{ height: barHeight }}
        transition={{ delay: 0.3 + index * 0.1, duration: 0.6, ease: 'easeOut' }}
        whileHover={{ 
          scale: 1.08,
          backgroundColor: 'hsl(var(--primary))',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10" />
      </motion.div>
      <motion.span
        className="absolute -top-7 text-[10px] font-bold text-foreground bg-card/90 backdrop-blur-sm px-1.5 py-0.5 rounded-md border border-border opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10"
      >
        {value.toLocaleString()}
      </motion.span>
    </motion.div>
  );
};

interface AnalyticsDashboardCardProps {
  title?: string;
  subtitle?: string;
  data?: DataPoint[];
  className?: string;
}

const AnalyticsDashboardCard: React.FC<AnalyticsDashboardCardProps> = ({ 
  title = "Revenue Analytics", 
  subtitle = "Monthly Performance",
  data: externalData,
  className,
}) => {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<DataPoint[]>([]);
  const [trend, setTrend] = useState(0);

  useEffect(() => {
    if (externalData) {
      setData(externalData);
      const first = externalData[0]?.value || 1;
      const last = externalData[externalData.length - 1]?.value || 0;
      setTrend(((last - first) / first) * 100);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(() => {
      const mockData: DataPoint[] = [
        { month: 'Jan', value: 32000 },
        { month: 'Fev', value: 48000 },
        { month: 'Mar', value: 41000 },
        { month: 'Abr', value: 38000 },
        { month: 'Mai', value: 52000 },
        { month: 'Jun', value: 67000 },
        { month: 'Jul', value: 72000 },
      ];
      setData(mockData);
      const first = mockData[0].value;
      const last = mockData[mockData.length - 1].value;
      setTrend(((last - first) / first) * 100);
      setIsLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, [externalData]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isHovered) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const rotY = ((e.clientX - centerX) / (rect.width / 2)) * 4;
    const rotX = -((e.clientY - centerY) / (rect.height / 2)) * 4;
    setRotation({ x: rotX, y: rotY });
  };

  const resetRotation = () => {
    setIsHovered(false);
    setRotation({ x: 0, y: 0 });
  };

  const maxValue = data.length > 0 ? Math.max(...data.map(d => d.value)) : 1;
  const total = data.reduce((s, d) => s + d.value, 0);
  const avg = data.length > 0 ? Math.round(total / data.length) : 0;

  return (
    <div className={cn("perspective-[1200px]", className)}>
      <motion.div
        className="relative rounded-2xl border border-border bg-card overflow-hidden card-elevated"
        style={{
          transformStyle: 'preserve-3d',
        }}
        animate={{
          rotateX: rotation.x,
          rotateY: rotation.y,
        }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={resetRotation}
      >
        {/* Gradient accent */}
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none">
          <div className="absolute -top-1/2 -right-1/2 w-full h-full rounded-full bg-primary blur-3xl" />
          <div className="absolute -bottom-1/2 -left-1/2 w-full h-full rounded-full bg-accent blur-3xl" />
        </div>

        <div className="relative z-10 p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <h3 className="text-sm font-display font-bold text-foreground">{title}</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>
            </div>
            <div className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold",
              trend >= 0 
                ? "bg-success/10 text-success" 
                : "bg-destructive/10 text-destructive"
            )}>
              {trend >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {Math.abs(trend).toFixed(1)}%
            </div>
          </div>

          {/* Chart */}
          <div className="h-32 mb-4">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  className="h-full flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
                </motion.div>
              ) : (
                <motion.div
                  key="chart"
                  className="h-full flex items-end gap-1.5 pt-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {data.map((item, index) => (
                    <div key={item.month} className="flex-1 h-full flex flex-col items-center">
                      <div className="flex-1 w-full flex items-end justify-center">
                        <AnimatedBar value={item.value} index={index} maxValue={maxValue} />
                      </div>
                      <span className="text-[9px] text-muted-foreground mt-1.5 font-medium">
                        {item.month}
                      </span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer stats */}
          {!isLoading && (
            <motion.div
              className="grid grid-cols-3 gap-2"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="bg-secondary/50 rounded-xl p-2.5 text-center">
                <p className="text-[9px] text-muted-foreground font-medium">Total</p>
                <p className="text-xs font-bold text-foreground mt-0.5">
                  ${total.toLocaleString()}
                </p>
              </div>
              <div className="bg-secondary/50 rounded-xl p-2.5 text-center">
                <p className="text-[9px] text-muted-foreground font-medium">Média</p>
                <p className="text-xs font-bold text-foreground mt-0.5">
                  ${avg.toLocaleString()}
                </p>
              </div>
              <div className={cn(
                "rounded-xl p-2.5 text-center",
                trend >= 0 ? "bg-success/10" : "bg-destructive/10"
              )}>
                <p className="text-[9px] text-muted-foreground font-medium">Crescimento</p>
                <p className={cn(
                  "text-xs font-bold mt-0.5 flex items-center justify-center gap-0.5",
                  trend >= 0 ? "text-success" : "text-destructive"
                )}>
                  {trend >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {Math.abs(trend).toFixed(1)}%
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AnalyticsDashboardCard;
