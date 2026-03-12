import { Flame, Zap, Trophy, LogOut, ChevronRight, Target, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { currentUser } from "@/lib/mockData";

const Profile = () => {
  const navigate = useNavigate();

  const stats = [
    { icon: Flame, label: "Streak atual", value: `${currentUser.streak} dias`, color: "text-primary" },
    { icon: Zap, label: "XP total", value: `${currentUser.xp}`, color: "text-xp" },
    { icon: Target, label: "Nível", value: `${currentUser.level}`, color: "text-level" },
    { icon: Trophy, label: "Desafios concluídos", value: `${currentUser.challengesCompleted}`, color: "text-success" },
  ];

  const menuItems = [
    { label: "Configurações", icon: ChevronRight },
    { label: "Notificações", icon: ChevronRight },
    { label: "Sobre o NutriLeague", icon: ChevronRight },
  ];

  return (
    <div className="min-h-screen bg-background pb-24 px-4 pt-6 max-w-[430px] mx-auto">
      {/* Profile Header */}
      <div className="flex flex-col items-center mb-8 animate-slide-up">
        <div className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center mb-3">
          <span className="text-2xl font-display font-bold text-primary">{currentUser.avatar}</span>
        </div>
        <h1 className="text-xl font-display font-bold">{currentUser.name}</h1>
        <div className="flex items-center gap-2 mt-1">
          <Award size={14} className="text-level" />
          <span className="text-sm text-muted-foreground">Nível {currentUser.level}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card rounded-xl p-4 border border-border">
            <stat.icon size={18} className={stat.color} />
            <p className="text-lg font-display font-bold mt-2">{stat.value}</p>
            <p className="text-[10px] text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Menu */}
      <div className="bg-card rounded-xl border border-border overflow-hidden mb-6 animate-slide-up" style={{ animationDelay: "0.15s" }}>
        {menuItems.map((item, i) => (
          <button
            key={item.label}
            className={`w-full flex items-center justify-between px-4 py-3.5 text-sm ${
              i < menuItems.length - 1 ? "border-b border-border" : ""
            }`}
          >
            <span>{item.label}</span>
            <item.icon size={16} className="text-muted-foreground" />
          </button>
        ))}
      </div>

      {/* Logout */}
      <button
        onClick={() => navigate("/login")}
        className="w-full flex items-center justify-center gap-2 py-3 text-sm text-destructive font-medium animate-slide-up"
        style={{ animationDelay: "0.2s" }}
      >
        <LogOut size={16} />
        Sair da conta
      </button>
    </div>
  );
};

export default Profile;
