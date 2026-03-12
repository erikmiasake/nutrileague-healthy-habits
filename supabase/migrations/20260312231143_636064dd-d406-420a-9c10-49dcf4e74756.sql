ALTER TABLE public.meal_logs 
  ADD COLUMN calories integer,
  ADD COLUMN protein numeric(6,1),
  ADD COLUMN carbs numeric(6,1),
  ADD COLUMN fat numeric(6,1),
  ADD COLUMN detected_foods text[];