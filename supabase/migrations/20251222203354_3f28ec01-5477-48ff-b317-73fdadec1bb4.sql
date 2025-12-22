-- Tighten promo_codes visibility to prevent theft of unused codes
-- Old policy allowed viewing rows where email IS NULL (unused codes), enabling theft.
DROP POLICY IF EXISTS "Users can only see their own promo codes" ON public.promo_codes;

CREATE POLICY "Users can view promo codes they redeemed"
ON public.promo_codes
FOR SELECT
TO authenticated
USING (used_by = auth.uid());