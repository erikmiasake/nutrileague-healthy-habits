import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import { mealCategories } from "@/lib/mockData";
import { toast } from "sonner";

const RegisterMeal = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (!selected) return;
    toast.success("Refeição registrada! 🎉 +10 XP");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background pb-24 px-4 pt-6 max-w-[430px] mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground mb-6">
        <ArrowLeft size={20} />
        <span className="text-sm">Voltar</span>
      </button>

      <h1 className="text-2xl font-display font-bold mb-2 animate-slide-up">Registrar refeição</h1>
      <p className="text-sm text-muted-foreground mb-6 animate-slide-up">O que você comeu de saudável?</p>

      <div className="grid grid-cols-2 gap-3 mb-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
        {mealCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelected(cat.id)}
            className={`p-4 rounded-xl border text-left transition-all card-hover ${
              selected === cat.id
                ? "border-primary bg-primary/10"
                : "border-border bg-card"
            }`}
          >
            <span className="text-2xl block mb-2">{cat.emoji}</span>
            <span className="text-sm font-medium">{cat.label}</span>
          </button>
        ))}
      </div>

      <div className="animate-slide-up" style={{ animationDelay: "0.15s" }}>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descreva brevemente (opcional)"
          rows={3}
          className="w-full rounded-xl bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary transition resize-none"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={!selected}
        className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 mt-6 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Check size={18} />
        Registrar
      </button>
    </div>
  );
};

export default RegisterMeal;
