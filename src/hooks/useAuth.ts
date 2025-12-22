import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { validateSophToken } from "@/lib/validateSophToken";

interface AuthState {
  user: User | null;
  ssoUser: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  displayName: string;
}

export function useAuth(redirectOnUnauthenticated: boolean = true): AuthState {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [ssoUser, setSsoUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateSSO = async () => {
      // Check for SSO token and validate it server-side
      const ssoToken = sessionStorage.getItem('soph_sso_token');
      
      if (ssoToken) {
        console.log('[useAuth] SSO token found, validating server-side...');
        try {
          const result = await validateSophToken(ssoToken);
          
          if (result.valid && result.payload?.sub) {
            console.log('[useAuth] SSO token válido:', result.payload.sub);
            setSsoUser(result.payload.sub);
            setLoading(false);
            return true; // SSO valid
          } else {
            console.warn('[useAuth] SSO token inválido, limpando sessão');
            // Clear invalid tokens
            sessionStorage.removeItem('soph_sso_token');
            sessionStorage.removeItem('soph_sso_valid');
            sessionStorage.removeItem('soph_sso_user');
          }
        } catch (err) {
          console.error('[useAuth] Erro ao validar SSO token:', err);
          // Clear tokens on error
          sessionStorage.removeItem('soph_sso_token');
          sessionStorage.removeItem('soph_sso_valid');
          sessionStorage.removeItem('soph_sso_user');
        }
      }
      
      return false; // No valid SSO
    };

    const checkAuth = async () => {
      // First, try SSO validation
      const ssoValid = await validateSSO();
      if (ssoValid) return;

      // Fallback to Supabase authentication
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        console.log('[useAuth] Auth state changed:', _event, session?.user?.email);
        setUser(session?.user ?? null);
        setLoading(false);
        
        if (!session && redirectOnUnauthenticated) {
          navigate("/auth");
        }
      });

      supabase.auth.getSession().then(({ data: { session } }) => {
        console.log('[useAuth] Session check:', session?.user?.email);
        setUser(session?.user ?? null);
        setLoading(false);
        
        if (!session && redirectOnUnauthenticated) {
          navigate("/auth");
        }
      });

      return () => subscription.unsubscribe();
    };

    checkAuth();
  }, [navigate, redirectOnUnauthenticated]);

  const isAuthenticated = !!user || !!ssoUser;
  const displayName = user?.email || ssoUser || 'Usuário';

  return { user, ssoUser, isAuthenticated, loading, displayName };
}
