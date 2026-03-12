import { Flame, Crown } from "lucide-react";
import { leaderboard } from "@/lib/mockData";

const medalColors = ["text-yellow-400", "text-gray-300", "text-amber-600"];

const Ranking = () => {
  return (
    <div className="min-h-screen bg-background pb-24 px-4 pt-6 max-w-[430px] mx-auto">
      <h1 className="text-2xl font-display font-bold mb-1 animate-slide-up">Ranking</h1>
      <p className="text-sm text-muted-foreground mb-6 animate-slide-up">Top jogadores da semana</p>

      {/* Top 3 Podium */}
      <div className="flex items-end justify-center gap-4 mb-8 animate-slide-up" style={{ animationDelay: "0.1s" }}>
        {[1, 0, 2].map((idx) => {
          const user = leaderboard[idx];
          const isFirst = idx === 0;
          return (
            <div key={user.rank} className="flex flex-col items-center">
              <div className={`relative ${isFirst ? "mb-2" : ""}`}>
                {isFirst && <Crown size={18} className="text-yellow-400 absolute -top-5 left-1/2 -translate-x-1/2" />}
                <div
                  className={`rounded-full flex items-center justify-center font-display font-bold text-sm border-2 ${
                    isFirst ? "w-16 h-16 border-primary bg-primary/20 text-primary" : "w-12 h-12 border-border bg-secondary text-foreground"
                  }`}
                >
                  {user.avatar}
                </div>
              </div>
              <p className="text-xs font-medium mt-2 truncate max-w-[70px]">{user.name.split(" ")[0]}</p>
              <div className="flex items-center gap-0.5 mt-0.5">
                <Flame size={10} className="text-primary" />
                <span className="text-[10px] text-muted-foreground">{user.streak}d</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full List */}
      <div className="space-y-2">
        {leaderboard.map((user, i) => (
          <div
            key={user.rank}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-all animate-slide-up ${
              user.isCurrentUser
                ? "border-primary bg-primary/5"
                : "border-border bg-card"
            }`}
            style={{ animationDelay: `${(i + 2) * 0.05}s` }}
          >
            <span className={`text-sm font-display font-bold w-6 text-center ${user.rank <= 3 ? medalColors[user.rank - 1] : "text-muted-foreground"}`}>
              {user.rank}
            </span>
            <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-xs font-semibold shrink-0">
              {user.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user.name}
                {user.isCurrentUser && <span className="text-primary text-[10px] ml-1">(você)</span>}
              </p>
              <p className="text-[10px] text-muted-foreground">{user.xp} XP</p>
            </div>
            <div className="flex items-center gap-1">
              <Flame size={12} className="text-primary" />
              <span className="text-xs font-semibold">{user.streak}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Ranking;
