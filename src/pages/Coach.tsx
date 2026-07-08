import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import AppSidebar from "@/components/AppSidebar";
import { toast } from "sonner";

type QuestionKey =
  | "improve_next"
  | "top_meal_week"
  | "why_low_score"
  | "meal_idea_goal"
  | "goal_progress";

const CHIPS: { key: QuestionKey; label: string }[] = [
  { key: "improve_next", label: "Como posso melhorar minha próxima refeição?" },
  { key: "top_meal_week", label: "Qual foi meu prato com mais pontos essa semana?" },
  { key: "why_low_score", label: "Por que esse prato pontuou baixo?" },
  { key: "meal_idea_goal", label: "Me dá uma ideia de refeição que ajuda minha meta" },
  { key: "goal_progress", label: "Como estou indo em relação ao meu objetivo?" },
];

type Message = {
  id: string;
  role: "user" | "coach";
  text: string;
  action?: { label: string; route: string };
};

export default function Coach() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const ask = async (key: QuestionKey, label: string) => {
    if (loading) return;
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", text: label };
    setMessages((m) => [...m, userMsg]);
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("coach-chat", {
        body: { question_key: key },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: "coach",
          text: data.reply,
          action: data.action,
        },
      ]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro ao falar com o Coach";
      toast.error(msg);
      setMessages((m) => [
        ...m,
        { id: crypto.randomUUID(), role: "coach", text: "Não consegui responder agora. Tenta de novo em instantes." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-xl border-b border-border/60">
        <div className="max-w-[430px] mx-auto px-4 py-3 flex items-center gap-3">
          <AppSidebar />
          <div className="flex items-center gap-2 flex-1">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/30">
              <Sparkles size={16} className="text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-base font-display font-bold text-foreground leading-none">Coach</h1>
              <p className="text-[10px] text-muted-foreground mt-0.5">Seu treinador nutricional</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[430px] mx-auto px-4 pt-4">
        {/* Opener */}
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl p-4 mb-4"
          >
            <p className="text-sm text-foreground">Como posso te ajudar hoje?</p>
          </motion.div>
        )}

        {/* Messages */}
        <div className="space-y-3 mb-4">
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
              >
                <div
                  className={
                    m.role === "user"
                      ? "max-w-[85%] bg-primary text-primary-foreground rounded-2xl rounded-tr-md px-4 py-2.5 text-sm"
                      : "max-w-[90%] bg-card border border-border rounded-2xl rounded-tl-md px-4 py-3"
                  }
                >
                  {m.role === "coach" ? (
                    <>
                      <div className="prose prose-sm prose-invert max-w-none text-sm text-foreground leading-relaxed [&>p]:m-0 [&>p+p]:mt-2">
                        <ReactMarkdown>{m.text}</ReactMarkdown>
                      </div>
                      {m.action && (
                        <button
                          onClick={() => navigate(m.action!.route)}
                          className="mt-3 w-full flex items-center justify-between gap-2 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-sm font-semibold rounded-xl px-4 py-2.5 shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform"
                        >
                          <span>{m.action.label}</span>
                          <ArrowRight size={16} />
                        </button>
                      )}
                    </>
                  ) : (
                    <span>{m.text}</span>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-card border border-border rounded-2xl rounded-tl-md px-4 py-3 flex items-center gap-2">
                <Loader2 size={14} className="animate-spin text-primary" />
                <span className="text-xs text-muted-foreground">Coach pensando...</span>
              </div>
            </motion.div>
          )}
          <div ref={endRef} />
        </div>

        {/* Chips */}
        <div className="sticky bottom-20 pt-2 pb-1 bg-gradient-to-t from-background via-background to-transparent">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2 px-1">
            Perguntas rápidas
          </p>
          <div className="flex flex-wrap gap-2">
            {CHIPS.map((c) => (
              <button
                key={c.key}
                disabled={loading}
                onClick={() => ask(c.key, c.label)}
                className="text-xs bg-card hover:bg-secondary border border-border hover:border-primary/40 text-foreground rounded-full px-3 py-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
