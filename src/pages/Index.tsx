import { Flame, Trophy, ChevronRight, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import StreakHero from "@/components/StreakHero";
import { ConsistencyCard } from "@/components/ConsistencyCard";
import { ProgressOverview } from "@/components/ui/dashboard-overview";
import { ShimmerText } from "@/components/ui/shimmer-text";
import AnalyticsDashboardCard from "@/components/ui/interactive-3d-analytics-dashboard-card";
import { currentUser, recentMeals, weekDays, weekActivity } from "@/lib/mockData";

const consistencyData = {
  currentStreak: currentUser.streak,
  percentageChange: 20,
  leagueAverage: 9,
  friends: [
    { name: "Marina Silva", avatar: "MS", streak: 15 },
    { name: "Rafael Costa", avatar: "RC", streak: 11 },
    { name: "Lucas Oliveira", avatar: "LO", streak: 9 },
  ],
  levels: [
    { label: "Início", value: 3, color: "bg-destructive" },
    { label: "Evoluindo", value: 7, color: "bg-xp" },
    { label: "Consistente", value: 14, color: "bg-primary" },
    { label: "Em alta", value: 30, color: "bg-success" },
  ],
};

const Index = () => {
  return (
    <div className="min-h-screen bg-background pb-24 px-4 pt-8 max-w-[430px] mx-auto">
      {/* Header */}
      <motion.header
        className="mb-6"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <p className="text-xs text-muted-foreground tracking-widest uppercase font-medium">Olá,</p>
        <h1 className="text-2xl font-display font-bold mt-1">
          <ShimmerText variant="orange" duration={2.5} delay={2}>{currentUser.name}</ShimmerText>
        </h1>
      </motion.header>

      {/* Streak Hero */}
      <StreakHero
        streak={currentUser.streak}
        goal={30}
        xp={currentUser.xp}
        level={currentUser.level}
        weekDays={weekDays}
        weekActivity={weekActivity}
      />

      <div className="h-6" />

      {/* Progress Overview */}
      <motion.section
        className="mb-6"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <ProgressOverview />
      </motion.section>

      {/* XP Progress */}
      <motion.section
        className="bg-card rounded-2xl p-5 border border-border mb-6 card-elevated"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
            <TrendingUp size={12} />
            Próximo nível
          </span>
          <span className="text-xs font-bold text-primary">{currentUser.xp}/{currentUser.xpToNext} XP</span>
        </div>
        <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(currentUser.xp / currentUser.xpToNext) * 100}%` }}
            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
            style={{ boxShadow: "0 0 8px hsl(var(--primary) / 0.4)" }}
          />
        </div>
        <p className="text-[10px] text-muted-foreground mt-2">Faltam {currentUser.xpToNext - currentUser.xp} XP para o nível {currentUser.level + 1}</p>
      </motion.section>

      {/* Analytics Dashboard */}
      <motion.section
        className="mb-6"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.33 }}
      >
        <AnalyticsDashboardCard
          streak={currentUser.streak}
          mealsLogged={currentUser.mealsThisWeek}
          weeklyProgress={4}
        />
      </motion.section>

      {/* Consistency Card */}
      <motion.section
        className="mb-6"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.38 }}
      >
        <ConsistencyCard {...consistencyData} />
      </motion.section>

      {/* Recent Meals */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-display font-bold flex items-center gap-2">
            <Trophy size={16} className="text-primary" />
            <ShimmerText variant="orange" duration={2.5} delay={3.5}>Refeições recentes</ShimmerText>
          </h2>
          <button className="text-xs text-muted-foreground flex items-center gap-0.5 hover:text-foreground transition-colors">
            Ver todas <ChevronRight size={12} />
          </button>
        </div>
        <div className="space-y-2.5">
          {recentMeals.map((meal, index) => (
            <motion.div
              key={meal.id}
              className="bg-card rounded-2xl p-4 border border-border flex items-center gap-4 card-elevated"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.08, duration: 0.4 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-2xl">{meal.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{meal.description}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{meal.category} • {meal.time}</p>
              </div>
              <span className="text-[11px] text-muted-foreground font-medium">{meal.date}</span>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  );
};

export default Index;
