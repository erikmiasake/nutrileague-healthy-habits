import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface RankingMember {
  userId: string;
  name: string;
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
      if (!user) {
        setData(prev => ({ ...prev, loading: false }));
        return;
      }

      // Get user's first league
      const { data: membership } = await supabase
        .from("league_members")
        .select("league_id")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      if (!membership) {
        setData(prev => ({ ...prev, loading: false }));
        return;
      }

      // Get league name
      const { data: league } = await supabase
        .from("leagues")
        .select("name")
        .eq("id", membership.league_id)
        .maybeSingle();

      // Get all members of the league
      const { data: members } = await supabase
        .from("league_members")
        .select("user_id")
        .eq("league_id", membership.league_id);

      if (!members || members.length === 0) {
        setData(prev => ({ ...prev, loading: false }));
        return;
      }

      const memberIds = members.map(m => m.user_id);

      // Get profiles and streaks for all members
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, name")
        .in("user_id", memberIds);

      const { data: streaks } = await supabase
        .from("streaks")
        .select("user_id, current_streak")
        .in("user_id", memberIds);

      const profileMap = new Map((profiles || []).map(p => [p.user_id, p.name]));
      const streakMap = new Map((streaks || []).map(s => [s.user_id, s.current_streak]));

      const ranking: RankingMember[] = memberIds.map(id => ({
        userId: id,
        name: profileMap.get(id) || "Jogador",
        currentStreak: streakMap.get(id) ?? 0,
        isCurrentUser: id === user.id,
      }));

      // Sort by streak descending
      ranking.sort((a, b) => b.currentStreak - a.currentStreak);

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
