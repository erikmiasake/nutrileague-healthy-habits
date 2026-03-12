import { Home, Trophy, User, Users, UtensilsCrossed } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const tabs = [
  { icon: Home, label: "Início", path: "/" },
  { icon: UtensilsCrossed, label: "Refeições", path: "/refeicoes" },
  { icon: Trophy, label: "Desafios", path: "/desafios" },
  { icon: Users, label: "Ligas", path: "/ligas" },
  { icon: User, label: "Perfil", path: "/perfil" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  if (location.pathname === "/login") return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-xl border-t border-border/60">
      <div className="flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom)] max-w-[430px] mx-auto">
        {tabs.map((tab, i) => {
          const active = location.pathname === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center gap-1 py-3 px-3 transition-colors ${
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon size={20} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[10px] font-semibold">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
