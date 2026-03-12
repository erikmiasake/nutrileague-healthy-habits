
-- Allow league members to view each other's streaks
CREATE POLICY "League members can view streaks"
ON public.streaks
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.league_members lm1
    JOIN public.league_members lm2 ON lm1.league_id = lm2.league_id
    WHERE lm1.user_id = auth.uid() AND lm2.user_id = streaks.user_id
  )
);

-- Allow league members to view each other's profiles
CREATE POLICY "League members can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.league_members lm1
    JOIN public.league_members lm2 ON lm1.league_id = lm2.league_id
    WHERE lm1.user_id = auth.uid() AND lm2.user_id = profiles.user_id
  )
);
