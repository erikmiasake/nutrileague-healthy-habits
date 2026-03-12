import { Trophy, ChevronRight, TrendingUp, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import nutrileagueLogo from "@/assets/nutrileague-logo.png";
import StreakHero from "@/components/StreakHero";
import { ConsistencyCard } from "@/components/ConsistencyCard";
import { ProgressOverview } from "@/components/ui/dashboard-overview";
import { ShimmerText } from "@/components/ui/shimmer-text";
import AnalyticsDashboardCard from "@/components/ui/interactive-3d-analytics-dashboard-card";
import { weekDays } from "@/lib/mockData";
import { useDashboardData } from "@/hooks/useDashboardData";

const consistencyLevels = [
  { label: "Início", value: 3, color: "bg-destructive" },
  { label: "Evoluindo", value: 7, color: "bg-xp" },
  { label: "Consistente", value: 14, color: "bg-primary" },
  { label: "Em alta", value: 30, color: "bg-success" },
];

const Index = () => {
  const navigate = useNavigate();
  const { currentStreak, longestStreak, totalMeals, weeklyMeals, weekActivity, userName, loading } = useDashboardData();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 px-4 pt-8 max-w-[430px] mx-auto">
      {/* Header */}
      <motion.header
        className="mb-6 flex items-center justify-between"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div>
          <p className="text-[11px] text-muted-foreground tracking-widest uppercase font-medium">Olá,</p>
          <h1 className="text-2xl font-display font-bold leading-tight">
            <ShimmerText variant="orange" duration={2.5} delay={2}>{userName}</ShimmerText>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <img
            src={nutrileagueLogo}
            alt="NutriLeague"
            className="h-8 w-auto object-contain"
          />
          <button
            onClick={() => navigate("/registrar")}
            className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-md active:scale-90 transition-transform hover:scale-105"
            aria-label="Registrar refeição"
          >
            <Plus size={20} strokeWidth={2.5} />
          </button>
        </div>
      </motion.header>

      {/* Streak Hero */}
      <StreakHero
        streak={currentStreak}
        goal={30}
        xp={totalMeals * 10}
        level={Math.floor(totalMeals / 10) + 1}
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
        <ProgressOverview
          currentStreak={currentStreak}
          totalMeals={totalMeals}
          weeklyMeals={weeklyMeals}
        />
      </motion.section>

      {/* XP Progress */}
      <motion.section
        className="bg-card rounded-2xl p-5 border border-border mb-6 card-elevated"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {(() => {
          const xp = totalMeals * 10;
          const level = Math.floor(totalMeals / 10) + 1;
          const xpInLevel = xp % 100;
          const xpToNext = 100;
          return (
            <>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                  <TrendingUp size={12} />
                  Próximo nível
                </span>
                <span className="text-xs font-bold text-primary">{xpInLevel}/{xpToNext} XP</span>
              </div>
              <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(xpInLevel / xpToNext) * 100}%` }}
                  transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                  style={{ boxShadow: "0 0 8px hsl(var(--primary) / 0.4)" }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">Faltam {xpToNext - xpInLevel} XP para o nível {level + 1}</p>
            </>
          );
        })()}
      </motion.section>

      {/* Analytics Dashboard */}
      <motion.section
        className="mb-6"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.33 }}
      >
        <AnalyticsDashboardCard
          streak={currentStreak}
          mealsLogged={totalMeals}
          weeklyProgress={weeklyMeals}
        />
      </motion.section>

      {/* Consistency Card */}
      <motion.section
        className="mb-6"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.38 }}
      >
        <ConsistencyCard
          currentStreak={currentStreak}
          percentageChange={0}
          leagueAverage={0}
          friends={[]}
          levels={consistencyLevels}
        />
      </motion.section>
    </div>
  );
};

export default Index;
