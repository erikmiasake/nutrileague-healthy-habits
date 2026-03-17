import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface RankingMember {
  userId: string;
  name: string;
  avatarUrl: string | null;
  avgScore: number;
  currentStreak: number;
  isCurrentUser: boolean;
}

interface LeagueRankingData {
  leagueName: string | null;
  leagueId: string | null;
  members: RankingMember[];
  userPosition: number | null;
  loading: boolean;
}

export function useLeagueRanking(): LeagueRankingData {
  const [data, setData] = useState<LeagueRankingData>({
    leagueName: null,
    leagueId: null,
    members: [],
    userPosition: null,
    loading: true,
  });

  useEffect(() => {
    const fetchRanking = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setData(prev => ({ ...prev, loading: false })); return; }

      const { data: membership } = await supabase
        .from("league_members").select("league_id").eq("user_id", user.id).limit(1).maybeSingle();

      if (!membership) { setData(prev => ({ ...prev, loading: false })); return; }

      const { data: league } = await supabase
        .from("leagues").select("name").eq("id", membership.league_id).maybeSingle();

      const { data: members } = await supabase
        .from("league_members").select("user_id").eq("league_id", membership.league_id);

      if (!members || members.length === 0) { setData(prev => ({ ...prev, loading: false })); return; }

      const memberIds = members.map(m => m.user_id);

      // Fetch profiles and streaks
      const { data: profiles } = await supabase
        .from("profiles").select("user_id, name, avatar_url").in("user_id", memberIds);

      const { data: streaks } = await supabase
        .from("streaks").select("user_id, current_streak").in("user_id", memberIds);

      // Fetch meal scores from last 7 days for all members
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 6);
      const weekAgoStr = weekAgo.toISOString().split("T")[0];

      const { data: mealScores } = await supabase
        .from("meal_logs")
        .select("user_id, meal_score")
        .in("user_id", memberIds)
        .gte("date", weekAgoStr)
        .not("meal_score", "is", null);

      // Calculate average score per user
      const scoreMap = new Map<string, number>();
      if (mealScores && mealScores.length > 0) {
        const userScores = new Map<string, number[]>();
        for (const m of mealScores) {
          if (!userScores.has(m.user_id)) userScores.set(m.user_id, []);
          userScores.get(m.user_id)!.push(m.meal_score!);
        }
        for (const [uid, scores] of userScores) {
          scoreMap.set(uid, Math.round(scores.reduce((a, b) => a + b, 0) / scores.length));
        }
      }

      const profileMap = new Map((profiles || []).map(p => [p.user_id, p]));
      const streakMap = new Map((streaks || []).map(s => [s.user_id, s.current_streak]));

      const ranking: RankingMember[] = memberIds.map(id => {
        const profile = profileMap.get(id);
        return {
          userId: id,
          name: profile?.name || "Jogador",
          avatarUrl: profile?.avatar_url || null,
          avgScore: scoreMap.get(id) ?? 0,
          currentStreak: streakMap.get(id) ?? 0,
          isCurrentUser: id === user.id,
        };
      });

      ranking.sort((a, b) => b.avgScore - a.avgScore);
      const userPos = ranking.findIndex(m => m.isCurrentUser) + 1;

      setData({
        leagueName: league?.name || "Liga",
        leagueId: membership.league_id,
        members: ranking,
        userPosition: userPos > 0 ? userPos : null,
        loading: false,
      });
    };

    fetchRanking();
  }, []);

  return data;
}
