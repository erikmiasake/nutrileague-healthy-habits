import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { UtensilsCrossed, ChevronRight, Coffee, Moon, Cookie, ImageOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { format, isToday } from "date-fns";

const mealMeta: Record<string, { label: string; emoji: string }> = {
  breakfast: { label: "Café da manhã", emoji: "☕" },
  lunch: { label: "Almoço", emoji: "🍽️" },
  dinner: { label: "Jantar", emoji: "🌙" },
  snack: { label: "Lanche", emoji: "🍪" },
};

type MealLog = {
  id: string;
  meal_type: string;
  image_url: string | null;
  caption: string | null;
  created_at: string;
  date: string;
};

const HomeMealsBlock = () => {
  const navigate = useNavigate();
  const [meals, setMeals] = useState<MealLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const today = new Date().toISOString().split("T")[0];
      const { data } = await supabase
        .from("meal_logs")
        .select("id, meal_type, image_url, caption, created_at, date")
        .eq("user_id", user.id)
        .eq("date", today)
        .order("created_at", { ascending: false })
        .limit(4);
      setMeals(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <motion.section
      className="rounded-2xl border border-border bg-card overflow-hidden card-elevated mb-4"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.18 }}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <UtensilsCrossed size={14} className="text-primary" />
            <h2 className="text-sm font-display font-bold text-foreground">Refeições de hoje</h2>
          </div>
          <button
            onClick={() => navigate("/refeicoes")}
            className="text-[11px] font-medium text-muted-foreground hover:text-foreground flex items-center gap-0.5 transition-colors"
          >
            Ver todas <ChevronRight size={10} />
          </button>
        </div>

        {loading ? (
          <div className="py-4 flex justify-center">
            <motion.div
              className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
        ) : meals.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-xs text-muted-foreground mb-2">Nenhuma refeição hoje</p>
            <button
              onClick={() => navigate("/registrar")}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Registrar agora →
            </button>
          </div>
        ) : (
          <div className="space-y-1.5">
            {meals.map((meal, i) => {
              const meta = mealMeta[meal.meal_type] || mealMeta.snack;
              const time = format(new Date(meal.created_at), "HH:mm");
              return (
                <motion.div
                  key={meal.id}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-secondary/30"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.05 }}
                >
                  <div className="w-9 h-9 rounded-md overflow-hidden bg-secondary/50 flex-shrink-0">
                    {meal.image_url ? (
                      <img src={meal.image_url} alt={meta.label} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <ImageOff size={14} />
                      </div>
                    )}
                  </div>
                  <span className="text-xs">{meta.emoji}</span>
                  <p className="flex-1 text-xs font-medium text-foreground truncate">
                    {meta.label}
                    {meal.caption && <span className="text-foreground/50 ml-1">· {meal.caption}</span>}
                  </p>
                  <span className="text-[10px] text-muted-foreground flex-shrink-0">{time}</span>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </motion.section>
  );
};

export default HomeMealsBlock;
