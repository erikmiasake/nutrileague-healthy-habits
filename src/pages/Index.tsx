import { Flame, ChevronRight, Crown, Utensils, Trophy, Info, Sparkles, UserPlus, Share2 } from "lucide-react";
import { GradientButton } from "@/components/ui/gradient-button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { NutriLeagueLogo } from "@/components/NutriLeagueLogo";
import AppSidebar from "@/components/AppSidebar";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useLeagueRanking } from "@/hooks/useLeagueRanking";
import { useChallenges } from "@/hooks/useChallenges";
import { cn } from "@/lib/utils";
import HomeMealsBlock from "@/components/HomeMealsBlock";
import UserAvatar from "@/components/UserAvatar";

const Index = () => {
  const navigate = useNavigate();
  const { currentStreak, userName, todayMeals, loading, dailyHealthScore, dailyHealthClassification } = useDashboardData();
  const league = useLeagueRanking();
  const { personal, league: leagueChallenges, event } = useChallenges();

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
  const firstName = userName?.split(" ")[0] || "";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  return (
    <div className="min-h-screen bg-background pb-24 px-4 pt-5 max-w-[430px] mx-auto">
      {/* ── HEADER ── */}
      <motion.header
        className="mb-4 flex items-center justify-between"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <AppSidebar />
        <NutriLeagueLogo />
        <button
          onClick={() => navigate("/sobre")}
          className="gradient-button flex items-center justify-center w-9 h-9 rounded-xl min-w-0 p-0"
          aria-label="Sobre o NutriLeague"
        >
          <Info size={18} strokeWidth={2.5} />
        </button>
      </motion.header>

      {/* Greeting */}
      <motion.div
        className="mb-3 px-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.05 }}
      >
        <h1 className="text-lg font-display font-bold text-foreground leading-tight">
          {greeting}, {firstName}
        </h1>
      </motion.div>

      {/* ── HERO: STREAK ── */}
      <motion.section
        className="relative rounded-3xl overflow-hidden mb-4 border border-primary/25"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.08 }}
        style={{
          background:
            "radial-gradient(120% 90% at 100% 0%, hsl(24 100% 56% / 0.28) 0%, hsl(24 100% 45% / 0.08) 40%, hsl(228 12% 10%) 75%)",
          boxShadow: "0 10px 40px -12px hsl(24 100% 50% / 0.35)",
        }}
      >
        {/* Ambient glow blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-16 -right-10 w-56 h-56 rounded-full bg-primary/25 blur-3xl" />
          <div className="absolute -bottom-20 -left-10 w-48 h-48 rounded-full bg-primary/10 blur-3xl" />
        </div>

        <div className="relative p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-1.5">
              <Sparkles size={12} className="text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary/90">
                Sua sequência
              </span>
            </div>
            {league.leagueName && league.userPosition && (
              <button
                onClick={() => navigate(league.leagueId ? `/ligas/${league.leagueId}` : "/ligas")}
                className="flex items-center gap-1 rounded-full bg-white/5 backdrop-blur px-2.5 py-1 border border-white/10 hover:bg-white/10 transition"
              >
                <Crown size={10} className="text-xp" />
                <span className="text-[10px] font-bold text-foreground">
                  {league.userPosition}º · {league.leagueName}
                </span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Big flame with glow */}
            <motion.div
              className="relative flex-shrink-0"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            >
              <div
                className="absolute inset-0 rounded-full blur-2xl bg-primary/60"
                style={{ transform: "scale(1.4)" }}
              />
              <div className="relative w-20 h-20 rounded-2xl flex items-center justify-center bg-gradient-to-br from-primary via-primary to-[hsl(14_90%_45%)] shadow-[0_8px_24px_-4px_hsl(24_100%_50%/0.6)]">
                <Flame size={42} strokeWidth={2.2} className="text-white drop-shadow-lg" fill="currentColor" fillOpacity={0.25} />
              </div>
            </motion.div>

            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-1.5">
                <motion.span
                  className="text-6xl font-display font-black text-foreground leading-none tracking-tighter"
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 180, delay: 0.15 }}
                >
                  {currentStreak}
                </motion.span>
                <span className="text-lg font-display font-bold text-foreground/70">
                  {streakLabel}
                </span>
              </div>
              <p className="text-xs text-foreground/70 mt-1 font-medium">
                {currentStreak === 0
                  ? "Comece sua jornada hoje 🚀"
                  : currentStreak < 3
                    ? "Continue, você tá esquentando 🔥"
                    : currentStreak < 7
                      ? "Tá pegando fogo! 🔥"
                      : "Máquina de consistência ⚡"}
              </p>
            </div>
          </div>

          {/* Meals-today pill (positive, brand orange) */}
          <div className="mt-4 flex items-center gap-2 rounded-2xl bg-black/25 backdrop-blur border border-white/5 px-3.5 py-2.5">
            <div className={cn(
              "w-2 h-2 rounded-full flex-shrink-0",
              todayMeals > 0 ? "bg-success" : "bg-primary animate-pulse"
            )} />
            <p className="text-xs font-medium text-foreground/90 flex-1">
              {todayMeals === 0
                ? "Registre sua primeira refeição de hoje 🔥"
                : `${todayMeals} ${todayMeals === 1 ? "refeição registrada" : "refeições registradas"} hoje`}
            </p>
          </div>
        </div>
      </motion.section>

      {/* ── PRIMARY CTA ── */}
      <motion.div
        className="mb-5"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
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

      {/* ── DESAFIO ── */}
      <div className="mb-4">
        {/* Desafio ativo */}
        <motion.button
          onClick={() => navigate("/desafios")}
          className="relative w-full rounded-2xl bg-card border border-border overflow-hidden p-3.5 text-left card-elevated"
          style={{ borderLeftWidth: 3, borderLeftColor: "hsl(var(--xp))" }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
        >
          <div className="flex items-center gap-1.5 mb-2">
            <Trophy size={12} className="text-xp" fill="currentColor" fillOpacity={0.2} />
            <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              Desafio
            </span>
          </div>
          {activeChallenge ? (
            <>
              <p className="text-sm font-display font-bold text-foreground leading-snug mb-1.5 break-words">
                {activeChallenge.title}
              </p>
              <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden mb-1">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-xp to-primary"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min(((activeChallenge.progress?.progress_days ?? 0) / activeChallenge.duration_days) * 100, 100)}%`,
                  }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                />
              </div>
              <p className="text-[10px] font-bold text-xp">
                {activeChallenge.progress?.progress_days ?? 0}/{activeChallenge.duration_days} dias
              </p>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-dashed border-xp/40 flex items-center justify-center shrink-0">
                <Trophy size={16} className="text-xp/60" />
              </div>
              <p className="text-[11px] font-medium text-foreground/70">
                Escolher desafio
              </p>
            </div>
          )}
        </motion.button>
      </div>


      {/* ── COACH SPARK ── */}
      <motion.button
        onClick={() => navigate("/coach")}
        className="relative w-full rounded-2xl overflow-hidden mb-4 p-4 text-left group"
        style={{
          background:
            "linear-gradient(135deg, hsl(24 100% 56% / 0.15) 0%, hsl(280 60% 50% / 0.10) 100%)",
          boxShadow: "0 0 0 1px hsl(24 100% 56% / 0.35), 0 8px 24px -12px hsl(24 100% 50% / 0.45)",
        }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="pointer-events-none absolute -top-8 -right-8 w-32 h-32 rounded-full bg-primary/25 blur-3xl" />
        <div className="relative flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-[hsl(14_90%_45%)] flex items-center justify-center shrink-0 shadow-[0_4px_12px_-2px_hsl(24_100%_50%/0.6)]">
            <Sparkles size={18} className="text-white" fill="currentColor" fillOpacity={0.3} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                Spark · seu coach
              </span>
              <ChevronRight size={14} className="text-primary shrink-0 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <p className="text-sm font-medium text-foreground leading-snug">
              {(() => {
                if (todayMeals === 0) return "Ainda sem refeição hoje. Que tal começar com algo leve?";
                if (dailyHealthScore !== null && dailyHealthScore >= 80)
                  return `Score ${dailyHealthScore} hoje — você tá voando. Peça uma dica pra manter o ritmo.`;
                if (dailyHealthScore !== null && dailyHealthScore < 60)
                  return `Seu score hoje tá em ${dailyHealthScore}. Vamos ajustar? Toque pra conversar.`;
                if (currentStreak >= 3) return `${currentStreak} dias seguidos! Quer um plano pra fechar a semana?`;
                return "Toque pra conversar sobre suas refeições e metas.";
              })()}
            </p>
          </div>
        </div>
      </motion.button>

      {/* ── LIGA (compact) ── */}
      <motion.section
        className="rounded-2xl border border-border bg-card overflow-hidden card-elevated mb-4"
        style={{ borderLeftWidth: 3, borderLeftColor: "hsl(var(--level))" }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22 }}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <Crown size={12} className="text-[hsl(var(--level))]" fill="currentColor" fillOpacity={0.2} />
              <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                {league.activeMembersCount >= 2 ? "Top da liga" : league.leagueName ? "Sua liga" : "Ligas"}
              </span>
            </div>
            {league.activeMembersCount >= 2 && league.members.length > 3 && (
              <button
                onClick={() => navigate(league.leagueId ? `/ligas/${league.leagueId}` : "/ligas")}
                className="text-[10px] font-medium text-muted-foreground hover:text-foreground flex items-center gap-0.5 transition-colors"
              >
                Ver todos <ChevronRight size={10} />
              </button>
            )}
          </div>

          {league.loading ? (
            <div className="py-3 flex justify-center">
              <motion.div
                className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            </div>
          ) : league.members.length === 0 ? (
            <button
              onClick={() => navigate("/ligas")}
              className="w-full text-left text-xs font-semibold text-[hsl(var(--level))] hover:underline py-1"
            >
              Entrar em uma liga →
            </button>
          ) : league.activeMembersCount < 2 ? (
            // Invite state — only 1 active member (usually just the user)
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[hsl(var(--level))]/15 border border-[hsl(var(--level))]/30 flex items-center justify-center shrink-0">
                <UserPlus size={18} className="text-[hsl(var(--level))]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-display font-bold text-foreground leading-tight mb-0.5">
                  Convide amigos pra {league.leagueName}
                </p>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Precisa de mais gente ativa pra começar a competir.
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const code = league.inviteCode;
                  if (!code) { navigate(league.leagueId ? `/ligas/${league.leagueId}` : "/ligas"); return; }
                  const text = `Entre na minha liga no NutriLeague! Código: ${code}`;
                  if (navigator.share) {
                    navigator.share({ title: `Liga ${league.leagueName}`, text }).catch(() => {});
                  } else {
                    navigator.clipboard.writeText(code);
                  }
                }}
                className="shrink-0 h-9 px-3 rounded-xl bg-[hsl(var(--level))] text-white text-xs font-bold flex items-center gap-1.5 hover:opacity-90 transition"
              >
                <Share2 size={12} /> Convidar
              </button>
            </div>
          ) : (
            <div className="flex gap-2 overflow-x-auto scrollbar-none -mx-1 px-1">
              {league.members.slice(0, 5).map((member, i) => {
                const medals = ["🥇", "🥈", "🥉"];
                return (
                  <motion.div
                    key={member.userId}
                    className={cn(
                      "flex-shrink-0 w-20 flex flex-col items-center gap-1.5 p-2 rounded-xl",
                      member.isCurrentUser
                        ? "bg-primary/10 border border-primary/25"
                        : "bg-secondary/30"
                    )}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 + i * 0.04 }}
                  >
                    <div className="relative">
                      <UserAvatar name={member.name} avatarUrl={member.avatarUrl} size="sm" />
                      {i < 3 && (
                        <span className="absolute -top-1 -right-1 text-xs">{medals[i]}</span>
                      )}
                    </div>
                    <p className="text-[10px] font-bold text-foreground truncate max-w-full">
                      {member.isCurrentUser ? "Você" : member.name.split(" ")[0]}
                    </p>
                    <span className="text-[10px] font-bold text-primary">{member.avgScore}pt</span>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </motion.section>

      {/* ── MEALS ── */}
      <HomeMealsBlock />
    </div>
  );
};

export default Index;
