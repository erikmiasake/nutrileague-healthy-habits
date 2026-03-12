import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Flame, UtensilsCrossed, TrendingUp, Loader2 } from 'lucide-react';

interface DayData {
  day: string;
  value: number;
}

const AnimatedBar = ({ value, index, maxValue }: { value: number; index: number; maxValue: number }) => {
  const barHeight = `${(value / maxValue) * 100}%`;

  return (
    <motion.div
      className="relative flex-1 h-full flex items-end justify-center group cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
    >
      <motion.div
        className="w-full max-w-[32px] rounded-t-lg relative overflow-hidden"
        style={{ background: value > 0 ? 'linear-gradient(to top, hsl(var(--primary)), hsl(var(--streak-glow)))' : 'hsl(var(--secondary))' }}
        initial={{ height: 0 }}
        animate={{ height: value > 0 ? barHeight : '8%' }}
        transition={{ delay: 0.3 + index * 0.08, duration: 0.6, ease: 'easeOut' }}
        whileHover={{ scale: 1.1 }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/15" />
      </motion.div>
    </motion.div>
  );
};

const AnimatedNumber = ({ value, suffix = '' }: { value: number; suffix?: string }) => {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    const duration = 800;
    const stepTime = 16;
    const steps = duration / stepTime;
    const increment = end / steps;
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayed(end);
        clearInterval(timer);
      } else {
        setDisplayed(Math.round(start));
      }
    }, stepTime);
    return () => clearInterval(timer);
  }, [value]);

  return <>{displayed}{suffix}</>;
};

interface AnalyticsDashboardCardProps {
  streak?: number;
  mealsLogged?: number;
  weeklyProgress?: number;
  weekData?: DayData[];
  className?: string;
}

const AnalyticsDashboardCard: React.FC<AnalyticsDashboardCardProps> = ({
  streak = 12,
  mealsLogged = 28,
  weeklyProgress = 4,
  weekData,
  className,
}) => {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<DayData[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setData(weekData || [
        { day: 'Seg', value: 3 },
        { day: 'Ter', value: 4 },
        { day: 'Qua', value: 2 },
        { day: 'Qui', value: 5 },
        { day: 'Sex', value: 4 },
        { day: 'Sáb', value: 1 },
        { day: 'Dom', value: 0 },
      ]);
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [weekData]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isHovered) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const rotY = ((e.clientX - rect.left - rect.width / 2) / (rect.width / 2)) * 4;
    const rotX = -((e.clientY - rect.top - rect.height / 2) / (rect.height / 2)) * 4;
    setRotation({ x: rotX, y: rotY });
  };

  const maxValue = data.length > 0 ? Math.max(...data.map(d => d.value), 1) : 1;

  return (
    <div className={cn("[perspective:1200px]", className)}>
      <motion.div
        className="relative rounded-2xl border border-border bg-card overflow-hidden card-elevated"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateX: rotation.x, rotateY: rotation.y }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => { setIsHovered(false); setRotation({ x: 0, y: 0 }); }}
      >
        {/* Background glow */}
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none">
          <div className="absolute -top-1/2 -right-1/2 w-full h-full rounded-full blur-3xl" style={{ background: 'hsl(var(--primary))' }} />
        </div>

        <div className="relative z-10 p-5">
          {/* Header */}
          <div className="mb-5">
            <h3 className="text-base font-display font-bold text-foreground">Seu progresso</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Desempenho nos últimos dias</p>
          </div>

          {/* Chart */}
          <div className="h-28 mb-2">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div key="load" className="h-full flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
                </motion.div>
              ) : (
                <motion.div key="chart" className="h-full flex items-end gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {data.map((item, i) => (
                    <div key={item.day} className="flex-1 h-full flex flex-col items-center">
                      <div className="flex-1 w-full flex items-end justify-center">
                        <AnimatedBar value={item.value} index={i} maxValue={maxValue} />
                      </div>
                      <span className="text-[9px] text-muted-foreground mt-1.5 font-medium">{item.day}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Stats */}
          {!isLoading && (
            <motion.div
              className="grid grid-cols-3 gap-2 mt-4"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <motion.div className="bg-secondary/60 rounded-xl p-3 text-center" whileHover={{ y: -2 }}>
                <Flame size={14} className="text-primary mx-auto mb-1" />
                <p className="text-sm font-bold text-foreground"><AnimatedNumber value={streak} /></p>
                <p className="text-[9px] text-muted-foreground font-medium mt-0.5">Sequência</p>
              </motion.div>
              <motion.div className="bg-secondary/60 rounded-xl p-3 text-center" whileHover={{ y: -2 }}>
                <UtensilsCrossed size={14} className="text-primary mx-auto mb-1" />
                <p className="text-sm font-bold text-foreground"><AnimatedNumber value={mealsLogged} /></p>
                <p className="text-[9px] text-muted-foreground font-medium mt-0.5">Refeições</p>
              </motion.div>
              <motion.div className="bg-success/10 rounded-xl p-3 text-center" whileHover={{ y: -2 }}>
                <TrendingUp size={14} className="text-success mx-auto mb-1" />
                <p className="text-sm font-bold text-success">+<AnimatedNumber value={weeklyProgress} /></p>
                <p className="text-[9px] text-muted-foreground font-medium mt-0.5">Semanal</p>
              </motion.div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AnalyticsDashboardCard;
