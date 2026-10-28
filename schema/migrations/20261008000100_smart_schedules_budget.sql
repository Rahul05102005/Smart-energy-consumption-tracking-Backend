-- Extend the existing RLS-protected tables; older appliances remain manual.
ALTER TABLE public.appliances
  ADD COLUMN usage_mode TEXT NOT NULL DEFAULT 'manual'
    CHECK (usage_mode IN ('manual', 'schedule')),
  ADD COLUMN schedule JSONB;

ALTER TABLE public.appliances
  ADD CONSTRAINT appliances_schedule_valid CHECK (
    usage_mode = 'manual' OR (
      schedule IS NOT NULL
      AND jsonb_typeof(schedule) = 'object'
      AND schedule->>'type' IN ('daily', 'weekdays', 'weekends', 'custom')
      AND schedule->>'startTime' ~ '^(?:[01][0-9]|2[0-3]):[0-5][0-9]$'
      AND schedule->>'endTime' ~ '^(?:[01][0-9]|2[0-3]):[0-5][0-9]$'
      AND schedule->>'startTime' <> schedule->>'endTime'
      AND jsonb_typeof(schedule->'days') = 'array'
      AND (schedule->>'type' <> 'custom' OR jsonb_array_length(schedule->'days') > 0)
    )
  );

ALTER TABLE public.user_settings
  ADD COLUMN monthly_budget NUMERIC NOT NULL DEFAULT 0 CHECK (monthly_budget >= 0);
