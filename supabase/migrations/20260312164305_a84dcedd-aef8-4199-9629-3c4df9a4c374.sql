
CREATE OR REPLACE FUNCTION public.update_streak_on_meal()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _last_log DATE;
  _current INTEGER;
  _longest INTEGER;
BEGIN
  SELECT last_log_date, current_streak, longest_streak
    INTO _last_log, _current, _longest
    FROM public.streaks
    WHERE user_id = NEW.user_id;

  -- No streak record yet (shouldn't happen due to signup trigger, but safety)
  IF NOT FOUND THEN
    INSERT INTO public.streaks (user_id, current_streak, longest_streak, last_log_date, updated_at)
    VALUES (NEW.user_id, 1, 1, NEW.date, now());
    RETURN NEW;
  END IF;

  -- Already logged today
  IF _last_log = NEW.date THEN
    RETURN NEW;
  END IF;

  -- Consecutive day
  IF _last_log = NEW.date - 1 THEN
    _current := _current + 1;
  ELSE
    _current := 1;
  END IF;

  IF _current > _longest THEN
    _longest := _current;
  END IF;

  UPDATE public.streaks
  SET current_streak = _current,
      longest_streak = _longest,
      last_log_date = NEW.date,
      updated_at = now()
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_meal_log_inserted
  AFTER INSERT ON public.meal_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_streak_on_meal();
