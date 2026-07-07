
-- 1. Fix leagues SELECT policies
DROP POLICY IF EXISTS "Members can view leagues" ON public.leagues;
DROP POLICY IF EXISTS "Anyone can view league by code" ON public.leagues;

CREATE POLICY "Members can view their leagues"
ON public.leagues FOR SELECT
TO authenticated
USING (public.is_league_member(auth.uid(), id));

-- 2. Add UPDATE/DELETE policies for creators
CREATE POLICY "Creators can update their leagues"
ON public.leagues FOR UPDATE
TO authenticated
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can delete their leagues"
ON public.leagues FOR DELETE
TO authenticated
USING (auth.uid() = created_by);

-- 3. Secure RPC for joining by invite code (does not expose invite_code/other rows)
CREATE OR REPLACE FUNCTION public.join_league_by_code(_code text)
RETURNS TABLE(league_id uuid, league_name text, already_member boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _league public.leagues%ROWTYPE;
  _existed boolean := false;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO _league
  FROM public.leagues
  WHERE lower(invite_code) = lower(trim(_code))
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid invite code' USING ERRCODE = 'P0002';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.league_members
    WHERE league_id = _league.id AND user_id = _uid
  ) THEN
    _existed := true;
  ELSE
    INSERT INTO public.league_members (league_id, user_id)
    VALUES (_league.id, _uid);
  END IF;

  RETURN QUERY SELECT _league.id, _league.name, _existed;
END;
$$;

REVOKE ALL ON FUNCTION public.join_league_by_code(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.join_league_by_code(text) TO authenticated;

-- 4. Set search_path on functions that were missing it
ALTER FUNCTION public.enqueue_email(text, jsonb) SET search_path = public, pgmq;
ALTER FUNCTION public.read_email_batch(text, integer, integer) SET search_path = public, pgmq;
ALTER FUNCTION public.delete_email(text, bigint) SET search_path = public, pgmq;
ALTER FUNCTION public.move_to_dlq(text, text, bigint, jsonb) SET search_path = public, pgmq;

-- 5. Revoke EXECUTE on internal/trigger/definer functions from public roles
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_streak_on_meal() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.email_queue_dispatch() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.email_queue_wake() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.enqueue_email(text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.delete_email(text, bigint) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM PUBLIC, anon, authenticated;

-- is_league_member is used by RLS; keep it callable by authenticated but revoke anon
REVOKE ALL ON FUNCTION public.is_league_member(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_league_member(uuid, uuid) TO authenticated;
