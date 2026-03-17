CREATE POLICY "League members can view member meals"
ON public.meal_logs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM league_members lm1
    JOIN league_members lm2 ON lm1.league_id = lm2.league_id
    WHERE lm1.user_id = auth.uid()
      AND lm2.user_id = meal_logs.user_id
  )
);