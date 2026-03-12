import { Flame, Trophy, LogOut, ChevronRight, Edit2, Calendar, Utensils } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface ProfileData {
  name: string;
  email: string;
  currentStreak: number;
  longestStreak: number;
  totalMeals: number;
  memberSince: string;
  leagueName: string | null;
}

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      const [profileRes, streakRes, mealsRes, leagueRes] = await Promise.all([
        supabase.from("profiles").select("name").eq("user_id", user.id).maybeSingle(),
        supabase.from("streaks").select("current_streak, longest_streak").eq("user_id", user.id).maybeSingle(),
        supabase.from("meal_logs").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("league_members").select("league_id").eq("user_id", user.id).limit(1).maybeSingle(),
      ]);

      let leagueName: string | null = null;
      if (leagueRes.data) {
        const { data: league } = await supabase
          .from("leagues")
          .select("name")
          .eq("id", leagueRes.data.league_id)
          .maybeSingle();
        leagueName = league?.name || null;
      }

      const name = profileRes.data?.name || user.user_metadata?.name || user.email?.split("@")[0] || "Usuário";

      setProfile({
        name,
        email: user.email || "",
        currentStreak: streakRes.data?.current_streak ?? 0,
        longestStreak: streakRes.data?.longest_streak ?? 0,
        totalMeals: mealsRes.count ?? 0,
        memberSince: new Date(user.created_at).toLocaleDateString("pt-BR", { month: "long", year: "numeric" }),
        leagueName,
      });
      setNewName(name);
      setLoading(false);
    };

    fetchProfile();
  }, [navigate]);

  const handleSaveName = async () => {
    if (!newName.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({ name: newName.trim() })
      .eq("user_id", user.id);

    if (error) {
      toast({ title: "Erro ao atualizar nome", variant: "destructive" });
    } else {
      setProfile(prev => prev ? { ...prev, name: newName.trim() } : prev);
      setEditing(false);
      toast({ title: "Nome atualizado!" });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  if (loading || !profile) {
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

  const initials = profile.name
    .split(" ")
    .map(w => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const stats = [
    { icon: Flame, label: "Streak atual", value: `${profile.currentStreak} ${profile.currentStreak === 1 ? "dia" : "dias"}`, color: "text-primary" },
    { icon: Trophy, label: "Maior streak", value: `${profile.longestStreak} ${profile.longestStreak === 1 ? "dia" : "dias"}`, color: "text-xp" },
    { icon: Utensils, label: "Refeições registradas", value: `${profile.totalMeals}`, color: "text-success" },
    { icon: Calendar, label: "Membro desde", value: profile.memberSince, color: "text-muted-foreground" },
  ];

  return (
    <div className="min-h-screen bg-background pb-24 px-4 pt-6 max-w-[430px] mx-auto">
      {/* Profile Header */}
      <motion.div
        className="flex flex-col items-center mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="w-20 h-20 rounded-full bg-primary/15 border-2 border-primary/40 flex items-center justify-center mb-3">
          <span className="text-2xl font-display font-bold text-primary">{initials}</span>
        </div>

        {editing ? (
          <div className="flex items-center gap-2 mt-1">
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              className="bg-secondary border border-border rounded-lg px-3 py-1.5 text-sm text-foreground font-medium text-center w-44 focus:outline-none focus:ring-1 focus:ring-primary"
              autoFocus
              onKeyDown={e => e.key === "Enter" && handleSaveName()}
            />
            <button
              onClick={handleSaveName}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Salvar
            </button>
            <button
              onClick={() => { setEditing(false); setNewName(profile.name); }}
              className="text-xs text-muted-foreground hover:underline"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-display font-bold text-foreground">{profile.name}</h1>
            <button onClick={() => setEditing(true)} className="text-muted-foreground hover:text-primary transition-colors">
              <Edit2 size={14} />
            </button>
          </div>
        )}

        <p className="text-xs text-muted-foreground mt-0.5">{profile.email}</p>
        {profile.leagueName && (
          <span className="mt-2 text-[11px] font-medium text-primary/80 bg-primary/10 px-3 py-1 rounded-full">
            Liga: {profile.leagueName}
          </span>
        )}
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        className="grid grid-cols-2 gap-2.5 mb-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08 }}
      >
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card rounded-xl p-3.5 border border-border">
            <stat.icon size={16} className={stat.color} />
            <p className="text-base font-display font-bold mt-1.5 text-foreground">{stat.value}</p>
            <p className="text-[10px] text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Menu */}
      <motion.div
        className="bg-card rounded-xl border border-border overflow-hidden mb-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.12 }}
      >
        {[
          { label: "Minhas ligas", action: () => navigate("/ligas") },
          { label: "Sobre o NutriLeague", action: () => {} },
        ].map((item, i, arr) => (
          <button
            key={item.label}
            onClick={item.action}
            className={cn(
              "w-full flex items-center justify-between px-4 py-3.5 text-sm text-foreground hover:bg-secondary/40 transition-colors",
              i < arr.length - 1 && "border-b border-border"
            )}
          >
            <span>{item.label}</span>
            <ChevronRight size={14} className="text-muted-foreground" />
          </button>
        ))}
      </motion.div>

      {/* Logout */}
      <motion.button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 py-3 text-sm text-destructive font-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.18 }}
      >
        <LogOut size={16} />
        Sair da conta
      </motion.button>
    </div>
  );
};

export default Profile;
