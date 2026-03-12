import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, ImagePlus, Check, Loader2, X, Coffee, UtensilsCrossed, Moon, Cookie, Flame, Sparkles } from "lucide-react";
import { GradientButton } from "@/components/ui/gradient-button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

type Step = "type" | "photo" | "preview" | "analyzing" | "result";

type NutritionData = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  detected_foods: string[];
};

const mealTypes = [
  { id: "breakfast", label: "Café da manhã", icon: Coffee, emoji: "☕" },
  { id: "lunch", label: "Almoço", icon: UtensilsCrossed, emoji: "🍽️" },
  { id: "dinner", label: "Jantar", icon: Moon, emoji: "🌙" },
  { id: "snack", label: "Lanche", icon: Cookie, emoji: "🍪" },
] as const;

const RegisterMeal = () => {
  const [step, setStep] = useState<Step>("type");
  const [mealType, setMealType] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [nutrition, setNutrition] = useState<NutritionData | null>(null);
  const navigate = useNavigate();

  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const selectedMeal = mealTypes.find((m) => m.id === mealType);

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImagePreview(ev.target?.result as string);
      setStep("preview");
    };
    reader.readAsDataURL(file);
  };

  const handleBack = () => {
    if (step === "result") {
      navigate("/");
      return;
    }
    if (step === "preview") {
      setStep("photo");
      setImageFile(null);
      setImagePreview(null);
      setCaption("");
      if (cameraRef.current) cameraRef.current.value = "";
      if (galleryRef.current) galleryRef.current.value = "";
    } else if (step === "photo") {
      setStep("type");
      setMealType(null);
    } else {
      navigate(-1);
    }
  };

  const handleSubmit = async () => {
    if (!imageFile || !mealType || loading) return;
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Você precisa estar logado para registrar.");
      setLoading(false);
      return;
    }

    const ext = imageFile.name.split(".").pop() || "jpg";
    const filePath = `${user.id}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("meal-images")
      .upload(filePath, imageFile, { cacheControl: "3600", upsert: false });

    if (uploadError) {
      toast.error("Erro ao enviar imagem.");
      setLoading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("meal-images").getPublicUrl(filePath);

    const { data: insertData, error } = await supabase.from("meal_logs").insert({
      user_id: user.id,
      date: new Date().toISOString().split("T")[0],
      image_url: urlData.publicUrl,
      caption: caption.trim() || null,
      meal_type: mealType,
    }).select("id").single();

    if (error || !insertData) {
      toast.error("Erro ao registrar refeição.");
      setLoading(false);
      return;
    }

    toast.success("🔥 Refeição registrada com sucesso!");
    setLoading(false);
    setStep("analyzing");

    // Call AI analysis in background
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-meal`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            meal_id: insertData.id,
            image_url: urlData.publicUrl,
          }),
        }
      );

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        console.error("AI analysis error:", errData);
        toast.error("Não foi possível analisar a refeição.");
        navigate("/");
        return;
      }

      const result = await resp.json();
      setNutrition(result.nutrition);
      setStep("result");
    } catch (err) {
      console.error("AI analysis error:", err);
      toast.error("Erro na análise por IA.");
      navigate("/");
    }
  };

  const backLabel =
    step === "result" ? "Início" : step === "preview" || step === "analyzing" ? "Trocar foto" : step === "photo" ? "Trocar tipo" : "Voltar";

  const macroMax = { protein: 80, carbs: 120, fat: 60 };

  return (
    <div className="min-h-screen bg-background pb-24 px-4 pt-6 max-w-[430px] mx-auto">
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileSelected} />
      <input ref={galleryRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelected} />

      {step !== "analyzing" && (
        <button onClick={handleBack} className="flex items-center gap-2 text-muted-foreground mb-6">
          <ArrowLeft size={20} />
          <span className="text-sm">{backLabel}</span>
        </button>
      )}

      <AnimatePresence mode="wait">
        {/* ── STEP 1: Meal type ── */}
        {step === "type" && (
          <motion.div key="type" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
            <h1 className="text-2xl font-display font-bold mb-1">Registrar refeição</h1>
            <p className="text-sm text-muted-foreground mb-8">Qual refeição você vai registrar?</p>
            <div className="grid grid-cols-2 gap-3">
              {mealTypes.map((meal) => {
                const Icon = meal.icon;
                return (
                  <button
                    key={meal.id}
                    onClick={() => { setMealType(meal.id); setStep("photo"); }}
                    className="flex flex-col items-center gap-2.5 p-5 rounded-2xl border border-border bg-card card-hover transition-all active:scale-[0.97]"
                  >
                    <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center">
                      <Icon size={20} className="text-primary" />
                    </div>
                    <span className="text-sm font-display font-semibold text-foreground">{meal.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ── STEP 2: Photo source ── */}
        {step === "photo" && (
          <motion.div key="photo" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
            <h1 className="text-2xl font-display font-bold mb-1">Foto da refeição</h1>
            <p className="text-sm text-muted-foreground mb-8">Tire uma foto ou escolha da galeria</p>
            {selectedMeal && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <selectedMeal.icon size={13} className="text-primary" />
                <span className="text-xs font-semibold text-primary">{selectedMeal.label}</span>
              </div>
            )}
            <div className="flex flex-col gap-4">
              <button onClick={() => cameraRef.current?.click()} className="flex items-center gap-4 p-5 rounded-2xl border border-border bg-card card-hover transition-all active:scale-[0.98]">
                <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center"><Camera size={22} className="text-primary" /></div>
                <div className="text-left">
                  <p className="text-sm font-display font-bold text-foreground">Tirar foto</p>
                  <p className="text-xs text-muted-foreground">Abrir câmera do celular</p>
                </div>
              </button>
              <button onClick={() => galleryRef.current?.click()} className="flex items-center gap-4 p-5 rounded-2xl border border-border bg-card card-hover transition-all active:scale-[0.98]">
                <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center"><ImagePlus size={22} className="text-primary" /></div>
                <div className="text-left">
                  <p className="text-sm font-display font-bold text-foreground">Escolher da galeria</p>
                  <p className="text-xs text-muted-foreground">Selecionar imagem salva</p>
                </div>
              </button>
            </div>
          </motion.div>
        )}

        {/* ── STEP 3: Preview & confirm ── */}
        {step === "preview" && imagePreview && (
          <motion.div key="preview" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
            <h1 className="text-2xl font-display font-bold mb-1">Confirmar refeição</h1>
            <p className="text-sm text-muted-foreground mb-5">Tudo certo com a foto?</p>
            {selectedMeal && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
                <selectedMeal.icon size={13} className="text-primary" />
                <span className="text-xs font-semibold text-primary">{selectedMeal.label}</span>
              </div>
            )}
            <div className="relative rounded-2xl overflow-hidden border border-border mb-5">
              <img src={imagePreview} alt="Preview da refeição" className="w-full aspect-[4/3] object-cover" />
              <button onClick={handleBack} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/70 backdrop-blur-sm flex items-center justify-center border border-border">
                <X size={14} className="text-foreground" />
              </button>
            </div>
            <textarea value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Legenda curta (opcional)" rows={2} className="w-full rounded-xl bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary transition resize-none mb-5" />
            <div className="flex flex-col gap-3">
              <GradientButton onClick={handleSubmit} disabled={loading} className="w-full h-12 rounded-xl gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                {loading ? "Registrando..." : "Confirmar refeição"}
              </GradientButton>
              <button onClick={() => navigate(-1)} disabled={loading} className="w-full h-11 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Cancelar
              </button>
            </div>
          </motion.div>
        )}

        {/* ── STEP 4: Analyzing ── */}
        {step === "analyzing" && (
          <motion.div key="analyzing" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="flex flex-col items-center justify-center py-20">
            <motion.div
              className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Sparkles size={28} className="text-primary" />
            </motion.div>
            <h2 className="text-lg font-display font-bold text-foreground mb-2">Analisando refeição...</h2>
            <p className="text-sm text-muted-foreground text-center max-w-[280px]">
              A IA está identificando os alimentos e estimando os macronutrientes.
            </p>
          </motion.div>
        )}

        {/* ── STEP 5: Result ── */}
        {step === "result" && nutrition && (
          <motion.div key="result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={18} className="text-primary" />
              <h1 className="text-2xl font-display font-bold">Análise completa</h1>
            </div>
            <p className="text-sm text-muted-foreground mb-6">Valores estimados por IA com base na imagem.</p>

            {/* Image thumbnail */}
            {imagePreview && (
              <div className="rounded-2xl overflow-hidden border border-border mb-5">
                <img src={imagePreview} alt="Refeição" className="w-full aspect-[16/9] object-cover" />
              </div>
            )}

            {/* Calories hero */}
            <motion.div
              className="rounded-2xl border border-border bg-card p-5 mb-4 text-center card-elevated"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Flame size={22} className="text-primary mx-auto mb-1" />
              <p className="text-3xl font-display font-extrabold text-foreground">{nutrition.calories}</p>
              <p className="text-xs text-muted-foreground font-medium">kcal estimadas</p>
            </motion.div>

            {/* Macros */}
            <motion.div
              className="rounded-2xl border border-border bg-card p-4 mb-4 card-elevated"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <h3 className="text-sm font-display font-bold text-foreground mb-3">Macronutrientes</h3>
              <div className="space-y-3">
                {([
                  { label: "Proteína", value: nutrition.protein, max: macroMax.protein, color: "hsl(var(--primary))" },
                  { label: "Carboidratos", value: nutrition.carbs, max: macroMax.carbs, color: "hsl(var(--streak-glow))" },
                  { label: "Gordura", value: nutrition.fat, max: macroMax.fat, color: "hsl(var(--xp))" },
                ] as const).map((macro) => (
                  <div key={macro.label}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-foreground">{macro.label}</span>
                      <span className="text-xs font-bold text-foreground">{macro.value}g</span>
                    </div>
                    <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: macro.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((macro.value / macro.max) * 100, 100)}%` }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Detected foods */}
            <motion.div
              className="rounded-2xl border border-border bg-card p-4 mb-6 card-elevated"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-sm font-display font-bold text-foreground mb-2">Alimentos identificados</h3>
              <div className="flex flex-wrap gap-1.5">
                {nutrition.detected_foods.map((food, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-full bg-primary/10 text-xs font-medium text-primary border border-primary/20">
                    {food}
                  </span>
                ))}
              </div>
            </motion.div>

            <GradientButton onClick={() => navigate("/")} className="w-full h-12 rounded-xl gap-2">
              <Check size={18} />
              Voltar ao início
            </GradientButton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RegisterMeal;
