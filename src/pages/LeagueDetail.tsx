import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Crown, Flame, Users, Copy, Check, Share2, Zap, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import UserAvatar from "@/components/UserAvatar";

interface MemberRanking {
  user_id: string;
  name: string;
  avatarUrl: string | null;
  avgScore: number;
  current_streak: number;
  isCurrentUser: boolean;
}

/* ── League Challenges Section ── */
const LeagueChallengesSection = ({ leagueId }: { leagueId: string }) => {
  const [challenges, setChallenges] = useState<{ id: string; title: string; description: string; duration_days: number; xp_reward: number }[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("challenges")
        .select("id, title, description, duration_days, xp_reward")
        .eq("league_id", leagueId).eq("type", "league").eq("active", true)
        .order("created_at", { ascending: false });
      setChallenges(data ?? []);
    };
    fetch();
  }, [leagueId]);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-6">
      <h2 className="text-base font-display font-bold flex items-center gap-2 mb-3">
        <Trophy size={16} className="text-primary" />
        Desafios da liga
      </h2>
      {challenges.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-4 text-center">
          <p className="text-xs text-muted-foreground">Nenhum desafio ainda</p>
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

      const { data: leagueData } = await supabase.from("leagues").select("name, invite_code").eq("id", id).single();
      setLeague(leagueData);

      const { data: memberData } = await supabase.from("league_members").select("user_id").eq("league_id", id);
      if (!memberData?.length) { setLoading(false); return; }

      const userIds = memberData.map(m => m.user_id);

      // Fetch profiles, streaks, and meal scores in parallel
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 6);
      const weekAgoStr = weekAgo.toISOString().split("T")[0];

      const [{ data: profiles }, { data: streaks }, { data: mealScores }] = await Promise.all([
        supabase.from("profiles").select("user_id, name, avatar_url").in("user_id", userIds),
        supabase.from("streaks").select("user_id, current_streak").in("user_id", userIds),
        supabase.from("meal_logs").select("user_id, meal_score").in("user_id", userIds).gte("date", weekAgoStr).not("meal_score", "is", null),
      ]);

      const profileMap = new Map((profiles || []).map(p => [p.user_id, p]));
      const streakMap = new Map((streaks || []).map(s => [s.user_id, s]));

      // Calculate avg score per user
      const scoreMap = new Map<string, number>();
      if (mealScores && mealScores.length > 0) {
        const userScores = new Map<string, number[]>();
        for (const m of mealScores) {
          if (!userScores.has(m.user_id)) userScores.set(m.user_id, []);
          userScores.get(m.user_id)!.push(m.meal_score!);
        }
        for (const [uid, scores] of userScores) {
          scoreMap.set(uid, Math.round(scores.reduce((a, b) => a + b, 0) / scores.length));
        }
      }

      const ranked: MemberRanking[] = userIds.map(uid => {
        const profile = profileMap.get(uid);
        return {
          user_id: uid,
          name: profile?.name || "Usuário",
          avatarUrl: profile?.avatar_url || null,
          avgScore: scoreMap.get(uid) ?? 0,
          current_streak: streakMap.get(uid)?.current_streak ?? 0,
          isCurrentUser: uid === user.id,
        };
      });

      ranked.sort((a, b) => b.avgScore - a.avgScore);
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
      <motion.div className="bg-card rounded-2xl border border-border p-5 mb-6 card-elevated" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
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
              } else { copyCode(); }
            }}
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <Share2 size={14} />
          </button>
        </div>
      </motion.div>

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
                    <UserAvatar
                      name={m.name}
                      avatarUrl={m.avatarUrl}
                      size={isFirst ? "lg" : "md"}
                      className={isFirst ? "border-primary bg-primary/20" : ""}
                    />
                  </div>
                  <p className="text-xs font-medium mt-2 truncate max-w-[70px]">{m.name.split(" ")[0]}</p>
                  <div className="flex items-center gap-0.5 mt-0.5">
                    <span className="text-[10px] font-bold text-foreground">{m.avgScore}</span>
                    <span className="text-[9px] text-muted-foreground">pts</span>
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
              <UserAvatar name={m.name} avatarUrl={m.avatarUrl} size="md" />
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

export default LeagueDetail;
