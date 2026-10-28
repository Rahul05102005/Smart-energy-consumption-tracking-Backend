-- Persistent goals and an explainable usage-change baseline. No meter readings are generated.
ALTER TABLE public.appliances
  ADD CONSTRAINT appliances_id_user_id_unique UNIQUE (id, user_id);

CREATE TABLE public.energy_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (length(trim(title)) BETWEEN 3 AND 100),
  description TEXT NOT NULL DEFAULT '',
  challenge_type TEXT NOT NULL CHECK (challenge_type IN ('reduce_energy_percent', 'reduce_appliance_hours')),
  target_value NUMERIC NOT NULL CHECK (target_value > 0),
  baseline_value NUMERIC NOT NULL CHECK (baseline_value >= 0),
  appliance_id UUID,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  CHECK (end_date >= start_date),
  FOREIGN KEY (appliance_id, user_id) REFERENCES public.appliances(id, user_id) ON DELETE CASCADE,
  CHECK (
    (challenge_type = 'reduce_energy_percent' AND target_value <= 100 AND appliance_id IS NULL)
    OR (challenge_type = 'reduce_appliance_hours' AND target_value <= 24 AND appliance_id IS NOT NULL)
  )
);
CREATE INDEX energy_challenges_user_idx ON public.energy_challenges(user_id, start_date DESC);
ALTER TABLE public.energy_challenges ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.energy_challenges TO authenticated;
CREATE POLICY "own energy challenges" ON public.energy_challenges
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.appliance_usage_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  appliance_id UUID NOT NULL REFERENCES public.appliances(id) ON DELETE CASCADE,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  power_rating NUMERIC NOT NULL,
  daily_usage_hours NUMERIC NOT NULL,
  quantity INTEGER NOT NULL,
  usage_mode TEXT NOT NULL DEFAULT 'manual',
  schedule JSONB
);
CREATE INDEX appliance_usage_history_user_idx ON public.appliance_usage_history(user_id, appliance_id, captured_at DESC);
ALTER TABLE public.appliance_usage_history ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.appliance_usage_history TO authenticated;
CREATE POLICY "read own appliance usage history" ON public.appliance_usage_history
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.capture_appliance_usage_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.power_rating IS DISTINCT FROM OLD.power_rating
    OR NEW.daily_usage_hours IS DISTINCT FROM OLD.daily_usage_hours
    OR NEW.quantity IS DISTINCT FROM OLD.quantity
    OR NEW.usage_mode IS DISTINCT FROM OLD.usage_mode
    OR NEW.schedule IS DISTINCT FROM OLD.schedule THEN
    INSERT INTO public.appliance_usage_history (
      user_id, appliance_id, power_rating, daily_usage_hours, quantity, usage_mode, schedule
    ) VALUES (
      OLD.user_id, OLD.id, OLD.power_rating, OLD.daily_usage_hours,
      OLD.quantity, COALESCE(OLD.usage_mode, 'manual'), OLD.schedule
    );
  END IF;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.capture_appliance_usage_change() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER appliance_usage_history_capture
  AFTER UPDATE ON public.appliances
  FOR EACH ROW EXECUTE FUNCTION public.capture_appliance_usage_change();
