import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BlurFade } from "@/components/ui/blur-fade";
import { EtheralShadow } from "@/components/ui/etheral-shadow";
import logo from "@/assets/logo.png";

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen = ({ onFinish }: SplashScreenProps) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 4600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence onExitComplete={onFinish}>
      {visible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background"
        >
          {/* Etheral shadow background */}
          <div className="absolute inset-0">
            <EtheralShadow
              color="hsl(24 100% 56% / 0.25)"
              animation={{ scale: 30, speed: 15 }}
              noise={{ opacity: 0.03, scale: 1 }}
            />
          </div>

          {/* Logo */}
          <div className="relative z-10">
            <BlurFade delay={0.1} duration={0.8} yOffset={12} blur="10px">
              <img
                src={logo}
                alt="NutriLeague"
                className="w-64 h-64"
              />
            </BlurFade>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
