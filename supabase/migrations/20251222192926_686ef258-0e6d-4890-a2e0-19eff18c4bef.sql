-- Drop the existing policy and recreate with proper restriction
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Create a proper RLS policy that ONLY allows users to view their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

-- Add explicit INSERT policy for promo_codes to prevent user creation (documentation purpose)
DROP POLICY IF EXISTS "No user inserts on promo codes" ON public.promo_codes;

CREATE POLICY "No user inserts on promo codes"
ON public.promo_codes
FOR INSERT
TO authenticated
WITH CHECK (false);