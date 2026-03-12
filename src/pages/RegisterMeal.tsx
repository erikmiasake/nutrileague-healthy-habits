import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, ImagePlus, Check, Loader2, X } from "lucide-react";
import { GradientButton } from "@/components/ui/gradient-button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

type Step = "choose" | "preview";

const RegisterMeal = () => {
  const [step, setStep] = useState<Step>("choose");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

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

  const handleReset = () => {
    setStep("choose");
    setImageFile(null);
    setImagePreview(null);
    setCaption("");
    if (cameraRef.current) cameraRef.current.value = "";
    if (galleryRef.current) galleryRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!imageFile || loading) return;
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Você precisa estar logado para registrar.");
      setLoading(false);
      return;
    }

    // Upload image
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

    const { data: urlData } = supabase.storage
      .from("meal-images")
      .getPublicUrl(filePath);

    const imageUrl = urlData.publicUrl;

    // Insert meal log
    const { error } = await supabase.from("meal_logs").insert({
      user_id: user.id,
      date: new Date().toISOString().split("T")[0],
      image_url: imageUrl,
      caption: caption.trim() || null,
    });

    setLoading(false);

    if (error) {
      toast.error("Erro ao registrar refeição.");
      return;
    }

    toast.success("🔥 Refeição registrada com sucesso!");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background pb-24 px-4 pt-6 max-w-[430px] mx-auto">
      {/* Hidden file inputs */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileSelected}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelected}
      />

      {/* Back button */}
      <button
        onClick={() => (step === "preview" ? handleReset() : navigate(-1))}
        className="flex items-center gap-2 text-muted-foreground mb-6"
      >
        <ArrowLeft size={20} />
        <span className="text-sm">{step === "preview" ? "Trocar foto" : "Voltar"}</span>
      </button>

      <AnimatePresence mode="wait">
        {step === "choose" && (
          <motion.div
            key="choose"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            <h1 className="text-2xl font-display font-bold mb-2">Registrar refeição</h1>
            <p className="text-sm text-muted-foreground mb-8">
              Tire uma foto ou escolha da galeria
            </p>

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

        {step === "preview" && imagePreview && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            <h1 className="text-2xl font-display font-bold mb-2">Confirmar refeição</h1>
            <p className="text-sm text-muted-foreground mb-5">
              Tudo certo com a foto?
            </p>

            {/* Image preview */}
            <div className="relative rounded-2xl overflow-hidden border border-border mb-5">
              <img
                src={imagePreview}
                alt="Preview da refeição"
                className="w-full aspect-[4/3] object-cover"
              />
              <button
                onClick={handleReset}
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
              <GradientButton
                onClick={handleSubmit}
                disabled={loading}
                className="w-full h-12 rounded-xl gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Check size={18} />
                )}
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
