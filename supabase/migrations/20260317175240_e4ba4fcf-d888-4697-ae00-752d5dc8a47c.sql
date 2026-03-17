
ALTER TABLE public.meal_logs
ADD COLUMN IF NOT EXISTS meal_score integer NULL,
ADD COLUMN IF NOT EXISTS meal_classification text NULL,
ADD COLUMN IF NOT EXISTS meal_xp integer NULL,
ADD COLUMN IF NOT EXISTS has_protein boolean NULL,
ADD COLUMN IF NOT EXISTS has_vegetables boolean NULL,
ADD COLUMN IF NOT EXISTS processing_level text NULL,
ADD COLUMN IF NOT EXISTS junk_level text NULL;
