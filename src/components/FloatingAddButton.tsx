import { Plus } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const FloatingAddButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname === "/login" || location.pathname === "/" || location.pathname === "/onboarding") return null;

  return;








};

export default FloatingAddButton;