-- ==============================================================================
-- ADD VICTIM FOLLOW-UP RLS POLICY
-- Allows victims to read (SELECT) follow-up tasks linked to their own case.
-- Ensures strict row-level isolation so victims cannot see other cases' tasks.
-- ==============================================================================

CREATE POLICY "follow_ups_victim_read" ON public.follow_ups
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.cases
            WHERE cases.id = follow_ups.case_id
            AND cases.victim_id = auth.uid()
        )
    );
