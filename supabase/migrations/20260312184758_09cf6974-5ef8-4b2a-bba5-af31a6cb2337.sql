
-- Challenge type enum
CREATE TYPE public.challenge_type AS ENUM ('personal', 'league', 'event');

-- Challenges table
CREATE TABLE public.challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type challenge_type NOT NULL,
  duration_days INTEGER NOT NULL,
  xp_reward INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  league_id UUID REFERENCES public.leagues(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Challenge progress table
CREATE TABLE public.challenge_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  progress_days INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);

-- Enable RLS
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_progress ENABLE ROW LEVEL SECURITY;

-- Challenges RLS: everyone can read active challenges
CREATE POLICY "Anyone can view active challenges"
  ON public.challenges FOR SELECT TO authenticated
  USING (active = true);

-- Challenge progress RLS
CREATE POLICY "Users can view own progress"
  ON public.challenge_progress FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own progress"
  ON public.challenge_progress FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own progress"
  ON public.challenge_progress FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- League challenge progress visible to league members
CREATE POLICY "League members can view challenge progress"
  ON public.challenge_progress FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.challenges c
      JOIN public.league_members lm1 ON lm1.league_id = c.league_id AND lm1.user_id = auth.uid()
      JOIN public.league_members lm2 ON lm2.league_id = c.league_id AND lm2.user_id = challenge_progress.user_id
      WHERE c.id = challenge_progress.challenge_id AND c.type = 'league'
    )
  );
