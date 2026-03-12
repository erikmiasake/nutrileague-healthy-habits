
-- Leagues table
CREATE TABLE public.leagues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  invite_code TEXT NOT NULL UNIQUE DEFAULT substr(md5(gen_random_uuid()::text), 1, 8),
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;

-- League members table
CREATE TABLE public.league_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id UUID REFERENCES public.leagues(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(league_id, user_id)
);

ALTER TABLE public.league_members ENABLE ROW LEVEL SECURITY;

-- Leagues: members can view their leagues
CREATE POLICY "Members can view leagues" ON public.leagues
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.league_members
      WHERE league_members.league_id = leagues.id
        AND league_members.user_id = auth.uid()
    )
  );

-- Anyone authenticated can view a league to join by code
CREATE POLICY "Anyone can view league by code" ON public.leagues
  FOR SELECT TO authenticated
  USING (true);

-- Authenticated users can create leagues
CREATE POLICY "Users can create leagues" ON public.leagues
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- League members: users see members of their leagues
CREATE POLICY "Members can view league members" ON public.league_members
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.league_members lm
      WHERE lm.league_id = league_members.league_id
        AND lm.user_id = auth.uid()
    )
  );

-- Users can join leagues
CREATE POLICY "Users can join leagues" ON public.league_members
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can leave leagues
CREATE POLICY "Users can leave leagues" ON public.league_members
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
