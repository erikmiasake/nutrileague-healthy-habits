import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DashboardData {
  currentStreak: number;
  longestStreak: number;
  totalMeals: number;
  weeklyMeals: number;
  weekActivity: boolean[];
  userName: string;
  loading: boolean;
}

export function useDashboardData(): DashboardData {
  const [data, setData] = useState<DashboardData>({
    currentStreak: 0,
    longestStreak: 0,
    totalMeals: 0,
    weeklyMeals: 0,
    weekActivity: [false, false, false, false, false, false, false],
    userName: "",
    loading: true,
  });

  useEffect(() => {
    const fetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setData(prev => ({ ...prev, loading: false }));
        return;
      }

      // Fetch streak
      const { data: streak } = await supabase
        .from("streaks")
        .select("current_streak, longest_streak")
        .eq("user_id", user.id)
        .maybeSingle();

      // Fetch profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("name")
        .eq("user_id", user.id)
        .maybeSingle();

      // Fetch total meals
      const { count: totalMeals } = await supabase
        .from("meal_logs")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      // Fetch weekly meals (last 7 days)
      const today = new Date();
      const weekAgo = new Date(today);
      weekAgo.setDate(today.getDate() - 6);
      const weekAgoStr = weekAgo.toISOString().split("T")[0];

      const { data: weekMeals } = await supabase
        .from("meal_logs")
        .select("date")
        .eq("user_id", user.id)
        .gte("date", weekAgoStr);

      // Build week activity array (Mon-Sun)
      const weekActivity = [false, false, false, false, false, false, false];
      const mealDates = new Set((weekMeals || []).map(m => m.date));

      for (let i = 0; i < 7; i++) {
        const d = new Date(weekAgo);
        d.setDate(weekAgo.getDate() + i);
        const dayOfWeek = d.getDay(); // 0=Sun
        const idx = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Mon=0, Sun=6
        const dateStr = d.toISOString().split("T")[0];
        if (mealDates.has(dateStr)) {
          weekActivity[idx] = true;
        }
      }

      setData({
        currentStreak: streak?.current_streak ?? 0,
        longestStreak: streak?.longest_streak ?? 0,
        totalMeals: totalMeals ?? 0,
        weeklyMeals: weekMeals?.length ?? 0,
        weekActivity,
        userName: profile?.name || user.email?.split("@")[0] || "Usuário",
        loading: false,
      });
    };

    fetch();
  }, []);

  return data;
}
