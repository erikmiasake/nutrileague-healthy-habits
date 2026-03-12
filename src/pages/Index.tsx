import { Flame, CheckCircle2, AlertCircle, ChevronRight, Crown, Utensils } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import nutrileagueLogo from "@/assets/nutrileague-logo.png";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useLeagueRanking } from "@/hooks/useLeagueRanking";
import { cn } from "@/lib/utils";

const Index = () => {
  const navigate = useNavigate();
  const { currentStreak, userName, loggedToday, loading } = useDashboardData();
  const league = useLeagueRanking();

  const goal = 30;
  const progress = Math.min(currentStreak / goal, 1);

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

  // Motivational message
  const getMotivationalMessage = () => {
    if (!league.userPosition || league.members.length <= 1) return null;
    if (league.userPosition === 1) return "🏆 Você está liderando!";
    const above = league.members[league.userPosition - 2];
    if (!above) return null;
    const diff = above.currentStreak - currentStreak;
    if (diff <= 0) return "🔥 Você está empatado na liderança!";
    return `Faltam ${diff} dia${diff > 1 ? "s" : ""} para ultrapassar ${above.name.split(" ")[0]}`;
  };

  return (
    <div className="min-h-screen bg-background pb-24 px-4 pt-8 max-w-[430px] mx-auto">
      {/* Header */}
      <motion.header
        className="mb-8 flex items-center gap-3"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex-1">
          <p className="text-xs text-muted-foreground font-medium mb-0.5">Olá,</p>
          <h1 className="text-2xl font-display font-bold leading-none text-foreground">
            {userName}
          </h1>
        </div>
        <img
          src={nutrileagueLogo}
          alt="NutriLeague"
          className="h-7 w-auto object-contain opacity-80"
        />
      </motion.header>

      {/* ── BLOCK 1: Streak Card ── */}
      <motion.section
        className="relative rounded-3xl border border-border bg-card overflow-hidden card-elevated mb-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
      >
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute -top-16 left-1/2 -translate-x-1/2 w-56 h-56 rounded-full blur-[80px] opacity-[0.10]"
            style={{ background: "hsl(var(--primary))" }}
          />
        </div>

        <div className="relative z-10 p-6">
          {/* Streak number */}
          <div className="text-center mb-4">
            <motion.div
              className="inline-flex items-center gap-2"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.15, type: "spring", stiffness: 140 }}
            >
              <Flame className="text-primary" size={32} />
              <span className="text-6xl font-display font-extrabold text-foreground tracking-tighter">
                {currentStreak}
              </span>
              <span className="text-lg font-display font-bold text-muted-foreground self-end mb-1">
                dias
              </span>
            </motion.div>
            <p className="text-sm text-muted-foreground font-medium mt-1">Sequência atual</p>
          </div>

          {/* Today status */}
          <motion.div
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-3 mb-4",
              loggedToday
                ? "bg-success/10 border border-success/20"
                : "bg-destructive/10 border border-destructive/20"
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {loggedToday ? (
              <>
                <CheckCircle2 size={18} className="text-success shrink-0" />
                <span className="text-sm font-medium text-success">Refeição registrada hoje</span>
              </>
            ) : (
              <>
                <AlertCircle size={18} className="text-destructive shrink-0" />
                <span className="text-sm font-medium text-destructive">Falta registrar refeição hoje</span>
              </>
            )}
          </motion.div>

          {/* Monthly goal progress */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs text-muted-foreground font-medium">Meta do mês</span>
              <span className="text-xs font-bold text-primary">{currentStreak}/{goal} dias</span>
            </div>
            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--streak-glow)))",
                  boxShadow: "0 0 10px hsl(var(--primary) / 0.4)",
                }}
                initial={{ width: 0 }}
                animate={{ width: `${progress * 100}%` }}
                transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── BLOCK 2: Action Button ── */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <button
          onClick={() => navigate("/registrar")}
          className={cn(
            "w-full py-4 rounded-2xl font-display font-bold text-base",
            "flex items-center justify-center gap-2.5",
            "bg-primary text-primary-foreground",
            "active:scale-[0.97] transition-all duration-150",
            "shadow-lg hover:shadow-xl",
          )}
          style={{
            boxShadow: "0 4px 20px hsl(var(--primary) / 0.35)",
          }}
        >
          <Utensils size={20} strokeWidth={2.5} />
          Registrar refeição saudável
        </button>
      </motion.div>

      {/* ── BLOCK 3: League Ranking ── */}
      <motion.section
        className="rounded-3xl border border-border bg-card overflow-hidden card-elevated"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
      >
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Crown size={16} className="text-xp" />
              <h2 className="text-base font-display font-bold text-foreground">
                {league.leagueName ? `Ranking — ${league.leagueName}` : "Ranking da liga"}
              </h2>
            </div>
          </div>

          {league.loading ? (
            <div className="py-6 flex justify-center">
              <motion.div
                className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            </div>
          ) : league.members.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground mb-3">Você ainda não está em uma liga</p>
              <button
                onClick={() => navigate("/ligas")}
                className="text-sm font-semibold text-primary hover:underline"
              >
                Entrar em uma liga →
              </button>
            </div>
          ) : (
            <>
              {/* Ranking list */}
              <div className="space-y-2 mb-4">
                {league.members.slice(0, 5).map((member, i) => (
                  <motion.div
                    key={member.userId}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all",
                      member.isCurrentUser
                        ? "bg-primary/10 border border-primary/20"
                        : "bg-secondary/40"
                    )}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                  >
                    <span
                      className={cn(
                        "text-sm font-display font-bold w-6 text-center",
                        i === 0 && "text-xp",
                        i === 1 && "text-muted-foreground",
                        i === 2 && "text-primary",
                        i > 2 && "text-muted-foreground"
                      )}
                    >
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {member.name}
                        {member.isCurrentUser && (
                          <span className="text-primary text-[10px] ml-1.5 font-bold">(você)</span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Flame size={12} className="text-primary" />
                      <span className="text-sm font-bold text-foreground">{member.currentStreak}</span>
                      <span className="text-xs text-muted-foreground">dias</span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Motivational message */}
              {getMotivationalMessage() && (
                <motion.p
                  className="text-xs text-center text-muted-foreground font-medium mb-4 px-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  {getMotivationalMessage()}
                </motion.p>
              )}

              {/* View full ranking */}
              <button
                onClick={() => navigate(league.leagueId ? `/ligas/${league.leagueId}` : "/ligas")}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-secondary/60 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                Ver ranking completo
                <ChevronRight size={14} />
              </button>
            </>
          )}
        </div>
      </motion.section>
    </div>
  );
};

export default Index;
