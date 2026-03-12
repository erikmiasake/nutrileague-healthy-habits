import { Flame, Zap, Trophy } from "lucide-react";
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
    <div className="min-h-screen bg-background pb-24 px-4 pt-6 max-w-[430px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 animate-slide-up">
        <div>
          <p className="text-sm text-muted-foreground">Olá,</p>
          <h1 className="text-xl font-display font-bold">{currentUser.name} 👋</h1>
        </div>
        <div className="flex items-center gap-2 bg-secondary rounded-full px-3 py-1.5">
          <Zap size={14} className="text-xp" />
          <span className="text-sm font-semibold">{currentUser.xp} XP</span>
        </div>
      </div>

      {/* Streak Card */}
      <div className="bg-card rounded-2xl p-6 mb-4 flex flex-col items-center border border-border animate-slide-up">
        <StreakRing days={currentUser.streak} />
        <p className="text-sm text-muted-foreground mt-2">
          <Flame className="inline text-primary mr-1" size={14} />
          Sequência atual
        </p>

        {/* Week Activity */}
        <div className="flex gap-3 mt-4">
          {weekDays.map((day, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
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
      </div>

      {/* Progress Overview */}
      <div className="mb-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
        <ProgressOverview />
      </div>
      </div>

      {/* XP Progress */}
      <div className="bg-card rounded-xl p-4 border border-border mb-6 animate-slide-up" style={{ animationDelay: "0.15s" }}>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-muted-foreground">Próximo nível</span>
          <span className="text-xs font-medium text-primary">{currentUser.xp}/{currentUser.xpToNext} XP</span>
        </div>
        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-700"
            style={{ width: `${(currentUser.xp / currentUser.xpToNext) * 100}%` }}
          />
        </div>
      </div>

      {/* Consistency Card */}
      <div className="mb-6 animate-slide-up" style={{ animationDelay: "0.18s" }}>
        <ConsistencyCard {...consistencyData} />
      </div>

      {/* Recent Meals */}
      <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Trophy size={14} className="text-primary" />
          Refeições recentes
        </h2>
        <div className="space-y-2">
          {recentMeals.map((meal) => (
            <div
              key={meal.id}
              className="bg-card rounded-xl p-3 border border-border flex items-center gap-3"
            >
              <span className="text-2xl">{meal.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{meal.description}</p>
                <p className="text-[10px] text-muted-foreground">{meal.category} • {meal.time}</p>
              </div>
              <span className="text-[10px] text-muted-foreground">{meal.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
