import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { validateSophToken } from "@/lib/validateSophToken";

// SSO validation window: 5 minutes (matches token expiry)
const SSO_VALIDATION_MAX_AGE_MS = 5 * 60 * 1000;

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
      const validatedAt = sessionStorage.getItem('soph_sso_validated_at');
      
      if (ssoToken) {
        // Check if validation is stale (older than 5 minutes)
        if (validatedAt) {
          const elapsed = Date.now() - parseInt(validatedAt, 10);
          if (elapsed > SSO_VALIDATION_MAX_AGE_MS) {
            // Token expired, clear and re-validate
            sessionStorage.removeItem('soph_sso_token');
            sessionStorage.removeItem('soph_sso_valid');
            sessionStorage.removeItem('soph_sso_user');
            sessionStorage.removeItem('soph_sso_validated_at');
            return false;
          }
        }
        
        try {
          const result = await validateSophToken(ssoToken);
          
          if (result.valid && result.payload?.sub) {
            // Update validation timestamp
            sessionStorage.setItem('soph_sso_validated_at', Date.now().toString());
            setSsoUser(result.payload.sub);
            setLoading(false);
            return true; // SSO valid
          } else {
            // Clear invalid tokens
            sessionStorage.removeItem('soph_sso_token');
            sessionStorage.removeItem('soph_sso_valid');
            sessionStorage.removeItem('soph_sso_user');
            sessionStorage.removeItem('soph_sso_validated_at');
          }
        } catch {
          // Clear tokens on error
          sessionStorage.removeItem('soph_sso_token');
          sessionStorage.removeItem('soph_sso_valid');
          sessionStorage.removeItem('soph_sso_user');
          sessionStorage.removeItem('soph_sso_validated_at');
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
        setUser(session?.user ?? null);
        setLoading(false);
        
        if (!session && redirectOnUnauthenticated) {
          navigate("/auth");
        }
      });

      supabase.auth.getSession().then(({ data: { session } }) => {
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
