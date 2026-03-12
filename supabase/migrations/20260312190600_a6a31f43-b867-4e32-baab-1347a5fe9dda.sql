-- Allow users to create personal challenges
CREATE POLICY "Users can create personal challenges"
ON public.challenges
FOR INSERT
TO authenticated
WITH CHECK (type = 'personal' AND league_id IS NULL);

-- Allow users to create event challenges
CREATE POLICY "Users can create event challenges"
ON public.challenges
FOR INSERT
TO authenticated
WITH CHECK (type = 'event' AND league_id IS NULL);