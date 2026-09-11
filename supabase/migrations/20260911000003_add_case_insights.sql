-- ==============================================================================
-- ADD CASE INSIGHTS CACHE COLUMN
-- Adds latest_ai_insights column to cases table to efficiently store GenAI output
-- ==============================================================================

ALTER TABLE public.cases
ADD COLUMN latest_ai_insights jsonb,
ADD COLUMN insights_updated_at timestamptz;
