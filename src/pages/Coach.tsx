import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import AppSidebar from "@/components/AppSidebar";
import { toast } from "sonner";
import sparkIcon from "@/assets/spark-icon.png";

type QuestionKey =
  | "improve_next"
  | "top_meal_week"
  | "why_low_score"
  | "meal_idea_goal"
  | "goal_progress";

const CHIPS: { key: QuestionKey; label: string; short: string }[] = [
  { key: "improve_next", label: "Como posso melhorar minha próxima refeição?", short: "Melhorar próxima refeição" },
  { key: "top_meal_week", label: "Qual foi meu prato com mais pontos essa semana?", short: "Top prato da semana" },
  { key: "why_low_score", label: "Por que esse prato pontuou baixo?", short: "Por que pontuei baixo?" },
  { key: "meal_idea_goal", label: "Me dá uma ideia de refeição que ajuda minha meta", short: "Ideia pra minha meta" },
  { key: "goal_progress", label: "Como estou indo em relação ao meu objetivo?", short: "Como vou no objetivo?" },
];

type Message = {
  id: string;
  role: "user" | "coach";
  text: string;
  action?: { label: string; route: string };
};

const SparkAvatar = ({ pulse = false }: { pulse?: boolean }) => (
  <div className="relative shrink-0">
    {pulse && (
      <motion.span
        className="absolute inset-0 rounded-xl bg-primary/40 blur-md"
        animate={{ opacity: [0.3, 0.7, 0.3], scale: [0.9, 1.05, 0.9] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      />
    )}
    <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-lg shadow-primary/30 ring-1 ring-primary/40 p-1.5">
      <img src={sparkIcon} alt="Spark" className="w-full h-full object-contain" />
    </div>
  </div>
);

const TypingDots = () => (
  <div className="flex items-center gap-1 py-1">
    {[0, 1, 2].map((i) => (
      <motion.span
        key={i}
        className="w-1.5 h-1.5 rounded-full bg-primary"
        animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
        transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
      />
    ))}
  </div>
);

export default function Coach() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
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
        { id: crypto.randomUUID(), role: "coach", text: data.reply, action: data.action },
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

  const hasStarted = messages.length > 0;

  // Bottom bar height reservation: chip row (~52px) + composer (~56px) + padding + bottom nav (60px)
  const bottomPad = hasStarted ? "pb-[200px]" : "pb-[160px]";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-xl border-b border-border/60">
        <div className="max-w-[430px] mx-auto px-4 py-3 flex items-center gap-3">
          <AppSidebar />
          <div className="flex items-center gap-2 flex-1">
            <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/30">
              <Sparkles size={16} className="text-primary-foreground" />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 ring-2 ring-background" />
            </div>
            <div>
              <h1 className="text-base font-display font-bold text-foreground leading-none">Coach</h1>
              <p className="text-[10px] text-muted-foreground mt-0.5">Online · treinador nutricional</p>
            </div>
          </div>
        </div>
      </header>

      {/* Messages area */}
      <main className={`flex-1 ${bottomPad}`}>
        <div className="max-w-[430px] mx-auto px-4 pt-4 space-y-4">
          {/* Empty state: opener + chips grid inline */}
          {!hasStarted && (
            <>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-end gap-2"
              >
                <CoachAvatar pulse />
                <div className="max-w-[85%] bg-primary/10 border border-primary/25 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                  <p className="text-sm text-foreground leading-relaxed">Como posso te ajudar hoje?</p>
                  <p className="text-[11px] text-muted-foreground mt-1.5">
                    Toque em uma pergunta rápida abaixo
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="pl-11 space-y-2"
              >
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-0.5">
                  Perguntas rápidas
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {CHIPS.map((c) => (
                    <button
                      key={c.key}
                      onClick={() => ask(c.key, c.label)}
                      className="text-left text-xs bg-card hover:bg-secondary border border-border hover:border-primary/40 text-foreground rounded-xl px-3 py-2.5 transition-colors leading-snug min-h-[48px] flex items-center active:scale-[0.98]"
                    >
                      {c.short}
                    </button>
                  ))}
                </div>
              </motion.div>
            </>
          )}

          {/* Messages */}
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={m.role === "user" ? "flex justify-end" : "flex items-end gap-2 justify-start"}
              >
                {m.role === "coach" && <CoachAvatar />}
                <div
                  className={
                    m.role === "user"
                      ? "max-w-[80%] bg-primary text-primary-foreground rounded-2xl rounded-br-md px-4 py-2.5 text-sm shadow-md shadow-primary/20"
                      : "max-w-[82%] bg-primary/10 border border-primary/25 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm"
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
              className="flex items-end gap-2 justify-start"
            >
              <CoachAvatar pulse />
              <div className="bg-primary/10 border border-primary/25 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                <TypingDots />
              </div>
            </motion.div>
          )}
          <div ref={endRef} />
        </div>
      </main>

      {/* Fixed bottom: chip strip (only after start) + composer, sitting above bottom nav */}
      <div className="fixed bottom-[60px] left-0 right-0 z-30 bg-background/95 backdrop-blur-xl border-t border-border/60">
        <div className="max-w-[430px] mx-auto px-3 py-2.5 space-y-2">
          {hasStarted && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
              {CHIPS.map((c) => (
                <button
                  key={c.key}
                  disabled={loading}
                  onClick={() => ask(c.key, c.label)}
                  className="shrink-0 text-xs bg-card hover:bg-secondary border border-border hover:border-primary/40 text-foreground rounded-full px-3 py-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {c.short}
                </button>
              ))}
            </div>
          )}

          {/* Disabled composer */}
          <div className="flex items-center gap-2 bg-card/60 border border-border rounded-2xl px-4 py-2.5 opacity-70">
            <input
              disabled
              placeholder="Em breve: pergunte qualquer coisa"
              className="flex-1 bg-transparent text-sm text-muted-foreground placeholder:text-muted-foreground/70 outline-none cursor-not-allowed min-w-0"
            />
            <button
              disabled
              className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground cursor-not-allowed shrink-0"
              aria-label="Enviar (em breve)"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
