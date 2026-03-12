import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, ImagePlus, Check, Loader2, X, Coffee, UtensilsCrossed, Moon, Cookie } from "lucide-react";
import { GradientButton } from "@/components/ui/gradient-button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

type Step = "type" | "photo" | "preview";

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

    const {
      data: { user },
    } = await supabase.auth.getUser();
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

    const { error } = await supabase.from("meal_logs").insert({
      user_id: user.id,
      date: new Date().toISOString().split("T")[0],
      image_url: urlData.publicUrl,
      caption: caption.trim() || null,
      meal_type: mealType,
    });

    setLoading(false);

    if (error) {
      toast.error("Erro ao registrar refeição.");
      return;
    }

    toast.success("🔥 Refeição registrada com sucesso!");
    navigate("/");
  };

  const backLabel =
    step === "preview" ? "Trocar foto" : step === "photo" ? "Trocar tipo" : "Voltar";

  return (
    <div className="min-h-screen bg-background pb-24 px-4 pt-6 max-w-[430px] mx-auto">
      {/* Hidden file inputs */}
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileSelected} />
      <input ref={galleryRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelected} />

      {/* Back */}
      <button onClick={handleBack} className="flex items-center gap-2 text-muted-foreground mb-6">
        <ArrowLeft size={20} />
        <span className="text-sm">{backLabel}</span>
      </button>

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
                    onClick={() => {
                      setMealType(meal.id);
                      setStep("photo");
                    }}
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

            {/* Selected type badge */}
            {selectedMeal && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <selectedMeal.icon size={13} className="text-primary" />
                <span className="text-xs font-semibold text-primary">{selectedMeal.label}</span>
              </div>
            )}

            <div className="flex flex-col gap-4">
              <button
                onClick={() => cameraRef.current?.click()}
                className="flex items-center gap-4 p-5 rounded-2xl border border-border bg-card card-hover transition-all active:scale-[0.98]"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center">
                  <Camera size={22} className="text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-display font-bold text-foreground">Tirar foto</p>
                  <p className="text-xs text-muted-foreground">Abrir câmera do celular</p>
                </div>
              </button>

              <button
                onClick={() => galleryRef.current?.click()}
                className="flex items-center gap-4 p-5 rounded-2xl border border-border bg-card card-hover transition-all active:scale-[0.98]"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center">
                  <ImagePlus size={22} className="text-primary" />
                </div>
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

            {/* Selected type badge */}
            {selectedMeal && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
                <selectedMeal.icon size={13} className="text-primary" />
                <span className="text-xs font-semibold text-primary">{selectedMeal.label}</span>
              </div>
            )}

            {/* Image preview */}
            <div className="relative rounded-2xl overflow-hidden border border-border mb-5">
              <img src={imagePreview} alt="Preview da refeição" className="w-full aspect-[4/3] object-cover" />
              <button
                onClick={handleBack}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/70 backdrop-blur-sm flex items-center justify-center border border-border"
              >
                <X size={14} className="text-foreground" />
              </button>
            </div>

            {/* Caption */}
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Legenda curta (opcional)"
              rows={2}
              className="w-full rounded-xl bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary transition resize-none mb-5"
            />

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <GradientButton onClick={handleSubmit} disabled={loading} className="w-full h-12 rounded-xl gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                {loading ? "Registrando..." : "Confirmar refeição"}
              </GradientButton>

              <button
                onClick={() => navigate(-1)}
                disabled={loading}
                className="w-full h-11 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RegisterMeal;
