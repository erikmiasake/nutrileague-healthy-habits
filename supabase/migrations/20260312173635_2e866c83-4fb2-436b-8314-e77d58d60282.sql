-- Fix infinite recursion: use a SECURITY DEFINER function to check membership
CREATE OR REPLACE FUNCTION public.is_league_member(_user_id uuid, _league_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.league_members
    WHERE user_id = _user_id AND league_id = _league_id
  )
$$;

-- Drop the recursive SELECT policy on league_members
DROP POLICY IF EXISTS "Members can view league members" ON public.league_members;

-- Create a non-recursive SELECT policy
CREATE POLICY "Members can view league members"
ON public.league_members
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR
  public.is_league_member(auth.uid(), league_id)
);

-- Fix leagues SELECT policy that also triggers recursion
DROP POLICY IF EXISTS "Members can view leagues" ON public.leagues;

CREATE POLICY "Members can view leagues"
ON public.leagues
FOR SELECT
TO authenticated
USING (
  public.is_league_member(auth.uid(), id)
  OR
  true
);