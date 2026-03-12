import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, LogIn, Users, Crown, Copy, Check, ArrowRight, X, Share2 } from "lucide-react";
import { GradientButton } from "@/components/ui/gradient-button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface League {
  id: string;
  name: string;
  invite_code: string;
  created_by: string;
  memberCount: number;
}

const Leagues = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [newName, setNewName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchLeagues = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: memberships } = await supabase
      .from("league_members")
      .select("league_id")
      .eq("user_id", user.id);

    if (!memberships?.length) {
      setLeagues([]);
      setLoading(false);
      return;
    }

    const leagueIds = memberships.map(m => m.league_id);
    const { data: leagueData } = await supabase
      .from("leagues")
      .select("*")
      .in("id", leagueIds);

    // Get member counts
    const leaguesWithCounts: League[] = [];
    for (const l of leagueData || []) {
      const { count } = await supabase
        .from("league_members")
        .select("*", { count: "exact", head: true })
        .eq("league_id", l.id);
      leaguesWithCounts.push({ ...l, memberCount: count ?? 0 });
    }

    setLeagues(leaguesWithCounts);
    setLoading(false);
  };

  useEffect(() => { fetchLeagues(); }, []);

  // Handle navigation state from onboarding
  useEffect(() => {
    const state = location.state as { action?: string } | null;
    if (state?.action === "create") {
      setShowCreate(true);
      setShowJoin(false);
    } else if (state?.action === "join") {
      setShowJoin(true);
      setShowCreate(false);
    }
    // Clear location state
    if (state?.action) {
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleCreate = async () => {
    if (!newName.trim() || submitting) return;
    setSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error("Faça login primeiro."); setSubmitting(false); return; }

    const { data: league, error } = await supabase
      .from("leagues")
      .insert({ name: newName.trim(), created_by: user.id })
      .select()
      .single();

    if (error || !league) {
      toast.error("Erro ao criar liga.");
      setSubmitting(false);
      return;
    }

    // Add creator as member
    await supabase.from("league_members").insert({ league_id: league.id, user_id: user.id });

    toast.success("Liga criada! 🏆");
    setNewName("");
    setShowCreate(false);
    setSubmitting(false);
    fetchLeagues();
  };

  const handleJoin = async () => {
    if (!joinCode.trim() || submitting) return;
    setSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error("Faça login primeiro."); setSubmitting(false); return; }

    const { data: league } = await supabase
      .from("leagues")
      .select("id")
      .eq("invite_code", joinCode.trim().toLowerCase())
      .maybeSingle();

    if (!league) {
      toast.error("Código inválido.");
      setSubmitting(false);
      return;
    }

    const { error } = await supabase
      .from("league_members")
      .insert({ league_id: league.id, user_id: user.id });

    if (error?.code === "23505") {
      toast.info("Você já está nessa liga!");
    } else if (error) {
      toast.error("Erro ao entrar na liga.");
    } else {
      toast.success("Você entrou na liga! 🎉");
    }

    setJoinCode("");
    setShowJoin(false);
    setSubmitting(false);
    fetchLeagues();
  };

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success("Código copiado!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background pb-24 px-4 pt-6 max-w-[430px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold mb-1">Ligas</h1>
        <p className="text-sm text-muted-foreground mb-6">Suas ligas privadas</p>
      </motion.div>

      {/* Action buttons */}
      <motion.div
        className="flex gap-3 mb-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <GradientButton
          onClick={() => { setShowCreate(true); setShowJoin(false); }}
          className="flex-1 h-12 rounded-xl text-sm gap-2"
        >
          <Plus size={16} /> Criar liga
        </GradientButton>
        <GradientButton
          variant="variant"
          onClick={() => { setShowJoin(true); setShowCreate(false); }}
          className="flex-1 h-12 rounded-xl text-sm gap-2"
        >
          <LogIn size={16} /> Entrar com código
        </GradientButton>
      </motion.div>

      {/* Create modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            className="bg-card rounded-2xl border border-border p-5 mb-6 card-elevated"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-display font-bold">Nova liga</h3>
              <button onClick={() => setShowCreate(false)} className="text-muted-foreground"><X size={16} /></button>
            </div>
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Nome da liga"
              className="w-full h-11 rounded-xl bg-secondary px-4 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary transition mb-3"
            />
            <GradientButton
              onClick={handleCreate}
              disabled={!newName.trim() || submitting}
              className="w-full h-11 rounded-xl text-sm disabled:opacity-40"
            >
              {submitting ? "Criando..." : "Criar liga"}
            </GradientButton>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Join modal */}
      <AnimatePresence>
        {showJoin && (
          <motion.div
            className="bg-card rounded-2xl border border-border p-5 mb-6 card-elevated"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-display font-bold">Entrar na liga</h3>
              <button onClick={() => setShowJoin(false)} className="text-muted-foreground"><X size={16} /></button>
            </div>
            <input
              value={joinCode}
              onChange={e => setJoinCode(e.target.value)}
              placeholder="Código de convite"
              className="w-full h-11 rounded-xl bg-secondary px-4 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary transition mb-3 font-mono tracking-widest"
            />
            <button
              onClick={handleJoin}
              disabled={!joinCode.trim() || submitting}
              className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-sm disabled:opacity-40 active:scale-95 transition-all"
            >
              {submitting ? "Entrando..." : "Entrar"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Leagues list */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <motion.div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
        </div>
      ) : leagues.length === 0 ? (
        <motion.div className="text-center py-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Users size={40} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Você ainda não está em nenhuma liga.</p>
          <p className="text-xs text-muted-foreground mt-1">Crie uma ou entre com um código!</p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {leagues.map((league, i) => (
            <motion.div
              key={league.id}
              className="bg-card rounded-2xl border border-border p-4 card-elevated"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.06 }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Crown size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-display font-bold">{league.name}</p>
                    <p className="text-[11px] text-muted-foreground">{league.memberCount} membro{league.memberCount !== 1 ? "s" : ""}</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/ligas/${league.id}`)}
                  className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowRight size={14} />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground font-medium">Código:</span>
                <code className="text-[11px] font-mono text-foreground bg-secondary px-2 py-0.5 rounded-md tracking-widest">{league.invite_code}</code>
                <button onClick={() => copyCode(league.invite_code, league.id)} className="text-muted-foreground hover:text-primary transition-colors">
                  {copiedId === league.id ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                </button>
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: `Liga ${league.name}`, text: `Entre na minha liga no NutriLeague! Código: ${league.invite_code}` });
                    } else {
                      copyCode(league.invite_code, league.id);
                    }
                  }}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Share2 size={12} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Leagues;
