import { Trophy, Zap, Star, Crown, Flame } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useChallenges, type ChallengeWithProgress } from "@/hooks/useChallenges";
import LeagueChallengeCard from "@/components/LeagueChallengeCard";
import { cn } from "@/lib/utils";

const ChallengeCard = ({
  challenge,
  index,
  onJoin,
  joining,
}: {
  challenge: ChallengeWithProgress;
  index: number;
  onJoin: (id: string) => void;
  joining: boolean;
}) => {
  const joined = !!challenge.progress;
  const progressDays = challenge.progress?.progress_days ?? 0;
  const progressPct = Math.min((progressDays / challenge.duration_days) * 100, 100);
  const completed = challenge.progress?.completed ?? false;

  return (
    <motion.div
      className="bg-card rounded-2xl p-4 border border-border"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-display font-semibold text-foreground">{challenge.title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{challenge.description}</p>
        </div>
        <div className="flex items-center gap-1 bg-primary/10 text-primary rounded-full px-2 py-0.5 ml-2 shrink-0">
          <Zap size={10} />
          <span className="text-[10px] font-bold">{challenge.xp_reward} XP</span>
        </div>
      </div>

      {joined && (
        <div className="mb-3">
          <div className="flex justify-between text-[10px] text-muted-foreground mb-1.5">
            <span className="font-medium">Progresso</span>
            <span className="font-bold text-foreground">
              {progressDays}/{challenge.duration_days} dias
            </span>
          </div>
          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: completed
                  ? "hsl(var(--success))"
                  : "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--streak-glow, var(--primary))))",
              }}
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Trophy size={12} />
          <span className="text-[10px] font-medium">{challenge.duration_days} dias</span>
        </div>
        <button
          onClick={() => {
            if (!joined && !joining) {
              onJoin(challenge.id);
              toast.success("Você entrou no desafio! 💪");
            }
          }}
          disabled={joined || joining}
          className={cn(
            "text-xs font-bold px-3.5 py-1.5 rounded-full transition-all active:scale-95",
            completed
              ? "bg-success/15 text-success"
              : joined
                ? "bg-secondary text-muted-foreground"
                : "bg-primary text-primary-foreground"
          )}
        >
          {completed ? "Concluído ✓" : joined ? "Participando" : "Participar"}
        </button>
      </div>
    </motion.div>
  );
};

const EmptyState = ({ message, cta }: { message: string; cta?: { label: string; onClick: () => void } }) => (
  <motion.div
    className="text-center py-10"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.1 }}
  >
    <Trophy size={28} className="text-muted-foreground/40 mx-auto mb-2" />
    <p className="text-xs text-muted-foreground mb-3">{message}</p>
    {cta && (
      <button
        onClick={cta.onClick}
        className="text-xs font-bold bg-primary text-primary-foreground px-4 py-2 rounded-full active:scale-95 transition-transform"
      >
        {cta.label}
      </button>
    )}
  </motion.div>
);

const Challenges = () => {
  const { personal, league, event, userLeagueIds, loading, joinChallenge } = useChallenges();
  const navigate = useNavigate();

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

  const hasLeague = userLeagueIds.length > 0;

  return (
    <div className="min-h-screen bg-background pb-24 px-4 pt-6 max-w-[430px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h1 className="text-2xl font-display font-bold text-foreground mb-0.5">Desafios</h1>
        <p className="text-sm text-muted-foreground mb-5">Participe e ganhe XP extra</p>
      </motion.div>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="w-full bg-secondary/50 rounded-xl p-1 mb-4">
          <TabsTrigger
            value="personal"
            className="flex-1 text-xs font-bold rounded-lg data-[state=active]:bg-card data-[state=active]:text-foreground"
          >
            <Star size={12} className="mr-1" />
            Pessoais
          </TabsTrigger>
          <TabsTrigger
            value="league"
            className="flex-1 text-xs font-bold rounded-lg data-[state=active]:bg-card data-[state=active]:text-foreground"
          >
            <Crown size={12} className="mr-1" />
            Liga
          </TabsTrigger>
          <TabsTrigger
            value="event"
            className="flex-1 text-xs font-bold rounded-lg data-[state=active]:bg-card data-[state=active]:text-foreground"
          >
            <Flame size={12} className="mr-1" />
            Eventos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <div className="space-y-3">
            {personal.length === 0 ? (
              <EmptyState message="Nenhum desafio pessoal disponível" />
            ) : (
              personal.map((c, i) => (
                <ChallengeCard
                  key={c.id}
                  challenge={c}
                  index={i}
                  onJoin={(id) => joinChallenge.mutate(id)}
                  joining={joinChallenge.isPending}
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="league">
          <div className="space-y-3">
            {!hasLeague ? (
              <EmptyState
                message="Você ainda não está em nenhuma liga. Entre em uma para competir com amigos!"
                cta={{ label: "Entrar em uma Liga", onClick: () => navigate("/ligas") }}
              />
            ) : league.length === 0 ? (
              <EmptyState message="Nenhum desafio da liga disponível no momento" />
            ) : (
              league.map((c, i) => (
                <LeagueChallengeCard key={c.id} challenge={c} index={i} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="event">
          <div className="space-y-3">
            {event.length === 0 ? (
              <EmptyState message="Nenhum evento especial no momento" />
            ) : (
              event.map((c, i) => (
                <ChallengeCard
                  key={c.id}
                  challenge={c}
                  index={i}
                  onJoin={(id) => joinChallenge.mutate(id)}
                  joining={joinChallenge.isPending}
                />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Challenges;
