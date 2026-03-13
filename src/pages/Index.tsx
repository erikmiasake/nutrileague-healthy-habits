import { Flame, ChevronRight, Crown, Utensils, Trophy, Activity, Info } from "lucide-react";
import { GradientButton } from "@/components/ui/gradient-button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import nutrileagueIcon from "@/assets/nutrileague-icon.png";
import AppSidebar from "@/components/AppSidebar";
import { useDashboardData } from "@/hooks/useDashboardData";
import TextHoverEffect from "@/components/ui/shimmer-bg-text";
import { useLeagueRanking } from "@/hooks/useLeagueRanking";
import { useChallenges } from "@/hooks/useChallenges";
import { useLeagueActivity } from "@/hooks/useLeagueActivity";
import { cn } from "@/lib/utils";
import HomeMealsBlock from "@/components/HomeMealsBlock";

const Index = () => {
  const navigate = useNavigate();
  const { currentStreak, userName, loggedToday, todayMeals, loading } = useDashboardData();
  const league = useLeagueRanking();
  const { personal, league: leagueChallenges, event } = useChallenges();
  const { activities, loading: activityLoading } = useLeagueActivity();

  // Find the first active (joined but not completed) challenge
  const allChallenges = [...personal, ...leagueChallenges, ...event];
  const activeChallenge = allChallenges.find(c => c.progress && !c.progress.completed);

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

  const streakLabel = currentStreak === 1 ? "dia" : "dias";

  return (
    <div className="min-h-screen bg-background pb-24 px-4 pt-5 max-w-[430px] mx-auto">
      {/* ── HEADER ── */}
      <motion.header
        className="mb-5 flex items-center justify-between"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <AppSidebar />
        <TextHoverEffect text="NutriLeague" icon={nutrileagueIcon} />
        <button
          onClick={() => navigate("/sobre")}
          className="gradient-button flex items-center justify-center w-9 h-9 rounded-xl min-w-0 p-0"
          aria-label="Sobre o NutriLeague"
        >
          <Info size={18} strokeWidth={2.5} />
        </button>
      </motion.header>

      {/* ── BLOCK 1: Streak + Position ── */}
      <motion.section
        className="rounded-2xl border border-border bg-card overflow-hidden card-elevated mb-4"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
      >
        <div className="p-4 flex items-center gap-4">
          {/* Streak ring */}
          <div className="relative flex-shrink-0">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{
                background: `conic-gradient(hsl(var(--primary)) ${Math.min(currentStreak / 30, 1) * 360}deg, hsl(var(--secondary)) 0deg)`,
              }}
            >
              <div className="w-[52px] h-[52px] rounded-full bg-card flex items-center justify-center">
                <div className="text-center">
                  <Flame size={14} className="text-primary mx-auto" />
                  <span className="text-lg font-display font-extrabold text-foreground leading-none">
                    {currentStreak}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-display font-bold text-foreground">
              {currentStreak} {streakLabel} de sequência
            </p>
            {league.leagueName && league.userPosition && (
              <p className="text-xs text-muted-foreground mt-0.5">
                <Crown size={10} className="inline text-xp mr-1" />
                {league.userPosition}º lugar na {league.leagueName}
              </p>
            )}
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <span
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold",
                  loggedToday
                    ? "bg-success/15 text-success"
                    : "bg-destructive/15 text-destructive"
                )}
              >
                {loggedToday ? `✓ ${todayMeals} ${todayMeals === 1 ? "refeição" : "refeições"} hoje` : "⚠ Falta registrar hoje"}
              </span>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── BLOCK 2: Active Challenge + CTA ── */}
      <motion.section
        className="rounded-2xl border border-border bg-card overflow-hidden card-elevated mb-4"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Trophy size={14} className="text-xp" />
            <h2 className="text-sm font-display font-bold text-foreground">Desafio ativo</h2>
          </div>

          {activeChallenge ? (
            <>
              <p className="text-sm font-medium text-foreground mb-1">
                {activeChallenge.title}
              </p>
              <p className="text-xs text-muted-foreground mb-3">
                {activeChallenge.description}
              </p>

              {/* Progress bar */}
              <div className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px] text-muted-foreground font-medium">Progresso</span>
                  <span className="text-[11px] font-bold text-primary">
                    {activeChallenge.progress?.progress_days ?? 0} / {activeChallenge.duration_days} dias
                  </span>
                </div>
                <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--streak-glow)))",
                    }}
                    initial={{ width: 0 }}
                    animate={{
                      width: `${Math.min(((activeChallenge.progress?.progress_days ?? 0) / activeChallenge.duration_days) * 100, 100)}%`,
                    }}
                    transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-3">
              <p className="text-xs text-muted-foreground mb-2">Nenhum desafio ativo</p>
              <button
                onClick={() => navigate("/desafios")}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Ver desafios disponíveis →
              </button>
            </div>
          )}
        </div>
      </motion.section>

      {/* ── MAIN CTA: Registrar Refeição ── */}
      <motion.div
        className="my-5 flex justify-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.12 }}
      >
        <GradientButton
          onClick={() => navigate("/registrar")}
          className="w-full py-4 text-sm font-display font-bold gap-2"
        >
          <Utensils size={18} strokeWidth={2.5} />
          Registrar refeição
        </GradientButton>
      </motion.div>

      {/* ── BLOCK 3: Top 3 Ranking ── */}
      <motion.section
        className="rounded-2xl border border-border bg-card overflow-hidden card-elevated mb-4"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Crown size={14} className="text-xp" />
              <h2 className="text-sm font-display font-bold text-foreground">Top 3 da liga</h2>
            </div>
            {league.members.length > 3 && (
              <button
                onClick={() => navigate(league.leagueId ? `/ligas/${league.leagueId}` : "/ligas")}
                className="text-[11px] font-medium text-muted-foreground hover:text-foreground flex items-center gap-0.5 transition-colors"
              >
                Ver todos <ChevronRight size={10} />
              </button>
            )}
          </div>

          {league.loading ? (
            <div className="py-4 flex justify-center">
              <motion.div
                className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            </div>
          ) : league.members.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-xs text-muted-foreground mb-2">Você não está em uma liga</p>
              <button
                onClick={() => navigate("/ligas")}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Entrar em uma liga →
              </button>
            </div>
          ) : (
            <div className="space-y-1.5">
              {league.members.slice(0, 3).map((member, i) => {
                const medals = ["🥇", "🥈", "🥉"];
                return (
                  <motion.div
                    key={member.userId}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2 rounded-lg",
                      member.isCurrentUser
                        ? "bg-primary/8 border border-primary/15"
                        : "bg-secondary/30"
                    )}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.05 }}
                  >
                    <span className="text-sm">{medals[i]}</span>
                    <p className="flex-1 text-xs font-medium text-foreground truncate">
                      {member.name}
                      {member.isCurrentUser && (
                        <span className="text-primary text-[9px] ml-1 font-bold">(você)</span>
                      )}
                    </p>
                    <div className="flex items-center gap-1">
                      <Flame size={10} className="text-primary" />
                      <span className="text-xs font-bold text-foreground">{member.currentStreak}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </motion.section>

      {/* ── BLOCK: Today's Meals ── */}
      <HomeMealsBlock />

      {/* ── BLOCK 4: League Activity Feed ── */}
      <motion.section
        className="rounded-2xl border border-border bg-card overflow-hidden card-elevated"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Activity size={14} className="text-primary" />
            <h2 className="text-sm font-display font-bold text-foreground">Atividade da liga</h2>
          </div>

          {activityLoading ? (
            <div className="py-4 flex justify-center">
              <motion.div
                className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            </div>
          ) : activities.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              Nenhuma atividade recente
            </p>
          ) : (
            <div className="space-y-2">
              {activities.map((item, i) => (
                <motion.div
                  key={item.id}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-secondary/20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 + i * 0.04 }}
                >
                  <span className="text-sm flex-shrink-0">
                    {item.type === "meal" ? "🍽️" : "🔥"}
                  </span>
                  <p className="flex-1 text-xs text-foreground/80 font-medium truncate">
                    {item.detail}
                  </p>
                  {item.timeAgo && (
                    <span className="text-[10px] text-muted-foreground flex-shrink-0">
                      {item.timeAgo}
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.section>
    </div>
  );
};

export default Index;
