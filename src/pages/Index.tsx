import { Flame, Zap, Trophy, ChevronRight } from "lucide-react";
import StreakRing from "@/components/StreakRing";
import { ConsistencyCard } from "@/components/ConsistencyCard";
import { ProgressOverview } from "@/components/ui/dashboard-overview";
import { currentUser, recentMeals, weekDays, weekActivity } from "@/lib/mockData";

const consistencyData = {
  currentStreak: currentUser.streak,
  percentageChange: 20,
  leagueAverage: 9,
  friends: [
    { name: "Marina Silva", avatar: "MS", streak: 15 },
    { name: "Rafael Costa", avatar: "RC", streak: 11 },
    { name: "Lucas Oliveira", avatar: "LO", streak: 9 },
  ],
  levels: [
    { label: "Início", value: 3, color: "bg-destructive" },
    { label: "Evoluindo", value: 7, color: "bg-xp" },
    { label: "Consistente", value: 14, color: "bg-primary" },
    { label: "Em alta", value: 30, color: "bg-success" },
  ],
};

const Index = () => {
  return (
    <div className="min-h-screen bg-background pb-24 px-4 pt-8 max-w-[430px] mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between mb-8 animate-slide-up">
        <div>
          <p className="text-xs text-muted-foreground tracking-wide uppercase">Olá,</p>
          <h1 className="text-xl font-display font-bold mt-0.5">{currentUser.name} 👋</h1>
        </div>
        <div className="flex items-center gap-2 bg-secondary/80 rounded-full px-4 py-2">
          <Zap size={14} className="text-xp" />
          <span className="text-sm font-semibold">{currentUser.xp} XP</span>
        </div>
      </header>

      {/* Streak Card */}
      <section className="bg-card rounded-2xl p-8 mb-6 flex flex-col items-center border border-border card-elevated animate-slide-up">
        <StreakRing days={currentUser.streak} />
        <p className="text-sm text-muted-foreground mt-3 flex items-center gap-1.5">
          <Flame className="text-primary" size={14} />
          Sequência atual
        </p>

        {/* Week Activity */}
        <div className="flex gap-2.5 mt-6">
          {weekDays.map((day, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                  weekActivity[i]
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {day}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Progress Overview */}
      <section className="mb-6 animate-slide-up" style={{ animationDelay: "0.08s" }}>
        <ProgressOverview />
      </section>

      {/* XP Progress */}
      <section className="bg-card rounded-2xl p-5 border border-border mb-6 card-elevated animate-slide-up" style={{ animationDelay: "0.12s" }}>
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs text-muted-foreground font-medium">Próximo nível</span>
          <span className="text-xs font-semibold text-primary">{currentUser.xp}/{currentUser.xpToNext} XP</span>
        </div>
        <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-700"
            style={{ width: `${(currentUser.xp / currentUser.xpToNext) * 100}%` }}
          />
        </div>
        <p className="text-[10px] text-muted-foreground mt-2">Faltam {currentUser.xpToNext - currentUser.xp} XP para o nível {currentUser.level + 1}</p>
      </section>

      {/* Consistency Card */}
      <section className="mb-6 animate-slide-up" style={{ animationDelay: "0.16s" }}>
        <ConsistencyCard {...consistencyData} />
      </section>

      {/* Recent Meals */}
      <section className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-display font-bold flex items-center gap-2">
            <Trophy size={14} className="text-primary" />
            Refeições recentes
          </h2>
          <button className="text-xs text-muted-foreground flex items-center gap-0.5 hover:text-foreground transition-colors">
            Ver todas <ChevronRight size={12} />
          </button>
        </div>
        <div className="space-y-2.5">
          {recentMeals.map((meal) => (
            <div
              key={meal.id}
              className="bg-card rounded-2xl p-4 border border-border flex items-center gap-4 card-elevated"
            >
              <span className="text-2xl">{meal.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{meal.description}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{meal.category} • {meal.time}</p>
              </div>
              <span className="text-[11px] text-muted-foreground font-medium">{meal.date}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Index;
