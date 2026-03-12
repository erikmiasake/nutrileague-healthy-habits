import { Plus } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const HIDDEN_PATHS = ["/login", "/onboarding", "/", "/desafios"];

const FloatingAddButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  if (HIDDEN_PATHS.includes(location.pathname)) return null;

  return (
    <button
      onClick={() => navigate("/registrar")}
      className="fixed bottom-24 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg active:scale-95 transition-transform"
      aria-label="Registrar refeição"
    >
      <Plus size={28} strokeWidth={2.5} />
    </button>
  );
};

export default FloatingAddButton;