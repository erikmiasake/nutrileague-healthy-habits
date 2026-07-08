
ALTER TABLE public.leagues ADD COLUMN IF NOT EXISTS cover_photo_path TEXT;

-- Storage policies on league-covers bucket
-- Path convention: {league_id}/cover.<ext>

CREATE POLICY "League members can view covers"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'league-covers'
  AND EXISTS (
    SELECT 1 FROM public.league_members lm
    WHERE lm.user_id = auth.uid()
      AND lm.league_id::text = split_part(name, '/', 1)
  )
);

CREATE POLICY "League creators can insert covers"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'league-covers'
  AND EXISTS (
    SELECT 1 FROM public.leagues l
    WHERE l.created_by = auth.uid()
      AND l.id::text = split_part(name, '/', 1)
  )
);

CREATE POLICY "League creators can update covers"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'league-covers'
  AND EXISTS (
    SELECT 1 FROM public.leagues l
    WHERE l.created_by = auth.uid()
      AND l.id::text = split_part(name, '/', 1)
  )
);

CREATE POLICY "League creators can delete covers"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'league-covers'
  AND EXISTS (
    SELECT 1 FROM public.leagues l
    WHERE l.created_by = auth.uid()
      AND l.id::text = split_part(name, '/', 1)
  )
);
