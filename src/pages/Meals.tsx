import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Coffee, UtensilsCrossed, Moon, Cookie, ImageOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { format, isToday, isYesterday, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

const mealMeta: Record<string, { label: string; icon: React.ReactNode; emoji: string }> = {
  breakfast: { label: "Café da manhã", icon: <Coffee size={14} />, emoji: "☕" },
  lunch: { label: "Almoço", icon: <UtensilsCrossed size={14} />, emoji: "🍽️" },
  dinner: { label: "Jantar", icon: <Moon size={14} />, emoji: "🌙" },
  snack: { label: "Lanche", icon: <Cookie size={14} />, emoji: "🍪" },
};

const filters = [
  { key: "all", label: "Todas" },
  { key: "breakfast", label: "Café" },
  { key: "lunch", label: "Almoço" },
  { key: "dinner", label: "Jantar" },
  { key: "snack", label: "Lanche" },
];

type MealLog = {
  id: string;
  meal_type: string;
  image_url: string | null;
  caption: string | null;
  created_at: string;
  date: string;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  detected_foods: string[] | null;
  meal_score: number | null;
  meal_classification: string | null;
  meal_xp: number | null;
};

const MealCard = ({ meal }: { meal: MealLog }) => {
  const meta = mealMeta[meal.meal_type] || mealMeta.snack;
  const time = format(new Date(meal.created_at), "HH:mm");
  const hasNutrition = meal.calories != null;

  return (
    <motion.div
      className="rounded-xl bg-secondary/30 border border-border/40 overflow-hidden"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex gap-3 p-3">
        {/* Image */}
        <div className="w-16 h-16 rounded-lg overflow-hidden bg-secondary/50 flex-shrink-0">
          {meal.image_url ? (
            <img src={meal.image_url} alt={meta.label} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <ImageOff size={20} />
            </div>
          )}
        </div>
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-sm">{meta.emoji}</span>
            <p className="text-sm font-display font-bold text-foreground">{meta.label}</p>
          </div>
          <p className="text-xs text-muted-foreground">{time}</p>
          {meal.caption && (
            <p className="text-xs text-foreground/70 mt-1 truncate">{meal.caption}</p>
          )}
        </div>
        {hasNutrition && (
          <div className="flex-shrink-0 text-right space-y-0.5">
            <p className="text-sm font-display font-bold text-primary">{meal.calories}</p>
            <p className="text-[10px] text-muted-foreground">kcal</p>
            {meal.meal_score != null && (
              <p className={cn("text-[10px] font-bold", 
                meal.meal_score >= 80 ? "text-success" : 
                meal.meal_score >= 60 ? "text-primary" : 
                meal.meal_score >= 40 ? "text-streak-glow" : "text-destructive"
              )}>
                {meal.meal_score}pts
              </p>
            )}
          </div>
        )}
      </div>
      {hasNutrition && (
        <div className="px-3 pb-3 pt-0">
          <div className="flex gap-3 text-[10px] font-medium">
            <span className="text-foreground/70">P: <span className="text-foreground font-bold">{meal.protein}g</span></span>
            <span className="text-foreground/70">C: <span className="text-foreground font-bold">{meal.carbs}g</span></span>
            <span className="text-foreground/70">G: <span className="text-foreground font-bold">{meal.fat}g</span></span>
          </div>
          {meal.detected_foods && meal.detected_foods.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {meal.detected_foods.slice(0, 4).map((food, i) => (
                <span key={i} className="px-1.5 py-0.5 rounded-full bg-primary/8 text-[9px] font-medium text-primary/80 border border-primary/10">
                  {food}
                </span>
              ))}
              {meal.detected_foods.length > 4 && (
                <span className="text-[9px] text-muted-foreground self-center">+{meal.detected_foods.length - 4}</span>
              )}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

const Meals = () => {
  const navigate = useNavigate();
  const [meals, setMeals] = useState<MealLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    const fetchMeals = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("meal_logs")
        .select("id, meal_type, image_url, caption, created_at, date, calories, protein, carbs, fat, detected_foods, meal_score, meal_classification, meal_xp")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100);

      setMeals((data as MealLog[]) || []);
      setLoading(false);
    };
    fetchMeals();
  }, []);

  const filtered = useMemo(() => {
    if (activeFilter === "all") return meals;
    return meals.filter((m) => m.meal_type === activeFilter);
  }, [meals, activeFilter]);

  const todayMeals = useMemo(() => filtered.filter((m) => isToday(new Date(m.date))), [filtered]);

  const pastGroups = useMemo(() => {
    const past = filtered.filter((m) => !isToday(new Date(m.date)));
    const groups: Record<string, MealLog[]> = {};
    past.forEach((m) => {
      const key = m.date;
      if (!groups[key]) groups[key] = [];
      groups[key].push(m);
    });
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  }, [filtered]);

  const formatDateLabel = (dateStr: string) => {
    const d = new Date(dateStr + "T12:00:00");
    if (isYesterday(d)) return "Ontem";
    return format(d, "EEEE, d 'de' MMMM", { locale: ptBR }).replace(/^\w/, (c) => c.toUpperCase());
  };

  return (
    <div className="min-h-screen bg-background pb-24 px-4 pt-5 max-w-[430px] mx-auto">
      {/* Header */}
      <motion.header
        className="mb-5 flex items-center gap-3"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-display font-bold text-foreground">Refeições</h1>
      </motion.header>

      {/* Filters */}
      <motion.div
        className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.05 }}
      >
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border",
              activeFilter === f.key
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-secondary/40 text-muted-foreground border-border/40 hover:text-foreground"
            )}
          >
            {f.label}
          </button>
        ))}
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-16">
          <motion.div
            className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      ) : (
        <>
          {/* Today */}
          <motion.section
            className="mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-sm font-display font-bold text-foreground mb-3">Hoje</h2>
            {todayMeals.length === 0 ? (
              <div className="text-center py-6 rounded-xl bg-secondary/20 border border-border/30">
                <p className="text-xs text-muted-foreground">Nenhuma refeição registrada hoje</p>
                <button
                  onClick={() => navigate("/registrar")}
                  className="text-xs font-semibold text-primary hover:underline mt-2"
                >
                  Registrar agora →
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {todayMeals.map((m) => (
                  <MealCard key={m.id} meal={m} />
                ))}
              </div>
            )}
          </motion.section>

          {/* Past days */}
          {pastGroups.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <h2 className="text-sm font-display font-bold text-foreground mb-3">Últimos dias</h2>
              <div className="space-y-4">
                {pastGroups.map(([dateStr, items]) => (
                  <div key={dateStr}>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">
                      {formatDateLabel(dateStr)}
                    </p>
                    <div className="space-y-2">
                      {items.map((m) => (
                        <MealCard key={m.id} meal={m} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {meals.length === 0 && (
            <div className="text-center py-16">
              <p className="text-sm text-muted-foreground mb-2">Nenhuma refeição registrada</p>
              <button
                onClick={() => navigate("/registrar")}
                className="text-sm font-semibold text-primary hover:underline"
              >
                Registrar primeira refeição →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Meals;
