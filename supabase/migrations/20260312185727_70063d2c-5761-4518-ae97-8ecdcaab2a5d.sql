-- Allow league members to create league challenges for their own league
CREATE POLICY "League members can create league challenges"
ON public.challenges
FOR INSERT
TO authenticated
WITH CHECK (
  type = 'league'
  AND league_id IS NOT NULL
  AND public.is_league_member(auth.uid(), league_id)
);