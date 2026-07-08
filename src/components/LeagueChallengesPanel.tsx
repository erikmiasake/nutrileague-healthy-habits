import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Plus, Users, Check, Clock, Award, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import UserAvatar from "@/components/UserAvatar";
import { cn } from "@/lib/utils";

type Difficulty = "easy" | "medium" | "hard";
const DIFF_LABEL: Record<Difficulty, string> = { easy: "Fácil", medium: "Médio", hard: "Difícil" };
const DIFF_POINTS: Record<Difficulty, number> = { easy: 50, medium: 100, hard: 200 };
const DIFF_COLOR: Record<Difficulty, string> = {
  easy: "bg-success/15 text-success",
  medium: "bg-primary/15 text-primary",
  hard: "bg-destructive/15 text-destructive",
};

interface ChallengeRow {
  id: string;
  title: string;
  description: string;
  duration_days: number;
  difficulty: Difficulty | null;
  points_reward: number;
  ends_at: string | null;
  created_by: string | null;
  created_at: string;
}

interface ProgressRow {
  challenge_id: string;
  completed: boolean;
  points_awarded: number;
}

interface ParticipantCount { challenge_id: string; count: number }

interface ScoreRow {
  user_id: string;
  total_points: number;
  completed_count: number;
  name: string;
  avatarUrl: string | null;
}

interface Props {
  leagueId: string;
  isAdmin: boolean;
  currentUserId: string;
}

const daysUntil = (iso: string | null): number => {
  if (!iso) return 0;
  const ms = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
};

const LeagueChallengesPanel = ({ leagueId, isAdmin, currentUserId }: Props) => {
  const [challenges, setChallenges] = useState<ChallengeRow[]>([]);
  const [progress, setProgress] = useState<Record<string, ProgressRow>>({});
  const [participants, setParticipants] = useState<Record<string, number>>({});
  const [scoreboard, setScoreboard] = useState<ScoreRow[]>([]);
  const [lastCreatedAt, setLastCreatedAt] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const activeChallenges = challenges.filter(
    (c) => !c.ends_at || new Date(c.ends_at) > new Date()
  );
  const activeCount = activeChallenges.length;
  const cooldownRemaining = (() => {
    if (!lastCreatedAt) return 0;
    const ms = lastCreatedAt.getTime() + 3 * 24 * 60 * 60 * 1000 - Date.now();
    return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
  })();
  const canCreate = isAdmin && activeCount < 2 && cooldownRemaining === 0;
  const disabledReason =
    !isAdmin
      ? ""
      : activeCount >= 2
      ? "Limite de 2 desafios ativos atingido"
      : cooldownRemaining > 0
      ? `Aguarde ${cooldownRemaining} dia(s) para criar outro desafio`
      : "";

  const load = async () => {
    setLoading(true);
    const [{ data: cData }, { data: sData }] = await Promise.all([
      supabase
        .from("challenges")
        .select("id, title, description, duration_days, difficulty, points_reward, ends_at, created_by, created_at")
        .eq("league_id", leagueId)
        .eq("type", "league")
        .order("created_at", { ascending: false }),
      supabase.rpc("league_challenge_scoreboard", { _league_id: leagueId }),
    ]);

    const chList = (cData ?? []) as ChallengeRow[];
    setChallenges(chList);
    setLastCreatedAt(chList[0] ? new Date(chList[0].created_at) : null);

    const ids = chList.map((c) => c.id);
    if (ids.length > 0) {
      const [{ data: pData }, { data: allProg }] = await Promise.all([
        supabase
          .from("challenge_progress")
          .select("challenge_id, completed, points_awarded")
          .eq("user_id", currentUserId)
          .in("challenge_id", ids),
        supabase
          .from("challenge_progress")
          .select("challenge_id")
          .in("challenge_id", ids),
      ]);
      const pMap: Record<string, ProgressRow> = {};
      (pData ?? []).forEach((p) => { pMap[p.challenge_id] = p as ProgressRow; });
      setProgress(pMap);

      const counts: Record<string, number> = {};
      (allProg ?? []).forEach((r) => {
        counts[r.challenge_id] = (counts[r.challenge_id] ?? 0) + 1;
      });
      setParticipants(counts);
    } else {
      setProgress({});
      setParticipants({});
    }

    // Enrich scoreboard with profile info
    const rows = (sData ?? []) as { user_id: string; total_points: number; completed_count: number }[];
    if (rows.length > 0) {
      const userIds = rows.map((r) => r.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, name, avatar_url")
        .in("user_id", userIds);
      const pMap = new Map((profiles ?? []).map((p) => [p.user_id, p]));
      const enriched: ScoreRow[] = rows
        .map((r) => ({
          ...r,
          name: pMap.get(r.user_id)?.name || "Membro",
          avatarUrl: pMap.get(r.user_id)?.avatar_url ?? null,
        }))
        .sort((a, b) => b.total_points - a.total_points || b.completed_count - a.completed_count);
      setScoreboard(enriched);
    } else {
      setScoreboard([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leagueId, currentUserId]);

  const handleJoin = async (id: string) => {
    const { error } = await supabase.rpc("join_league_challenge", { _challenge_id: id });
    if (error) { toast.error(error.message); return; }
    toast.success("Você entrou no desafio!");
    load();
  };

  const handleComplete = async (id: string) => {
    const { error } = await supabase.rpc("complete_league_challenge", { _challenge_id: id });
    if (error) { toast.error(error.message); return; }
    toast.success("Desafio concluído! 🎉");
    load();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-display font-bold flex items-center gap-2">
          <Trophy size={16} className="text-primary" />
          Desafios da liga
        </h2>
        {isAdmin && (
          <button
            onClick={() => setDialogOpen(true)}
            disabled={!canCreate}
            title={disabledReason}
            className={cn(
              "flex items-center gap-1 text-xs font-semibold rounded-full px-3 py-1.5 transition-colors",
              canCreate ? "bg-primary text-primary-foreground hover:opacity-90" : "bg-secondary text-muted-foreground cursor-not-allowed"
            )}
          >
            <Plus size={12} /> Criar
          </button>
        )}
      </div>

      {isAdmin && disabledReason && (
        <p className="text-[10px] text-muted-foreground mb-2 -mt-1">{disabledReason}</p>
      )}

      {loading ? (
        <div className="bg-card rounded-2xl border border-border p-4 text-center text-xs text-muted-foreground">
          Carregando...
        </div>
      ) : challenges.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-4 text-center">
          <p className="text-xs text-muted-foreground">
            Nenhum desafio ainda{isAdmin ? ". Crie o primeiro!" : "."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {challenges.map((c) => {
            const diff = c.difficulty ?? "easy";
            const p = progress[c.id];
            const remaining = daysUntil(c.ends_at);
            const isActive = !c.ends_at || remaining > 0;
            const joined = !!p;
            const completed = p?.completed;
            return (
              <div key={c.id} className="bg-card rounded-xl border border-border p-3">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground break-words leading-snug">{c.title}</p>
                    {c.description && (
                      <p className="text-[11px] text-muted-foreground mt-0.5 break-words">{c.description}</p>
                    )}
                  </div>
                  <span className={cn("text-[10px] font-bold rounded-full px-2 py-0.5 shrink-0", DIFF_COLOR[diff])}>
                    {DIFF_LABEL[diff]} · {c.points_reward}pts
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground mb-2">
                  <span className="flex items-center gap-1"><Clock size={10} />{isActive ? `${remaining}d restantes` : "Encerrado"}</span>
                  <span className="flex items-center gap-1"><Users size={10} />{participants[c.id] ?? 0} participando</span>
                </div>
                <div className="flex items-center justify-end">
                  {completed ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-success bg-success/10 rounded-full px-2.5 py-1">
                      <Check size={12} /> Concluído
                    </span>
                  ) : !isActive ? (
                    <span className="text-[11px] text-muted-foreground">Prazo encerrado</span>
                  ) : joined ? (
                    <button
                      onClick={() => handleComplete(c.id)}
                      className="text-[11px] font-semibold text-primary-foreground bg-primary hover:opacity-90 rounded-full px-3 py-1"
                    >
                      Concluí ✓
                    </button>
                  ) : (
                    <button
                      onClick={() => handleJoin(c.id)}
                      className="text-[11px] font-semibold text-primary border border-primary/40 hover:bg-primary/10 rounded-full px-3 py-1"
                    >
                      Participar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Scoreboard */}
      <div className="mt-5">
        <h3 className="text-sm font-display font-bold flex items-center gap-2 mb-2">
          <Award size={14} className="text-primary" />
          Placar de desafios
        </h3>
        <p className="text-[10px] text-muted-foreground mb-2">Pontos ganhos apenas em desafios desta liga (não afeta seu XP geral)</p>
        {scoreboard.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border p-3 text-center">
            <p className="text-xs text-muted-foreground">Sem pontos ainda</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {scoreboard.map((s, i) => (
              <div
                key={s.user_id}
                className={cn(
                  "flex items-center gap-3 p-2.5 rounded-xl border",
                  s.user_id === currentUserId ? "border-primary bg-primary/5" : "border-border bg-card"
                )}
              >
                <span className="text-xs font-display font-bold w-5 text-center text-muted-foreground">{i + 1}</span>
                <UserAvatar name={s.name} avatarUrl={s.avatarUrl} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {s.name}
                    {s.user_id === currentUserId && <span className="text-primary text-[10px] ml-1">(você)</span>}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{s.completed_count} concluído(s)</p>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold text-foreground">{s.total_points}</span>
                  <span className="text-[10px] text-muted-foreground">pts</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateChallengeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        leagueId={leagueId}
        onCreated={load}
      />
    </motion.div>
  );
};

const CreateChallengeDialog = ({
  open,
  onOpenChange,
  leagueId,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  leagueId: string;
  onCreated: () => void;
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState<3 | 5 | 7>(5);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setTitle(""); setDescription(""); setDuration(5); setDifficulty("medium");
  };

  const submit = async () => {
    if (!title.trim()) { toast.error("Dê um nome ao desafio"); return; }
    setSubmitting(true);
    const { error } = await supabase.rpc("create_league_challenge", {
      _league_id: leagueId,
      _title: title.trim(),
      _description: description.trim(),
      _duration_days: duration,
      _difficulty: difficulty,
    });
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Desafio criado!");
    reset();
    onOpenChange(false);
    onCreated();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[380px]">
        <DialogHeader>
          <DialogTitle>Criar desafio da liga</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">Nome</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: 7 dias sem refrigerante" maxLength={60} />
          </div>
          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">Descrição (opcional)</label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detalhe rápido do desafio" maxLength={140} rows={2} />
          </div>
          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">Prazo</label>
            <div className="grid grid-cols-3 gap-2">
              {[3, 5, 7].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDuration(d as 3 | 5 | 7)}
                  className={cn(
                    "text-xs font-semibold rounded-lg py-2 border transition-colors",
                    duration === d ? "bg-primary text-primary-foreground border-primary" : "bg-secondary text-foreground border-border"
                  )}
                >
                  {d} dias
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">Dificuldade</label>
            <div className="grid grid-cols-3 gap-2">
              {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={cn(
                    "text-xs font-semibold rounded-lg py-2 border transition-colors flex flex-col items-center",
                    difficulty === d ? "bg-primary text-primary-foreground border-primary" : "bg-secondary text-foreground border-border"
                  )}
                >
                  <span>{DIFF_LABEL[d]}</span>
                  <span className="text-[10px] opacity-80">{DIFF_POINTS[d]} pts</span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1" disabled={submitting}>
              <X size={14} className="mr-1" /> Cancelar
            </Button>
            <Button onClick={submit} className="flex-1" disabled={submitting}>
              {submitting ? "Criando..." : "Criar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LeagueChallengesPanel;
