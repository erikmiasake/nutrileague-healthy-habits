import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import UserAvatar from "@/components/UserAvatar";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Camera, Edit2, LogOut, Trash2, ChevronRight, Copy, Share2,
  Users, Crown, Lock, Info, FileText, Shield, Bell, Target,
  Weight, Ruler, Mail, KeyRound, X, Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ProfileData {
  name: string;
  email: string;
  avatarUrl: string | null;
  weight: number | null;
  height: number | null;
  goal: string;
  notifyMeals: boolean;
  notifyStreak: boolean;
  notifyChallenges: boolean;
  privacyMeals: boolean;
  privacyProgress: boolean;
  privacyVisible: boolean;
}

interface LeagueInfo {
  id: string;
  name: string;
  invite_code: string;
  memberCount: number;
}

const GOALS = [
  { value: "lose", label: "Perder peso", emoji: "🔥" },
  { value: "maintain", label: "Manter peso", emoji: "⚖️" },
  { value: "gain", label: "Ganhar massa", emoji: "💪" },
  { value: "healthy", label: "Alimentação saudável", emoji: "🥗" },
];

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-1">{children}</h2>
);

const SettingsCard = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("bg-card rounded-2xl border border-border overflow-hidden", className)}>{children}</div>
);

const SettingsRow = ({
  icon: Icon, label, value, onClick, destructive, last, children,
}: {
  icon?: React.ElementType;
  label: string;
  value?: string;
  onClick?: () => void;
  destructive?: boolean;
  last?: boolean;
  children?: React.ReactNode;
}) => (
  <div
    className={cn(
      "flex items-center justify-between px-4 py-3.5 gap-3",
      !last && "border-b border-border",
      onClick && "cursor-pointer hover:bg-secondary/40 active:bg-secondary/60 transition-colors",
      destructive && "text-destructive"
    )}
    onClick={onClick}
    role={onClick ? "button" : undefined}
  >
    <div className="flex items-center gap-3 flex-1 min-w-0">
      {Icon && <Icon size={16} className={cn("shrink-0", destructive ? "text-destructive" : "text-primary")} />}
      <span className={cn("text-sm font-medium", destructive ? "text-destructive" : "text-foreground")}>{label}</span>
    </div>
    {children ? children : value ? (
      <span className="text-xs text-muted-foreground truncate max-w-[140px]">{value}</span>
    ) : onClick ? (
      <ChevronRight size={14} className="text-muted-foreground shrink-0" />
    ) : null}
  </div>
);

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [leagues, setLeagues] = useState<LeagueInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit states
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingWeight, setEditingWeight] = useState(false);
  const [newWeight, setNewWeight] = useState("");
  const [editingHeight, setEditingHeight] = useState(false);
  const [newHeight, setNewHeight] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLeaveLeague, setShowLeaveLeague] = useState<string | null>(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/login"); return; }

    const [profileRes, leagueMembersRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("league_members").select("league_id").eq("user_id", user.id),
    ]);

    const p = profileRes.data;
    setProfile({
      name: p?.name || user.user_metadata?.name || user.email?.split("@")[0] || "Usuário",
      email: user.email || "",
      avatarUrl: p?.avatar_url || null,
      weight: (p as any)?.weight ?? null,
      height: (p as any)?.height ?? null,
      goal: (p as any)?.goal ?? "healthy",
      notifyMeals: (p as any)?.notify_meals ?? true,
      notifyStreak: (p as any)?.notify_streak ?? true,
      notifyChallenges: (p as any)?.notify_challenges ?? true,
      privacyMeals: (p as any)?.privacy_meals ?? true,
      privacyProgress: (p as any)?.privacy_progress ?? true,
      privacyVisible: (p as any)?.privacy_visible ?? true,
    });
    setNewName(p?.name || "");

    // Fetch leagues with member counts
    if (leagueMembersRes.data && leagueMembersRes.data.length > 0) {
      const leagueIds = leagueMembersRes.data.map(lm => lm.league_id);
      const { data: leaguesData } = await supabase
        .from("leagues")
        .select("id, name, invite_code")
        .in("id", leagueIds);

      if (leaguesData) {
        const leaguesWithCounts = await Promise.all(
          leaguesData.map(async (league) => {
            const { count } = await supabase
              .from("league_members")
              .select("*", { count: "exact", head: true })
              .eq("league_id", league.id);
            return { ...league, memberCount: count ?? 0 };
          })
        );
        setLeagues(leaguesWithCounts);
      }
    }

    setLoading(false);
  };

  const updateProfile = async (updates: Record<string, any>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("profiles").update(updates).eq("user_id", user.id);
    if (error) {
      toast({ title: "Erro ao salvar", variant: "destructive" });
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
    const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, { upsert: true });
    if (uploadError) { toast({ title: "Erro ao enviar foto", variant: "destructive" }); setUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath);
    const avatarUrl = `${publicUrl}?t=${Date.now()}`;
    await updateProfile({ avatar_url: avatarUrl });
    setProfile(prev => prev ? { ...prev, avatarUrl } : prev);
    toast({ title: "Foto atualizada!" });
    setUploading(false);
  };

  const handleSaveName = async () => {
    if (!newName.trim()) return;
    await updateProfile({ name: newName.trim() });
    setProfile(prev => prev ? { ...prev, name: newName.trim() } : prev);
    setEditingName(false);
    toast({ title: "Nome atualizado!" });
  };

  const handleSaveWeight = async () => {
    const w = parseFloat(newWeight);
    if (isNaN(w) || w <= 0) return;
    await updateProfile({ weight: w });
    setProfile(prev => prev ? { ...prev, weight: w } : prev);
    setEditingWeight(false);
    toast({ title: "Peso atualizado!" });
  };

  const handleSaveHeight = async () => {
    const h = parseFloat(newHeight);
    if (isNaN(h) || h <= 0) return;
    await updateProfile({ height: h });
    setProfile(prev => prev ? { ...prev, height: h } : prev);
    setEditingHeight(false);
    toast({ title: "Altura atualizada!" });
  };

  const handleGoalChange = async (goal: string) => {
    await updateProfile({ goal });
    setProfile(prev => prev ? { ...prev, goal } : prev);
    toast({ title: "Objetivo atualizado!" });
  };

  const handleToggle = async (field: string, value: boolean) => {
    await updateProfile({ [field]: value });
    setProfile(prev => prev ? { ...prev, [field === "notify_meals" ? "notifyMeals" : field === "notify_streak" ? "notifyStreak" : field === "notify_challenges" ? "notifyChallenges" : field === "privacy_meals" ? "privacyMeals" : field === "privacy_progress" ? "privacyProgress" : "privacyVisible"]: value } : prev);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Código copiado!" });
  };

  const handleShareCode = (code: string, name: string) => {
    if (navigator.share) {
      navigator.share({ title: `Liga ${name}`, text: `Entre na liga "${name}" no NutriLeague! Código: ${code}` });
    } else {
      handleCopyCode(code);
    }
  };

  const handleLeaveLeague = async (leagueId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("league_members").delete().eq("league_id", leagueId).eq("user_id", user.id);
    setLeagues(prev => prev.filter(l => l.id !== leagueId));
    setShowLeaveLeague(null);
    toast({ title: "Você saiu da liga" });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const handleDeleteAccount = async () => {
    toast({ title: "Funcionalidade em breve", description: "A exclusão de conta será implementada em breve." });
    setShowDeleteConfirm(false);
  };

  const handleChangePassword = async () => {
    if (!profile?.email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(profile.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      toast({ title: "Erro ao enviar email", variant: "destructive" });
    } else {
      toast({ title: "Email enviado!", description: "Verifique sua caixa de entrada para redefinir a senha." });
    }
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-28 px-4 pt-6 max-w-[430px] mx-auto space-y-6">
      <motion.h1
        className="text-lg font-display font-bold text-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        Configurações
      </motion.h1>

      {/* ========== 1. CONTA ========== */}
      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}>
        <SectionTitle>Conta</SectionTitle>
        <SettingsCard>
          {/* Avatar + name + email header */}
          <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
            <div className="relative">
              <UserAvatar name={profile.name} avatarUrl={profile.avatarUrl} size="lg" />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-0.5 -right-0.5 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg border-2 border-background"
              >
                {uploading ? (
                  <motion.div className="w-3.5 h-3.5 border-2 border-primary-foreground border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
                ) : (
                  <Camera size={12} />
                )}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleAvatarUpload} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-display font-bold text-foreground truncate">{profile.name}</p>
              <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
            </div>
          </div>

          {/* Edit name */}
          {editingName ? (
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="flex-1 bg-secondary border border-border rounded-lg px-3 py-1.5 text-sm text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                autoFocus
                onKeyDown={e => e.key === "Enter" && handleSaveName()}
              />
              <button onClick={handleSaveName} className="p-1.5 text-primary hover:bg-primary/10 rounded-lg"><Check size={16} /></button>
              <button onClick={() => { setEditingName(false); setNewName(profile.name); }} className="p-1.5 text-muted-foreground hover:bg-secondary rounded-lg"><X size={16} /></button>
            </div>
          ) : (
            <SettingsRow icon={Edit2} label="Editar nome" value={profile.name} onClick={() => { setNewName(profile.name); setEditingName(true); }} />
          )}

          <SettingsRow icon={Mail} label="Alterar email" value={profile.email} onClick={() => toast({ title: "Em breve", description: "Alteração de email será implementada em breve." })} />
          <SettingsRow icon={KeyRound} label="Alterar senha" onClick={handleChangePassword} />
          <SettingsRow icon={LogOut} label="Sair da conta" onClick={handleLogout} destructive />
          <SettingsRow icon={Trash2} label="Excluir conta" onClick={() => setShowDeleteConfirm(true)} destructive last />
        </SettingsCard>
      </motion.section>

      {/* ========== 2. PERFIL NUTRICIONAL ========== */}
      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
        <SectionTitle>Perfil nutricional</SectionTitle>
        <SettingsCard>
          {/* Weight */}
          {editingWeight ? (
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
              <Weight size={16} className="text-primary shrink-0" />
              <input
                type="number"
                value={newWeight}
                onChange={e => setNewWeight(e.target.value)}
                placeholder="Ex: 75"
                className="flex-1 bg-secondary border border-border rounded-lg px-3 py-1.5 text-sm text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                autoFocus
                onKeyDown={e => e.key === "Enter" && handleSaveWeight()}
              />
              <span className="text-xs text-muted-foreground">kg</span>
              <button onClick={handleSaveWeight} className="p-1.5 text-primary hover:bg-primary/10 rounded-lg"><Check size={16} /></button>
              <button onClick={() => setEditingWeight(false)} className="p-1.5 text-muted-foreground hover:bg-secondary rounded-lg"><X size={16} /></button>
            </div>
          ) : (
            <SettingsRow icon={Weight} label="Peso" value={profile.weight ? `${profile.weight} kg` : "Não definido"} onClick={() => { setNewWeight(profile.weight?.toString() || ""); setEditingWeight(true); }} />
          )}

          {/* Height */}
          {editingHeight ? (
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
              <Ruler size={16} className="text-primary shrink-0" />
              <input
                type="number"
                value={newHeight}
                onChange={e => setNewHeight(e.target.value)}
                placeholder="Ex: 175"
                className="flex-1 bg-secondary border border-border rounded-lg px-3 py-1.5 text-sm text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                autoFocus
                onKeyDown={e => e.key === "Enter" && handleSaveHeight()}
              />
              <span className="text-xs text-muted-foreground">cm</span>
              <button onClick={handleSaveHeight} className="p-1.5 text-primary hover:bg-primary/10 rounded-lg"><Check size={16} /></button>
              <button onClick={() => setEditingHeight(false)} className="p-1.5 text-muted-foreground hover:bg-secondary rounded-lg"><X size={16} /></button>
            </div>
          ) : (
            <SettingsRow icon={Ruler} label="Altura" value={profile.height ? `${profile.height} cm` : "Não definido"} onClick={() => { setNewHeight(profile.height?.toString() || ""); setEditingHeight(true); }} last={false} />
          )}

          {/* Goal */}
          <div className="px-4 py-3">
            <div className="flex items-center gap-3 mb-3">
              <Target size={16} className="text-primary shrink-0" />
              <span className="text-sm font-medium text-foreground">Objetivo alimentar</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {GOALS.map(g => (
                <button
                  key={g.value}
                  onClick={() => handleGoalChange(g.value)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all border",
                    profile.goal === g.value
                      ? "bg-primary/15 border-primary/40 text-primary"
                      : "bg-secondary/50 border-border text-muted-foreground hover:border-primary/20"
                  )}
                >
                  <span>{g.emoji}</span>
                  <span>{g.label}</span>
                </button>
              ))}
            </div>
          </div>
        </SettingsCard>
      </motion.section>

      {/* ========== 3. PREFERÊNCIAS DO APP ========== */}
      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
        <SectionTitle>Preferências do app</SectionTitle>
        <SettingsCard>
          <SettingsRow icon={Bell} label="Lembrete de refeições">
            <Switch checked={profile.notifyMeals} onCheckedChange={v => handleToggle("notify_meals", v)} />
          </SettingsRow>
          <SettingsRow icon={Bell} label="Lembrete de streak">
            <Switch checked={profile.notifyStreak} onCheckedChange={v => handleToggle("notify_streak", v)} />
          </SettingsRow>
          <SettingsRow icon={Bell} label="Lembrete de desafios" last>
            <Switch checked={profile.notifyChallenges} onCheckedChange={v => handleToggle("notify_challenges", v)} />
          </SettingsRow>
        </SettingsCard>
      </motion.section>

      {/* ========== 4. LIGAS ========== */}
      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
        <SectionTitle>Ligas</SectionTitle>
        {leagues.length === 0 ? (
          <SettingsCard>
            <div className="px-4 py-6 text-center">
              <Users size={24} className="mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-3">Você não participa de nenhuma liga</p>
              <Button size="sm" onClick={() => navigate("/ligas")} className="rounded-xl">
                Criar ou entrar em uma liga
              </Button>
            </div>
          </SettingsCard>
        ) : (
          <div className="space-y-2.5">
            {leagues.map(league => (
              <SettingsCard key={league.id}>
                <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
                  <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
                    <Crown size={16} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-display font-bold text-foreground truncate">{league.name}</p>
                    <p className="text-[11px] text-muted-foreground">{league.memberCount} {league.memberCount === 1 ? "membro" : "membros"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
                  <span className="text-xs text-muted-foreground">Código:</span>
                  <code className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">{league.invite_code}</code>
                  <div className="flex-1" />
                  <button onClick={() => handleCopyCode(league.invite_code)} className="p-1.5 text-muted-foreground hover:text-primary transition-colors"><Copy size={14} /></button>
                  <button onClick={() => handleShareCode(league.invite_code, league.name)} className="p-1.5 text-muted-foreground hover:text-primary transition-colors"><Share2 size={14} /></button>
                </div>
                <SettingsRow label="Ver liga" onClick={() => navigate(`/ligas/${league.id}`)} />
                <SettingsRow label="Sair da liga" onClick={() => setShowLeaveLeague(league.id)} destructive last />
              </SettingsCard>
            ))}
            <Button variant="outline" size="sm" className="w-full rounded-xl mt-1" onClick={() => navigate("/ligas")}>
              Criar nova liga
            </Button>
          </div>
        )}
      </motion.section>

      {/* ========== 5. PRIVACIDADE ========== */}
      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <SectionTitle>Privacidade</SectionTitle>
        <SettingsCard>
          <SettingsRow icon={Shield} label="Membros veem refeições">
            <Switch checked={profile.privacyMeals} onCheckedChange={v => handleToggle("privacy_meals", v)} />
          </SettingsRow>
          <SettingsRow icon={Shield} label="Membros veem progresso">
            <Switch checked={profile.privacyProgress} onCheckedChange={v => handleToggle("privacy_progress", v)} />
          </SettingsRow>
          <SettingsRow icon={Lock} label="Perfil visível na liga" last>
            <Switch checked={profile.privacyVisible} onCheckedChange={v => handleToggle("privacy_visible", v)} />
          </SettingsRow>
        </SettingsCard>
      </motion.section>

      {/* ========== 6. SOBRE ========== */}
      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}>
        <SectionTitle>Sobre</SectionTitle>
        <SettingsCard>
          <SettingsRow icon={Info} label="Sobre o NutriLeague" onClick={() => navigate("/sobre")} />
          <SettingsRow icon={FileText} label="Termos de uso" onClick={() => toast({ title: "Em breve" })} />
          <SettingsRow icon={Shield} label="Política de privacidade" onClick={() => toast({ title: "Em breve" })} />
          <div className="px-4 py-3 text-center">
            <p className="text-[11px] text-muted-foreground">NutriLeague v1.0.0</p>
          </div>
        </SettingsCard>
      </motion.section>

      {/* Delete account dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="max-w-[360px] rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir conta</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza? Todos os seus dados serão apagados permanentemente. Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Leave league dialog */}
      <AlertDialog open={!!showLeaveLeague} onOpenChange={() => setShowLeaveLeague(null)}>
        <AlertDialogContent className="max-w-[360px] rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Sair da liga</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja sair desta liga? Você poderá entrar novamente com o código de convite.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => showLeaveLeague && handleLeaveLeague(showLeaveLeague)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Sair
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Profile;
