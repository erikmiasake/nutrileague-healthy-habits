import { Flame, Trophy, LogOut, ChevronRight, Edit2, Calendar, Utensils, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import UserAvatar from "@/components/UserAvatar";

interface ProfileData {
  name: string;
  email: string;
  avatarUrl: string | null;
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
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/login"); return; }

      const [profileRes, streakRes, mealsRes, leagueRes] = await Promise.all([
        supabase.from("profiles").select("name, avatar_url").eq("user_id", user.id).maybeSingle(),
        supabase.from("streaks").select("current_streak, longest_streak").eq("user_id", user.id).maybeSingle(),
        supabase.from("meal_logs").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("league_members").select("league_id").eq("user_id", user.id).limit(1).maybeSingle(),
      ]);

      let leagueName: string | null = null;
      if (leagueRes.data) {
        const { data: league } = await supabase.from("leagues").select("name").eq("id", leagueRes.data.league_id).maybeSingle();
        leagueName = league?.name || null;
      }

      const name = profileRes.data?.name || user.user_metadata?.name || user.email?.split("@")[0] || "Usuário";

      setProfile({
        name,
        email: user.email || "",
        avatarUrl: profileRes.data?.avatar_url || null,
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
    const { error } = await supabase.from("profiles").update({ name: newName.trim() }).eq("user_id", user.id);
    if (error) {
      toast({ title: "Erro ao atualizar nome", variant: "destructive" });
    } else {
      setProfile(prev => prev ? { ...prev, name: newName.trim() } : prev);
      setEditing(false);
      toast({ title: "Nome atualizado!" });
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setUploading(true);
    const ext = file.name.split(".").pop();
    const filePath = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast({ title: "Erro ao enviar foto", variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath);
    const avatarUrl = `${publicUrl}?t=${Date.now()}`;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: avatarUrl })
      .eq("user_id", user.id);

    if (updateError) {
      toast({ title: "Erro ao salvar foto", variant: "destructive" });
    } else {
      setProfile(prev => prev ? { ...prev, avatarUrl } : prev);
      toast({ title: "Foto de perfil atualizada!" });
    }
    setUploading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
      </div>
    );
  }

  const stats = [
    { icon: Flame, label: "Streak atual", value: `${profile.currentStreak} ${profile.currentStreak === 1 ? "dia" : "dias"}`, color: "text-primary" },
    { icon: Trophy, label: "Maior streak", value: `${profile.longestStreak} ${profile.longestStreak === 1 ? "dia" : "dias"}`, color: "text-xp" },
    { icon: Utensils, label: "Refeições registradas", value: `${profile.totalMeals}`, color: "text-success" },
    { icon: Calendar, label: "Membro desde", value: profile.memberSince, color: "text-muted-foreground" },
  ];

  return (
    <div className="min-h-screen bg-background pb-24 px-4 pt-6 max-w-[430px] mx-auto">
      {/* Profile Header */}
      <motion.div className="flex flex-col items-center mb-6" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="relative mb-3">
          <UserAvatar name={profile.name} avatarUrl={profile.avatarUrl} size="xl" />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg border-2 border-background"
          >
            {uploading ? (
              <motion.div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
            ) : (
              <Camera size={14} />
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleAvatarUpload}
          />
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
            <button onClick={handleSaveName} className="text-xs font-semibold text-primary hover:underline">Salvar</button>
            <button onClick={() => { setEditing(false); setNewName(profile.name); }} className="text-xs text-muted-foreground hover:underline">Cancelar</button>
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
      <motion.div className="grid grid-cols-2 gap-2.5 mb-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.08 }}>
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card rounded-xl p-3.5 border border-border">
            <stat.icon size={16} className={stat.color} />
            <p className="text-base font-display font-bold mt-1.5 text-foreground">{stat.value}</p>
            <p className="text-[10px] text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Menu */}
      <motion.div className="bg-card rounded-xl border border-border overflow-hidden mb-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.12 }}>
        {[
          { label: "Minhas ligas", action: () => navigate("/ligas") },
          { label: "Sobre o NutriLeague", action: () => navigate("/sobre") },
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
      <motion.button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-3 text-sm text-destructive font-medium" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.18 }}>
        <LogOut size={16} />
        Sair da conta
      </motion.button>
    </div>
  );
};

export default Profile;
