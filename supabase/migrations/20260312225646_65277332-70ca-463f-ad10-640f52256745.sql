
ALTER TABLE public.meal_logs ADD COLUMN image_url text;
ALTER TABLE public.meal_logs ADD COLUMN caption text;

INSERT INTO storage.buckets (id, name, public)
VALUES ('meal-images', 'meal-images', true);

CREATE POLICY "Users can upload meal images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'meal-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Public can view meal images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'meal-images');

CREATE POLICY "Users can delete own meal images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'meal-images' AND (storage.foldername(name))[1] = auth.uid()::text);
