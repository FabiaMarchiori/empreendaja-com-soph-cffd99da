import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

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
    // Check SSO first (sessionStorage)
    const ssoValid = sessionStorage.getItem('soph_sso_valid');
    const ssoUserData = sessionStorage.getItem('soph_sso_user');
    
    if (ssoValid === 'true' && ssoUserData) {
      console.log('[useAuth] SSO válido encontrado:', ssoUserData);
      setSsoUser(ssoUserData);
      setLoading(false);
      return; // SSO valid, no need to check Supabase
    }

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
  }, [navigate, redirectOnUnauthenticated]);

  const isAuthenticated = !!user || !!ssoUser;
  const displayName = user?.email || ssoUser || 'Usuário';

  return { user, ssoUser, isAuthenticated, loading, displayName };
}
