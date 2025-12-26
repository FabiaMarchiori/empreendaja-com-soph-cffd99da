-- Adicionar coluna has_access na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN has_access boolean NOT NULL DEFAULT false;

-- Migrar dados existentes: se access_until > now(), então has_access = true
UPDATE public.profiles 
SET has_access = true 
WHERE access_until IS NOT NULL AND access_until > now();

-- Remover política antiga de protected_tools
DROP POLICY IF EXISTS "Active users can read protected tools" ON public.protected_tools;

-- Criar nova política baseada em has_access
CREATE POLICY "Active users can read protected tools" 
ON public.protected_tools 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() AND p.has_access = true
  )
);