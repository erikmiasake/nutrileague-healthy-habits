import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DashboardData {
  currentStreak: number;
  longestStreak: number;
  totalMeals: number;
  todayMeals: number;
  weeklyMeals: number;
  weekActivity: boolean[];
  userName: string;
  loggedToday: boolean;
  loading: boolean;
}

export function useDashboardData(): DashboardData {
  const [data, setData] = useState<DashboardData>({
    currentStreak: 0,
    longestStreak: 0,
    totalMeals: 0,
    todayMeals: 0,
    weeklyMeals: 0,
    weekActivity: [false, false, false, false, false, false, false],
    userName: "",
    loggedToday: false,
    loading: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setData(prev => ({ ...prev, loading: false }));
        return;
      }

      const today = new Date().toISOString().split("T")[0];

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

      // Check if logged today
      const { count: todayCount } = await supabase
        .from("meal_logs")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("date", today);

      // Fetch weekly meals (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 6);
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
        const dayOfWeek = d.getDay();
        const idx = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
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
        loggedToday: (todayCount ?? 0) > 0,
        loading: false,
      });
    };

    fetchData();
  }, []);

  return data;
}
