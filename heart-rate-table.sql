-- Heart Rate table for Apple Health Shortcut sync
-- Copy this file into Supabase SQL Editor and run it once.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.heart_rate_readings (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	bpm INTEGER NOT NULL CHECK (bpm BETWEEN 30 AND 240),
	measured_at TIMESTAMPTZ NOT NULL,
	source TEXT DEFAULT 'apple-health-shortcuts',
	created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_heart_rate_readings_measured_at
	ON public.heart_rate_readings (measured_at DESC);

CREATE INDEX IF NOT EXISTS idx_heart_rate_readings_created_at
	ON public.heart_rate_readings (created_at DESC);

SELECT
	'heart_rate_readings table is ready' AS status,
	COUNT(*) AS record_count
FROM public.heart_rate_readings;

CREATE TABLE IF NOT EXISTS public.sleep_readings (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	duration_minutes INTEGER NOT NULL CHECK (duration_minutes BETWEEN 1 AND 1440),
	start_at TIMESTAMPTZ,
	end_at TIMESTAMPTZ,
	measured_at TIMESTAMPTZ NOT NULL,
	source TEXT DEFAULT 'apple-health-shortcuts',
	created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sleep_readings_measured_at
	ON public.sleep_readings (measured_at DESC);

CREATE INDEX IF NOT EXISTS idx_sleep_readings_created_at
	ON public.sleep_readings (created_at DESC);

SELECT
	'sleep_readings table is ready' AS status,
	COUNT(*) AS record_count
FROM public.sleep_readings;

