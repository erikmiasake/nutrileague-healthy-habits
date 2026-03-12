import { Trophy, Users, Zap, Medal } from "lucide-react";
import { motion } from "framer-motion";
import { useLeagueChallengeRanking, type ChallengeWithProgress } from "@/hooks/useChallenges";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

const MEDAL_COLORS = ["text-yellow-500", "text-gray-400", "text-amber-700"];

const LeagueChallengeCard = ({
  challenge,
  index,
}: {
  challenge: ChallengeWithProgress;
  index: number;
}) => {
  const { data: ranking = [], isLoading } = useLeagueChallengeRanking(challenge.id);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id ?? null));
  }, []);

  const progressDays = challenge.progress?.progress_days ?? 0;
  const progressPct = Math.min((progressDays / challenge.duration_days) * 100, 100);
  const completed = challenge.progress?.completed ?? false;
  const userRankIndex = ranking.findIndex((r) => r.userId === currentUserId);

  return (
    <motion.div
      className="bg-card rounded-2xl p-4 border border-border"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-display font-semibold text-foreground">{challenge.title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{challenge.description}</p>
        </div>
        <div className="flex items-center gap-1 bg-primary/10 text-primary rounded-full px-2 py-0.5 ml-2 shrink-0">
          <Zap size={10} />
          <span className="text-[10px] font-bold">{challenge.xp_reward} XP</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between text-[10px] text-muted-foreground mb-1.5">
          <span className="font-medium">Seu progresso</span>
          <span className="font-bold text-foreground">
            {progressDays}/{challenge.duration_days} dias
          </span>
        </div>
        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: completed
                ? "hsl(var(--success))"
                : "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--streak-glow, var(--primary))))",
            }}
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Ranking */}
      <div className="bg-secondary/40 rounded-xl p-3">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">Ranking</span>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Users size={10} />
            <span className="text-[10px]">{ranking.length} participantes</span>
          </div>
        </div>

        {isLoading ? (
          <div className="text-[10px] text-muted-foreground text-center py-2">Carregando...</div>
        ) : ranking.length === 0 ? (
          <div className="text-[10px] text-muted-foreground text-center py-2">Nenhum participante ainda</div>
        ) : (
          <div className="space-y-1.5">
            {ranking.slice(0, 5).map((entry, i) => {
              const isCurrentUser = entry.userId === currentUserId;
              return (
                <motion.div
                  key={entry.userId}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-2.5 py-1.5 transition-colors",
                    isCurrentUser ? "bg-primary/10 border border-primary/30" : "bg-transparent"
                  )}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.06 }}
                >
                  {/* Position */}
                  <div className="w-5 flex justify-center shrink-0">
                    {i < 3 ? (
                      <Medal size={14} className={MEDAL_COLORS[i]} />
                    ) : (
                      <span className="text-[10px] font-bold text-muted-foreground">{i + 1}</span>
                    )}
                  </div>

                  {/* Avatar */}
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-[9px] font-bold bg-secondary text-foreground">
                      {entry.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  {/* Name */}
                  <span className={cn(
                    "text-xs flex-1 min-w-0 truncate",
                    isCurrentUser ? "font-bold text-foreground" : "text-muted-foreground"
                  )}>
                    {entry.name}{isCurrentUser ? " (você)" : ""}
                  </span>

                  {/* Days */}
                  <span className="text-[10px] font-bold text-foreground shrink-0">
                    {entry.progressDays}d
                  </span>
                </motion.div>
              );
            })}

            {/* Show user position if not in top 5 */}
            {userRankIndex >= 5 && (
              <>
                <div className="text-center text-muted-foreground text-[9px] py-0.5">•••</div>
                <motion.div
                  className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 bg-primary/10 border border-primary/30"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="w-5 flex justify-center shrink-0">
                    <span className="text-[10px] font-bold text-muted-foreground">{userRankIndex + 1}</span>
                  </div>
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-[9px] font-bold bg-secondary text-foreground">
                      {ranking[userRankIndex].name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-bold text-foreground flex-1 min-w-0 truncate">
                    {ranking[userRankIndex].name} (você)
                  </span>
                  <span className="text-[10px] font-bold text-foreground shrink-0">
                    {ranking[userRankIndex].progressDays}d
                  </span>
                </motion.div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Trophy size={12} />
          <span className="text-[10px] font-medium">{challenge.duration_days} dias</span>
        </div>
        <span className={cn(
          "text-xs font-bold px-3.5 py-1.5 rounded-full",
          completed ? "bg-success/15 text-success" : "bg-secondary text-muted-foreground"
        )}>
          {completed ? "Concluído ✓" : "Participando"}
        </span>
      </div>
    </motion.div>
  );
};

export default LeagueChallengeCard;
