import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Zap, Calendar, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StreakHeroProps {
  streak: number;
  goal?: number;
  xp: number;
  level: number;
  weekDays: string[];
  weekActivity: boolean[];
}

const StreakHero: React.FC<StreakHeroProps> = ({
  streak,
  goal = 30,
  xp,
  level,
  weekDays,
  weekActivity,
}) => {
  const progress = Math.min(streak / goal, 1);
  const activeDays = weekActivity.filter(Boolean).length;

  return (
    <motion.div
      className="relative rounded-3xl border border-border bg-card overflow-hidden card-elevated"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-[80px] opacity-[0.12]"
          style={{ background: 'hsl(var(--primary))' }}
        />
      </div>

      <div className="relative z-10 p-6">
        {/* Top row: Level badge + XP */}
        <div className="flex items-center justify-between mb-6">
          <motion.div
            className="flex items-center gap-2 bg-secondary/70 rounded-full px-3 py-1.5"
            whileHover={{ scale: 1.05 }}
          >
            <Trophy size={12} className="text-primary" />
            <span className="text-[11px] font-bold text-foreground">Nível {level}</span>
          </motion.div>
          <motion.div
            className="flex items-center gap-1.5 bg-secondary/70 rounded-full px-3 py-1.5"
            whileHover={{ scale: 1.05 }}
          >
            <Zap size={12} className="text-xp" />
            <span className="text-[11px] font-bold text-foreground">{xp} XP</span>
          </motion.div>
        </div>

        {/* Center: Big streak number */}
        <div className="text-center mb-5">
          <motion.div
            className="inline-flex items-baseline gap-1"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3, type: 'spring', stiffness: 150 }}
          >
            <span className="text-6xl font-display font-extrabold text-foreground tracking-tighter">
              {streak}
            </span>
            <span className="text-lg font-display font-bold text-muted-foreground">dias</span>
          </motion.div>
          <div className="flex items-center justify-center gap-1.5 mt-1">
            <Flame size={14} className="text-primary" />
            <span className="text-xs text-muted-foreground font-medium">Sequência atual</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] text-muted-foreground font-medium">Meta mensal</span>
            <span className="text-[10px] font-bold text-primary">{streak}/{goal}</span>
          </div>
          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--streak-glow)))',
                boxShadow: '0 0 10px hsl(var(--primary) / 0.4)',
              }}
              initial={{ width: 0 }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Week dots */}
        <div className="flex gap-2 justify-center">
          {weekDays.map((day, i) => (
            <motion.div
              key={i}
              className="flex flex-col items-center gap-1.5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.05 }}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold transition-all",
                  weekActivity[i]
                    ? "text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                )}
                style={weekActivity[i] ? {
                  background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--streak-glow)))',
                  boxShadow: '0 0 14px hsl(var(--primary) / 0.3)',
                } : undefined}
              >
                {day}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick stats row */}
        <div className="grid grid-cols-3 gap-2 mt-5">
          <div className="bg-secondary/50 rounded-xl py-2.5 text-center">
            <p className="text-sm font-bold text-foreground">{activeDays}/7</p>
            <p className="text-[9px] text-muted-foreground font-medium mt-0.5">Esta semana</p>
          </div>
          <div className="bg-secondary/50 rounded-xl py-2.5 text-center">
            <p className="text-sm font-bold text-foreground">{Math.round(progress * 100)}%</p>
            <p className="text-[9px] text-muted-foreground font-medium mt-0.5">Da meta</p>
          </div>
          <div className="bg-success/10 rounded-xl py-2.5 text-center">
            <p className="text-sm font-bold text-success">+{activeDays}</p>
            <p className="text-[9px] text-muted-foreground font-medium mt-0.5">Ativos</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StreakHero;
