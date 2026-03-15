
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS weight numeric NULL,
ADD COLUMN IF NOT EXISTS height numeric NULL,
ADD COLUMN IF NOT EXISTS goal text NULL DEFAULT 'healthy',
ADD COLUMN IF NOT EXISTS notify_meals boolean NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS notify_streak boolean NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS notify_challenges boolean NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS privacy_meals boolean NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS privacy_progress boolean NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS privacy_visible boolean NOT NULL DEFAULT true;
