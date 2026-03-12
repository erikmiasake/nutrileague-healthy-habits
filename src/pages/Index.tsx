import { Flame, CheckCircle2, AlertCircle, ChevronRight, Crown, Plus, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import nutrileagueLogo from "@/assets/nutrileague-logo.png";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useLeagueRanking } from "@/hooks/useLeagueRanking";
import { cn } from "@/lib/utils";

const getStreakMotivation = (streak: number): string => {
  if (streak === 0) return "Comece hoje! Seu primeiro dia te espera 🚀";
  if (streak === 1) return "Primeiro passo concluído 🚀";
  if (streak < 7) return "Continue assim! Falta pouco para sua primeira semana 💪";
  if (streak < 14) return "Uma semana completa! Você está voando 🔥";
  if (streak < 21) return "Duas semanas! Isso já virou hábito 🏆";
  if (streak < 30) return "Quase lá! A meta do mês está perto ⭐";
  return "Meta do mês alcançada! Você é incrível 🎉";
};

const Index = () => {
  const navigate = useNavigate();
  const { currentStreak, userName, loggedToday, loading } = useDashboardData();
  const league = useLeagueRanking();

  const goal = 30;
  const progress = Math.min(currentStreak / goal, 1);
  const streakLabel = currentStreak === 1 ? "dia" : "dias";

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

  // Competition insight
  const getCompetitionInsight = () => {
    if (!league.userPosition || league.members.length <= 1) return null;
    if (league.userPosition === 1) return "🏆 Você está liderando!";
    const above = league.members[league.userPosition - 2];
    if (!above) return null;
    const diff = above.currentStreak - currentStreak;
    if (diff <= 0) return "🔥 Você está empatado na liderança!";
    return `Faltam ${diff} ${diff === 1 ? "dia" : "dias"} para ultrapassar ${above.name.split(" ")[0]}`;
  };

  return (
    <div className="min-h-screen bg-background pb-24 px-4 pt-5 max-w-[430px] mx-auto">
      {/* ── HEADER ── */}
      <motion.header
        className="mb-5 flex items-center gap-3 px-1"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-display font-bold text-foreground leading-tight">
            {userName}
          </h1>
          {league.leagueName && (
            <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
              Liga: {league.leagueName}
            </p>
          )}
        </div>
        <img
          src={nutrileagueLogo}
          alt="NutriLeague"
          className="h-6 w-auto object-contain opacity-70"
        />
      </motion.header>

      {/* ── BLOCK 1: Streak Card ── */}
      <motion.section
        className="relative rounded-2xl border border-border bg-card overflow-hidden card-elevated mb-4"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.04 }}
      >
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-[70px] opacity-[0.08]"
            style={{ background: "hsl(var(--primary))" }}
          />
        </div>

        <div className="relative z-10 p-5">
          {/* Streak number with glow */}
          <div className="text-center mb-3">
            <motion.div
              className="inline-flex items-baseline gap-2"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1, type: "spring", stiffness: 150 }}
            >
              <Flame className="text-primary self-center" size={28} />
              <span
                className="text-5xl font-display font-extrabold text-foreground tracking-tighter"
                style={{
                  textShadow: "0 0 24px hsl(var(--primary) / 0.35), 0 0 48px hsl(var(--primary) / 0.15)",
                }}
              >
                {currentStreak}
              </span>
              <span className="text-base font-display font-bold text-muted-foreground">
                {streakLabel}
              </span>
            </motion.div>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">Sequência atual</p>
          </div>

          {/* Today status */}
          <motion.div
            className={cn(
              "flex items-center gap-2 rounded-xl px-3.5 py-2.5 mb-3",
              loggedToday
                ? "bg-success/8 border border-success/15"
                : "bg-destructive/8 border border-destructive/15"
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            {loggedToday ? (
              <>
                <CheckCircle2 size={16} className="text-success shrink-0" />
                <span className="text-xs font-medium text-success">Refeição registrada hoje</span>
              </>
            ) : (
              <>
                <AlertCircle size={16} className="text-destructive shrink-0" />
                <span className="text-xs font-medium text-destructive">Falta registrar refeição hoje</span>
              </>
            )}
          </motion.div>

          {/* Monthly progress */}
          <div className="mb-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[11px] text-muted-foreground font-medium">Progresso do mês</span>
              <span className="text-[11px] font-bold text-primary">{currentStreak} de {goal} dias</span>
            </div>
            <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--streak-glow)))",
                  boxShadow: "0 0 8px hsl(var(--primary) / 0.3)",
                }}
                initial={{ width: 0 }}
                animate={{ width: `${progress * 100}%` }}
                transition={{ duration: 0.9, delay: 0.35, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Streak motivation */}
          <motion.p
            className="text-[11px] text-center text-muted-foreground/70 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {getStreakMotivation(currentStreak)}
          </motion.p>
        </div>
      </motion.section>

      {/* ── BLOCK 2: Action Button ── */}
      <motion.div
        className="mb-5"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.12 }}
      >
        <button
          onClick={() => navigate("/registrar")}
          className={cn(
            "w-full py-3.5 rounded-2xl font-display font-bold text-[15px]",
            "flex items-center justify-center gap-2",
            "bg-primary text-primary-foreground",
            "active:scale-[0.97] transition-all duration-150",
          )}
          style={{
            boxShadow: "0 4px 16px hsl(var(--primary) / 0.3)",
          }}
        >
          <Plus size={18} strokeWidth={2.5} />
          Registrar refeição
        </button>
      </motion.div>

      {/* ── BLOCK 3: League Ranking ── */}
      <motion.section
        className="rounded-2xl border border-border bg-card overflow-hidden card-elevated"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.2 }}
      >
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Crown size={14} className="text-xp" />
            <h2 className="text-sm font-display font-bold text-foreground">
              {league.leagueName ? `Ranking — ${league.leagueName}` : "Ranking da liga"}
            </h2>
          </div>

          {league.loading ? (
            <div className="py-5 flex justify-center">
              <motion.div
                className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            </div>
          ) : league.members.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-xs text-muted-foreground mb-3">Você ainda não está em uma liga</p>
              <button
                onClick={() => navigate("/ligas")}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Entrar em uma liga →
              </button>
            </div>
          ) : league.members.length === 1 ? (
            <div className="text-center py-5">
              <Users size={20} className="text-muted-foreground mx-auto mb-2" />
              <p className="text-xs text-muted-foreground mb-3">Convide amigos para competir na sua liga</p>
              <button
                onClick={() => navigate(league.leagueId ? `/ligas/${league.leagueId}` : "/ligas")}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary/10 text-xs font-semibold text-primary hover:bg-primary/15 transition-colors"
              >
                Convidar amigos
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-1.5 mb-3">
                {league.members.slice(0, 5).map((member, i) => (
                  <motion.div
                    key={member.userId}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all",
                      member.isCurrentUser
                        ? "bg-primary/8 border border-primary/15"
                        : "bg-secondary/30"
                    )}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 + i * 0.04 }}
                  >
                    <span
                      className={cn(
                        "text-xs font-display font-bold w-5 text-center",
                        i === 0 && "text-xp",
                        i > 0 && "text-muted-foreground"
                      )}
                    >
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">
                        {member.name}
                        {member.isCurrentUser && (
                          <span className="text-primary text-[9px] ml-1 font-bold">(você)</span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Flame size={10} className="text-primary" />
                      <span className="text-xs font-bold text-foreground">
                        {member.currentStreak}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {member.currentStreak === 1 ? "dia" : "dias"}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Competition insight */}
              {getCompetitionInsight() && (
                <motion.p
                  className="text-[11px] text-center text-muted-foreground font-medium mb-3 px-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.55 }}
                >
                  {getCompetitionInsight()}
                </motion.p>
              )}

              <button
                onClick={() => navigate(league.leagueId ? `/ligas/${league.leagueId}` : "/ligas")}
                className="w-full flex items-center justify-center gap-1 py-2 rounded-lg bg-secondary/50 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                Ver ranking completo
                <ChevronRight size={12} />
              </button>
            </>
          )}
        </div>
      </motion.section>
    </div>
  );
};

export default Index;
