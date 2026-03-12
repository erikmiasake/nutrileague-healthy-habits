import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, LogIn, Users } from "lucide-react";
import { GradientButton } from "@/components/ui/gradient-button";

const NoLeagueOnboarding = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 max-w-[430px] mx-auto">
      <motion.div
        className="flex flex-col items-center text-center w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
      >
        {/* Icon */}
        <motion.div
          className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-8"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Users size={36} className="text-primary" />
        </motion.div>

        {/* Text */}
        <h1 className="text-2xl font-display font-bold mb-2">
          Entre em uma liga
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-[280px] mb-10">
          Crie ou entre em uma liga para competir com seus amigos e manter hábitos saudáveis.
        </p>

        {/* Buttons */}
        <div className="w-full space-y-3">
          <GradientButton
            onClick={() => navigate("/ligas", { state: { action: "create" } })}
            className="w-full h-13 rounded-xl font-semibold text-[15px] gap-2.5"
          >
            <Plus size={18} />
            Criar uma liga
          </GradientButton>

          <GradientButton
            variant="variant"
            onClick={() => navigate("/ligas", { state: { action: "join" } })}
            className="w-full h-13 rounded-xl font-semibold text-[15px] gap-2.5"
          >
            <LogIn size={18} />
            Entrar em uma liga
          </GradientButton>
        </div>
      </motion.div>
    </div>
  );
};

export default NoLeagueOnboarding;
