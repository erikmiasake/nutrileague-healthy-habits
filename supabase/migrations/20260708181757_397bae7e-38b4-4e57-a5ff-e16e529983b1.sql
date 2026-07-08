
-- Difficulty enum
DO $$ BEGIN
  CREATE TYPE public.challenge_difficulty AS ENUM ('easy','medium','hard');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Extend challenges
ALTER TABLE public.challenges
  ADD COLUMN IF NOT EXISTS difficulty public.challenge_difficulty,
  ADD COLUMN IF NOT EXISTS points_reward integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS ends_at timestamptz;

-- Extend challenge_progress
ALTER TABLE public.challenge_progress
  ADD COLUMN IF NOT EXISTS points_awarded integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS completed_at timestamptz;

-- Create a league challenge (admin/creator only, enforces limits)
CREATE OR REPLACE FUNCTION public.create_league_challenge(
  _league_id uuid,
  _title text,
  _description text,
  _duration_days integer,
  _difficulty public.challenge_difficulty
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _creator uuid;
  _active_count int;
  _last_created timestamptz;
  _points int;
  _new_id uuid;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Não autenticado' USING ERRCODE = '42501';
  END IF;

  SELECT created_by INTO _creator FROM public.leagues WHERE id = _league_id;
  IF _creator IS NULL THEN
    RAISE EXCEPTION 'Liga não encontrada' USING ERRCODE = 'P0002';
  END IF;
  IF _creator <> _uid THEN
    RAISE EXCEPTION 'Apenas o criador da liga pode criar desafios' USING ERRCODE = '42501';
  END IF;

  IF _duration_days NOT IN (3,5,7) THEN
    RAISE EXCEPTION 'Prazo inválido' USING ERRCODE = '22023';
  END IF;

  _points := CASE _difficulty
    WHEN 'easy' THEN 50
    WHEN 'medium' THEN 100
    WHEN 'hard' THEN 200
  END;

  -- Active limit
  SELECT count(*) INTO _active_count
  FROM public.challenges
  WHERE league_id = _league_id
    AND type = 'league'
    AND active = true
    AND (ends_at IS NULL OR ends_at > now());
  IF _active_count >= 2 THEN
    RAISE EXCEPTION 'Limite de 2 desafios ativos atingido' USING ERRCODE = 'P0001';
  END IF;

  -- Cooldown
  SELECT max(created_at) INTO _last_created
  FROM public.challenges
  WHERE league_id = _league_id AND type = 'league';
  IF _last_created IS NOT NULL AND _last_created > now() - interval '3 days' THEN
    RAISE EXCEPTION 'Aguarde 3 dias entre criações de desafio' USING ERRCODE = 'P0001';
  END IF;

  INSERT INTO public.challenges (title, description, type, duration_days, xp_reward, active, league_id, difficulty, points_reward, created_by, ends_at)
  VALUES (_title, _description, 'league', _duration_days, 0, true, _league_id, _difficulty, _points, _uid, now() + make_interval(days => _duration_days))
  RETURNING id INTO _new_id;

  RETURN _new_id;
END;
$$;

-- Join a league challenge
CREATE OR REPLACE FUNCTION public.join_league_challenge(_challenge_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _league uuid;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Não autenticado' USING ERRCODE = '42501';
  END IF;
  SELECT league_id INTO _league FROM public.challenges WHERE id = _challenge_id AND type = 'league';
  IF _league IS NULL THEN
    RAISE EXCEPTION 'Desafio não encontrado' USING ERRCODE = 'P0002';
  END IF;
  IF NOT public.is_league_member(_uid, _league) THEN
    RAISE EXCEPTION 'Você não é membro dessa liga' USING ERRCODE = '42501';
  END IF;
  INSERT INTO public.challenge_progress (user_id, challenge_id, progress_days, completed)
  VALUES (_uid, _challenge_id, 0, false)
  ON CONFLICT (user_id, challenge_id) DO NOTHING;
END;
$$;

-- Complete a league challenge (self-declared)
CREATE OR REPLACE FUNCTION public.complete_league_challenge(_challenge_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _pts int;
  _ends timestamptz;
  _already boolean;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Não autenticado' USING ERRCODE = '42501';
  END IF;
  SELECT points_reward, ends_at INTO _pts, _ends
  FROM public.challenges WHERE id = _challenge_id AND type = 'league';
  IF _pts IS NULL THEN
    RAISE EXCEPTION 'Desafio não encontrado' USING ERRCODE = 'P0002';
  END IF;
  IF _ends IS NOT NULL AND _ends < now() THEN
    RAISE EXCEPTION 'Prazo expirado' USING ERRCODE = 'P0001';
  END IF;

  -- Ensure participation exists
  INSERT INTO public.challenge_progress (user_id, challenge_id, progress_days, completed)
  VALUES (_uid, _challenge_id, 0, false)
  ON CONFLICT (user_id, challenge_id) DO NOTHING;

  SELECT completed INTO _already
  FROM public.challenge_progress
  WHERE user_id = _uid AND challenge_id = _challenge_id;

  IF _already THEN
    RETURN;
  END IF;

  UPDATE public.challenge_progress
  SET completed = true,
      completed_at = now(),
      points_awarded = _pts,
      updated_at = now()
  WHERE user_id = _uid AND challenge_id = _challenge_id;
END;
$$;

-- Scoreboard: sum points per member per league
CREATE OR REPLACE FUNCTION public.league_challenge_scoreboard(_league_id uuid)
RETURNS TABLE(user_id uuid, total_points integer, completed_count integer)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT lm.user_id,
         COALESCE(SUM(cp.points_awarded), 0)::int AS total_points,
         COALESCE(SUM(CASE WHEN cp.completed THEN 1 ELSE 0 END), 0)::int AS completed_count
  FROM public.league_members lm
  LEFT JOIN public.challenge_progress cp
    ON cp.user_id = lm.user_id
   AND cp.challenge_id IN (
     SELECT id FROM public.challenges WHERE league_id = _league_id AND type = 'league'
   )
  WHERE lm.league_id = _league_id
    AND public.is_league_member(auth.uid(), _league_id)
  GROUP BY lm.user_id;
$$;

GRANT EXECUTE ON FUNCTION public.create_league_challenge(uuid,text,text,integer,public.challenge_difficulty) TO authenticated;
GRANT EXECUTE ON FUNCTION public.join_league_challenge(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.complete_league_challenge(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.league_challenge_scoreboard(uuid) TO authenticated;
