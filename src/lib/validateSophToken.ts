import { supabase } from "@/integrations/supabase/client";

export interface TokenValidationResult {
  valid: boolean;
  payload?: {
    sub: string;
    exp?: number;
    iat?: number;
    [key: string]: any;
  };
  error?: string;
}

export async function validateSophToken(token: string): Promise<TokenValidationResult> {
  try {
    const { data, error } = await supabase.functions.invoke('validate-soph-token', {
      body: { token }
    });

    if (error) {
      console.error('Token validation error:', error);
      return { valid: false, error: 'Erro ao validar token' };
    }

    return data as TokenValidationResult;
  } catch (err) {
    console.error('Token validation exception:', err);
    return { valid: false, error: 'Erro de conexão' };
  }
}
