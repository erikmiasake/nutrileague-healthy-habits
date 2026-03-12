import { Trophy, Users, Zap } from "lucide-react";
import { challenges } from "@/lib/mockData";
import { toast } from "sonner";

const Challenges = () => {
  return (
    <div className="min-h-screen bg-background pb-24 px-4 pt-6 max-w-[430px] mx-auto">
      <h1 className="text-2xl font-display font-bold mb-1 animate-slide-up">Desafios</h1>
      <p className="text-sm text-muted-foreground mb-6 animate-slide-up">Participe e ganhe XP extra</p>

      <div className="space-y-3">
        {challenges.map((c, i) => (
          <div
            key={c.id}
            className="bg-card rounded-xl p-4 border border-border animate-slide-up"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-sm font-semibold">{c.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{c.description}</p>
              </div>
              <div className="flex items-center gap-1 bg-primary/10 text-primary rounded-full px-2 py-0.5 ml-2 shrink-0">
                <Zap size={10} />
                <span className="text-[10px] font-semibold">{c.xpReward} XP</span>
              </div>
            </div>

            {c.active && (
              <div className="mb-3">
                <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                  <span>Progresso</span>
                  <span>{c.progress}/{c.goal}</span>
                </div>
                <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${(c.progress / c.goal) * 100}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users size={12} />
                <span className="text-[10px]">{c.participants} participantes</span>
              </div>
              <button
                onClick={() => {
                  if (!c.active) toast.success("Você entrou no desafio! 💪");
                }}
                className={`text-xs font-semibold px-3 py-1 rounded-full transition-all active:scale-95 ${
                  c.active
                    ? "bg-secondary text-muted-foreground"
                    : "bg-primary text-primary-foreground"
                }`}
              >
                {c.active ? "Participando" : "Participar"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Challenges;
