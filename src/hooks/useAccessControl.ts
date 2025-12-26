import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface AccessControlState {
  loading: boolean;
  hasAccess: boolean;
  accessOrigin: string | null;
  needsAccess: boolean; // true se user logado mas sem acesso válido
}

export const useAccessControl = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth(false);
  const [state, setState] = useState<AccessControlState>({
    loading: true,
    hasAccess: false,
    accessOrigin: null,
    needsAccess: false,
  });

  useEffect(() => {
    const checkAccess = async () => {
      if (authLoading) return;
      
      if (!isAuthenticated || !user) {
        setState({
          loading: false,
          hasAccess: false,
          accessOrigin: null,
          needsAccess: false,
        });
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('has_access, access_origin')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Erro ao verificar acesso:', error);
          setState(prev => ({ ...prev, loading: false }));
          return;
        }

        const hasAccess = profile?.has_access === true;

        setState({
          loading: false,
          hasAccess,
          accessOrigin: profile?.access_origin ?? null,
          needsAccess: !hasAccess, // Precisa de acesso se has_access não é true
        });
      } catch (error) {
        console.error('Erro ao verificar acesso:', error);
        setState(prev => ({ ...prev, loading: false }));
      }
    };

    checkAccess();
  }, [user, isAuthenticated, authLoading]);

  return state;
};
