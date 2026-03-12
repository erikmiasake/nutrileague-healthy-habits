import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ChallengeType = "personal" | "league" | "event";

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: ChallengeType;
  duration_days: number;
  xp_reward: number;
  active: boolean;
  league_id: string | null;
  created_at: string;
}

export interface ChallengeProgress {
  id: string;
  user_id: string;
  challenge_id: string;
  progress_days: number;
  completed: boolean;
  joined_at: string;
  updated_at: string;
}

export interface ChallengeWithProgress extends Challenge {
  progress?: ChallengeProgress;
}

export interface LeagueChallengeRanking {
  userId: string;
  name: string;
  progressDays: number;
}

export function useChallenges() {
  const queryClient = useQueryClient();

  // Fetch user's league IDs
  const userLeaguesQuery = useQuery({
    queryKey: ["user_leagues"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from("league_members")
        .select("league_id")
        .eq("user_id", user.id);
      if (error) throw error;
      return data.map((d) => d.league_id);
    },
  });

  const challengesQuery = useQuery({
    queryKey: ["challenges"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("challenges")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Challenge[];
    },
  });

  const progressQuery = useQuery({
    queryKey: ["challenge_progress"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from("challenge_progress")
        .select("*")
        .eq("user_id", user.id);
      if (error) throw error;
      return data as ChallengeProgress[];
    },
  });

  const joinChallenge = useMutation({
    mutationFn: async (challengeId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("challenge_progress").insert({
        user_id: user.id,
        challenge_id: challengeId,
        progress_days: 0,
        completed: false,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["challenge_progress"] });
    },
  });

  // Auto-join league challenges
  const userLeagueIds = userLeaguesQuery.data ?? [];
  const challenges = challengesQuery.data ?? [];
  const progress = progressQuery.data ?? [];

  const withProgress: ChallengeWithProgress[] = challenges.map((c) => ({
    ...c,
    progress: progress.find((p) => p.challenge_id === c.id),
  }));

  const personal = withProgress.filter((c) => c.type === "personal");
  // Only show league challenges that belong to user's leagues
  const league = withProgress.filter(
    (c) => c.type === "league" && c.league_id && userLeagueIds.includes(c.league_id)
  );
  const event = withProgress.filter((c) => c.type === "event");

  // Auto-join league challenges the user hasn't joined yet
  const leagueNotJoined = league.filter((c) => !c.progress);
  if (leagueNotJoined.length > 0 && !joinChallenge.isPending) {
    // Auto-join first unjoinned one at a time
    const first = leagueNotJoined[0];
    if (first) {
      joinChallenge.mutate(first.id);
    }
  }

  return {
    personal,
    league,
    event,
    userLeagueIds,
    loading: challengesQuery.isLoading || progressQuery.isLoading || userLeaguesQuery.isLoading,
    joinChallenge,
  };
}

export function useLeagueChallengeRanking(challengeId: string | null) {
  return useQuery({
    queryKey: ["league_challenge_ranking", challengeId],
    enabled: !!challengeId,
    queryFn: async () => {
      if (!challengeId) return [];
      const { data, error } = await supabase
        .from("challenge_progress")
        .select("user_id, progress_days")
        .eq("challenge_id", challengeId)
        .order("progress_days", { ascending: false });
      if (error) throw error;

      const userIds = data.map((d) => d.user_id);
      if (userIds.length === 0) return [];
      
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, name")
        .in("user_id", userIds);

      const profileMap = new Map(
        (profiles ?? []).map((p) => [p.user_id, p.name])
      );

      return data.map((d) => ({
        userId: d.user_id,
        name: profileMap.get(d.user_id) || "Jogador",
        progressDays: d.progress_days,
      })) as LeagueChallengeRanking[];
    },
  });
}
