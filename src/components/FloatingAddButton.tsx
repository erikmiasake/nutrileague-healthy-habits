import { Plus } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const FloatingAddButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname === "/login") return null;

  return (
    <button
      onClick={() => navigate("/registrar")}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] w-14 h-14 rounded-2xl bg-primary text-primary-foreground shadow-lg streak-glow flex items-center justify-center transition-transform active:scale-90 hover:scale-105"
      aria-label="Registrar refeição"
    >
      <Plus size={26} strokeWidth={2.5} />
    </button>
  );
};

export default FloatingAddButton;
