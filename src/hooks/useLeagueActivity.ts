import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ActivityItem {
  id: string;
  userName: string;
  avatarUrl: string | null;
  type: "meal" | "streak";
  detail: string;
  timeAgo: string;
}

function formatTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "agora";
  if (diffMin < 60) return `${diffMin}min atrás`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h atrás`;
  const diffD = Math.floor(diffH / 24);
  return `${diffD}d atrás`;
}

export function useLeagueActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: membership } = await supabase
        .from("league_members").select("league_id").eq("user_id", user.id).limit(1).maybeSingle();

      if (!membership) { setLoading(false); return; }

      const { data: members } = await supabase
        .from("league_members").select("user_id").eq("league_id", membership.league_id);

      if (!members || members.length === 0) { setLoading(false); return; }

      const memberIds = members.map(m => m.user_id);

      const { data: profiles } = await supabase
        .from("profiles").select("user_id, name, avatar_url").in("user_id", memberIds);

      const profileMap = new Map((profiles || []).map(p => [p.user_id, p]));

      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const { data: recentMeals } = await supabase
        .from("meal_logs").select("id, user_id, created_at")
        .in("user_id", memberIds).gte("created_at", threeDaysAgo.toISOString())
        .order("created_at", { ascending: false }).limit(10);

      const { data: streaks } = await supabase
        .from("streaks").select("user_id, current_streak").in("user_id", memberIds);

      const items: ActivityItem[] = [];

      (recentMeals || []).forEach(meal => {
        const p = profileMap.get(meal.user_id);
        const firstName = (p?.name || "Jogador").split(" ")[0];
        items.push({
          id: meal.id,
          userName: firstName,
          avatarUrl: p?.avatar_url || null,
          type: "meal",
          detail: `${firstName} registrou refeição`,
          timeAgo: formatTimeAgo(meal.created_at),
        });
      });

      (streaks || []).forEach(s => {
        if (s.current_streak >= 3) {
          const p = profileMap.get(s.user_id);
          const firstName = (p?.name || "Jogador").split(" ")[0];
          items.push({
            id: `streak-${s.user_id}`,
            userName: firstName,
            avatarUrl: p?.avatar_url || null,
            type: "streak",
            detail: `${firstName} mantém streak de ${s.current_streak} dias`,
            timeAgo: "",
          });
        }
      });

      setActivities(items.slice(0, 8));
      setLoading(false);
    };

    fetch();
  }, []);

  return { activities, loading };
}
