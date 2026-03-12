import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Crown, Flame, Users, Copy, Check, Share2, Plus, X, Zap, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface MemberRanking {
  user_id: string;
  name: string;
  avatar: string;
  current_streak: number;
  isCurrentUser: boolean;
}

const LeagueDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [league, setLeague] = useState<{ name: string; invite_code: string } | null>(null);
  const [members, setMembers] = useState<MemberRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch league info
      const { data: leagueData } = await supabase
        .from("leagues")
        .select("name, invite_code")
        .eq("id", id)
        .single();

      setLeague(leagueData);

      // Fetch members
      const { data: memberData } = await supabase
        .from("league_members")
        .select("user_id")
        .eq("league_id", id);

      if (!memberData?.length) { setLoading(false); return; }

      const userIds = memberData.map(m => m.user_id);

      // Fetch profiles and streaks for members
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, name")
        .in("user_id", userIds);

      const { data: streaks } = await supabase
        .from("streaks")
        .select("user_id, current_streak")
        .in("user_id", userIds);

      const profileMap = new Map((profiles || []).map(p => [p.user_id, p]));
      const streakMap = new Map((streaks || []).map(s => [s.user_id, s]));

      const ranked: MemberRanking[] = userIds.map(uid => {
        const profile = profileMap.get(uid);
        const streak = streakMap.get(uid);
        const name = profile?.name || "Usuário";
        return {
          user_id: uid,
          name,
          avatar: name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase(),
          current_streak: streak?.current_streak ?? 0,
          isCurrentUser: uid === user.id,
        };
      });

      ranked.sort((a, b) => b.current_streak - a.current_streak);
      setMembers(ranked);
      setLoading(false);
    };

    fetchData();
  }, [id]);

  const copyCode = () => {
    if (!league) return;
    navigator.clipboard.writeText(league.invite_code);
    setCopied(true);
    toast.success("Código copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  const medalColors = ["text-xp", "text-muted-foreground", "text-primary"];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 px-4 pt-6 max-w-[430px] mx-auto">
      <button onClick={() => navigate("/ligas")} className="flex items-center gap-2 text-muted-foreground mb-6">
        <ArrowLeft size={20} />
        <span className="text-sm">Voltar</span>
      </button>

      {/* League header */}
      <motion.div
        className="bg-card rounded-2xl border border-border p-5 mb-6 card-elevated"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Crown size={22} className="text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold">{league?.name}</h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Users size={12} /> {members.length} membro{members.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-secondary rounded-xl px-3 py-2">
          <span className="text-[10px] text-muted-foreground font-medium">Convite:</span>
          <code className="text-xs font-mono text-foreground tracking-widest flex-1">{league?.invite_code}</code>
          <button onClick={copyCode} className="text-muted-foreground hover:text-primary transition-colors">
            {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
          </button>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: `Liga ${league?.name}`, text: `Entre na minha liga no NutriLeague! Código: ${league?.invite_code}` });
              } else {
                copyCode();
              }
            }}
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <Share2 size={14} />
          </button>
        </div>
      </motion.div>

      {/* League Challenges */}
      <LeagueChallengesSection leagueId={id!} />

      {/* Ranking */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h2 className="text-base font-display font-bold mb-4 flex items-center gap-2">
          <Flame size={16} className="text-primary" />
          Ranking da liga
        </h2>

        {/* Top 3 Podium */}
        {members.length >= 3 && (
          <div className="flex items-end justify-center gap-4 mb-6">
            {[1, 0, 2].map(idx => {
              const m = members[idx];
              if (!m) return null;
              const isFirst = idx === 0;
              return (
                <div key={m.user_id} className="flex flex-col items-center">
                  <div className={`relative ${isFirst ? "mb-2" : ""}`}>
                    {isFirst && <Crown size={18} className="text-xp absolute -top-5 left-1/2 -translate-x-1/2" />}
                    <div className={`rounded-full flex items-center justify-center font-display font-bold text-sm border-2 ${
                      isFirst ? "w-16 h-16 border-primary bg-primary/20 text-primary" : "w-12 h-12 border-border bg-secondary text-foreground"
                    }`}>
                      {m.avatar}
                    </div>
                  </div>
                  <p className="text-xs font-medium mt-2 truncate max-w-[70px]">{m.name.split(" ")[0]}</p>
                  <div className="flex items-center gap-0.5 mt-0.5">
                    <Flame size={10} className="text-primary" />
                    <span className="text-[10px] text-muted-foreground">{m.current_streak}d</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Full list */}
        <div className="space-y-2">
          {members.map((m, i) => (
            <motion.div
              key={m.user_id}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                m.isCurrentUser ? "border-primary bg-primary/5" : "border-border bg-card"
              }`}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.05 }}
            >
              <span className={`text-sm font-display font-bold w-6 text-center ${i < 3 ? medalColors[i] : "text-muted-foreground"}`}>
                {i + 1}
              </span>
              <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-xs font-semibold shrink-0">
                {m.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {m.name}
                  {m.isCurrentUser && <span className="text-primary text-[10px] ml-1">(você)</span>}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Flame size={12} className="text-primary" />
                <span className="text-xs font-semibold">{m.current_streak}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

/* ── League Challenges Section ── */
const LeagueChallengesSection = ({ leagueId }: { leagueId: string }) => {
  const [challenges, setChallenges] = useState<{ id: string; title: string; description: string; duration_days: number; xp_reward: number }[]>([]);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [days, setDays] = useState("7");
  const [xp, setXp] = useState("100");
  const [submitting, setSubmitting] = useState(false);

  const fetchChallenges = async () => {
    const { data } = await supabase
      .from("challenges")
      .select("id, title, description, duration_days, xp_reward")
      .eq("league_id", leagueId)
      .eq("type", "league")
      .eq("active", true)
      .order("created_at", { ascending: false });
    setChallenges(data ?? []);
  };

  useEffect(() => { fetchChallenges(); }, [leagueId]);

  const handleCreate = async () => {
    if (!title.trim()) { toast.error("Dê um título ao desafio"); return; }
    setSubmitting(true);
    const { error } = await supabase.from("challenges").insert({
      title: title.trim(),
      description: description.trim() || `Desafio da liga: ${title.trim()}`,
      type: "league" as const,
      duration_days: Math.max(1, parseInt(days) || 7),
      xp_reward: Math.max(0, parseInt(xp) || 100),
      league_id: leagueId,
    });
    setSubmitting(false);
    if (error) { toast.error("Erro ao criar desafio"); return; }
    toast.success("Desafio criado! 🔥");
    setTitle(""); setDescription(""); setDays("7"); setXp("100");
    setOpen(false);
    fetchChallenges();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-display font-bold flex items-center gap-2">
          <Trophy size={16} className="text-primary" />
          Desafios da liga
        </h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground active:scale-90 transition-transform">
              <Plus size={16} />
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-[360px] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="font-display">Novo desafio</DialogTitle>
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
      </div>

      {challenges.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-4 text-center">
          <p className="text-xs text-muted-foreground">Nenhum desafio ainda. Crie o primeiro!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {challenges.map((c) => (
            <div key={c.id} className="bg-card rounded-xl border border-border p-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{c.title}</p>
                <p className="text-[10px] text-muted-foreground">{c.duration_days} dias</p>
              </div>
              <div className="flex items-center gap-1 bg-primary/10 text-primary rounded-full px-2 py-0.5 shrink-0">
                <Zap size={10} />
                <span className="text-[10px] font-bold">{c.xp_reward} XP</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default LeagueDetail;
