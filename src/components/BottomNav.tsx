import { Home, Trophy, BarChart3, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const tabs = [
  { icon: Home, label: "Início", path: "/" },
  { icon: Trophy, label: "Desafios", path: "/desafios" },
  { icon: BarChart3, label: "Ranking", path: "/ranking" },
  { icon: User, label: "Perfil", path: "/perfil" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  if (location.pathname === "/login") return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border">
      <div className="flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom)] max-w-[430px] mx-auto">
        {tabs.map((tab, i) => {
          const active = location.pathname === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center gap-1 py-3 px-4 transition-colors ${
                i === 1 ? "mr-6" : i === 2 ? "ml-6" : ""
              } ${active ? "text-primary" : "text-muted-foreground"}`}
            >
              <tab.icon size={22} strokeWidth={active ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
