-- Remover política vulnerável existente
DROP POLICY IF EXISTS "Users can check available codes" ON promo_codes;

-- Criar política restritiva: usuários só podem ver códigos atribuídos ao seu próprio email
-- ou códigos sem email específico (genéricos)
CREATE POLICY "Users can only see their own promo codes"
ON promo_codes
FOR SELECT
TO authenticated
USING (
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
  OR email IS NULL
);

-- Impedir que usuários modifiquem códigos diretamente
CREATE POLICY "No user updates on promo codes"
ON promo_codes
FOR UPDATE
TO authenticated
USING (false);

-- Impedir que usuários deletem códigos
CREATE POLICY "No user deletes on promo codes"
ON promo_codes
FOR DELETE
TO authenticated
USING (false);