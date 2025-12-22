-- Restrict protected_tools visibility to users with active access

-- Ensure Row Level Security is enabled
ALTER TABLE public.protected_tools ENABLE ROW LEVEL SECURITY;

-- Remove overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can read tools" ON public.protected_tools;

-- Only allow users with valid access_until to read protected tool URLs
CREATE POLICY "Active users can read protected tools"
ON public.protected_tools
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.access_until IS NOT NULL
      AND p.access_until > now()
  )
);
