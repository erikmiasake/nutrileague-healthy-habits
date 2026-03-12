import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Trophy, Zap, Star, Crown, Flame, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useChallenges, type ChallengeWithProgress, type ChallengeType } from "@/hooks/useChallenges";
import LeagueChallengeCard from "@/components/LeagueChallengeCard";
import { supabase } from "@/integrations/supabase/client";
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

/* ── Create Challenge Dialog ── */
const CreateChallengeDialog = ({
  open,
  onOpenChange,
  type,
  leagueId,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  type: ChallengeType;
  leagueId?: string | null;
  onCreated: () => void;
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [days, setDays] = useState("7");
  const [xp, setXp] = useState("100");
  const [submitting, setSubmitting] = useState(false);

  const labels: Record<ChallengeType, string> = {
    personal: "Novo desafio pessoal",
    league: "Novo desafio da liga",
    event: "Novo evento especial",
  };

  const handleCreate = async () => {
    if (!title.trim()) { toast.error("Dê um título ao desafio"); return; }
    if (type === "league" && !leagueId) { toast.error("Você precisa estar em uma liga"); return; }
    setSubmitting(true);
    const { error } = await supabase.from("challenges").insert({
      title: title.trim(),
      description: description.trim() || title.trim(),
      type,
      duration_days: Math.max(1, parseInt(days) || 7),
      xp_reward: Math.max(0, parseInt(xp) || 100),
      league_id: type === "league" ? leagueId : null,
    });
    setSubmitting(false);
    if (error) { toast.error("Erro ao criar desafio"); return; }
    toast.success("Desafio criado! 🔥");
    setTitle(""); setDescription(""); setDays("7"); setXp("100");
    onOpenChange(false);
    onCreated();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[360px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display">{labels[type]}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          <Input placeholder="Título do desafio" value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-xl" />
          <Textarea placeholder="Descrição (opcional)" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="rounded-xl resize-none" />
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-[10px] text-muted-foreground font-medium mb-1 block">Duração (dias)</label>
              <Input type="number" value={days} onChange={(e) => setDays(e.target.value)} min={1} className="rounded-xl" />
            </div>
            <div className="flex-1">
              <label className="text-[10px] text-muted-foreground font-medium mb-1 block">XP de recompensa</label>
              <Input type="number" value={xp} onChange={(e) => setXp(e.target.value)} min={0} className="rounded-xl" />
            </div>
          </div>
          <button
            onClick={handleCreate}
            disabled={submitting}
            className="w-full bg-primary text-primary-foreground font-bold text-sm py-2.5 rounded-xl active:scale-95 transition-transform disabled:opacity-50"
          >
            {submitting ? "Criando..." : "Criar desafio"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const Challenges = () => {
  const { personal, league, event, userLeagueIds, loading, joinChallenge } = useChallenges();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>("personal");
  const [dialogOpen, setDialogOpen] = useState(false);

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
  const currentType = activeTab as ChallengeType;
  const canCreate = activeTab !== "league" || hasLeague;

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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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

      {/* Floating + button */}
      {canCreate && (
        <button
          onClick={() => setDialogOpen(true)}
          className="fixed bottom-24 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg active:scale-95 transition-transform"
          aria-label="Criar desafio"
        >
          <Plus size={28} strokeWidth={2.5} />
        </button>
      )}

      <CreateChallengeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        type={currentType}
        leagueId={hasLeague ? userLeagueIds[0] : null}
        onCreated={() => {
          queryClient.invalidateQueries({ queryKey: ["challenges"] });
          queryClient.invalidateQueries({ queryKey: ["challenge_progress"] });
        }}
      />
    </div>
  );
};

export default Challenges;
