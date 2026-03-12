import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User, Plus, Users, Trophy, Settings, ChevronRight } from "lucide-react";

const menuItems = [
  { label: "Perfil", icon: User, path: "/perfil" },
  { label: "Criar Liga", icon: Plus, path: "/ligas", state: { action: "create" } },
  { label: "Minhas Ligas", icon: Users, path: "/ligas" },
  { label: "Desafios", icon: Trophy, path: "/desafios" },
  { label: "Configurações", icon: Settings, path: "/perfil" },
];

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const panelVariants = {
  hidden: { x: "-100%" },
  visible: { x: 0, transition: { type: "spring" as const, stiffness: 300, damping: 30 } },
  exit: { x: "-100%", transition: { duration: 0.2 } },
};

export default function AppSidebar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const go = (path: string, state?: Record<string, string>) => {
    setOpen(false);
    setTimeout(() => navigate(path, { state }), 150);
  };

  return (
    <>
      {/* Trigger */}
      <button
        onClick={() => setOpen(true)}
        className="p-2 -ml-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Abrir menu"
      >
        <Menu size={22} />
      </button>

      {/* Drawer */}
      <AnimatePresence>
        {open && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 z-[60] bg-background/60 backdrop-blur-sm"
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              onClick={() => setOpen(false)}
            />

            {/* Panel */}
            <motion.aside
              className="fixed top-0 left-0 bottom-0 z-[70] w-72 bg-card border-r border-border flex flex-col"
              variants={panelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border">
                <h2 className="text-base font-display font-bold text-foreground">Menu</h2>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Items */}
              <nav className="flex-1 px-3 py-4 space-y-1">
                {menuItems.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <motion.button
                      key={item.label}
                      onClick={() => go(item.path, item.state)}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-foreground hover:bg-secondary/60 active:scale-[0.97] transition-all"
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + i * 0.04 }}
                    >
                      <Icon size={18} className="text-primary flex-shrink-0" />
                      <span className="text-sm font-medium flex-1 text-left">{item.label}</span>
                      <ChevronRight size={14} className="text-muted-foreground" />
                    </motion.button>
                  );
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
