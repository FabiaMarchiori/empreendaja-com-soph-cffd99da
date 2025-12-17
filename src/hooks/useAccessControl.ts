import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface AccessControlState {
  loading: boolean;
  hasAccess: boolean;
  accessUntil: Date | null;
  accessOrigin: string | null;
  daysRemaining: number | null;
  needsAccess: boolean; // true se user logado mas sem acesso válido
}

export const useAccessControl = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [state, setState] = useState<AccessControlState>({
    loading: true,
    hasAccess: false,
    accessUntil: null,
    accessOrigin: null,
    daysRemaining: null,
    needsAccess: false,
  });

  useEffect(() => {
    const checkAccess = async () => {
      if (authLoading) return;
      
      if (!isAuthenticated || !user) {
        setState({
          loading: false,
          hasAccess: false,
          accessUntil: null,
          accessOrigin: null,
          daysRemaining: null,
          needsAccess: false,
        });
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('access_until, access_origin')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Erro ao verificar acesso:', error);
          setState(prev => ({ ...prev, loading: false }));
          return;
        }

        if (!profile || !profile.access_until) {
          setState({
            loading: false,
            hasAccess: false,
            accessUntil: null,
            accessOrigin: null,
            daysRemaining: null,
            needsAccess: true, // User logado mas nunca resgatou acesso
          });
          return;
        }

        const accessUntil = new Date(profile.access_until);
        const now = new Date();
        const hasAccess = accessUntil > now;
        
        // Calcular dias restantes
        let daysRemaining: number | null = null;
        if (hasAccess) {
          const diffTime = accessUntil.getTime() - now.getTime();
          daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }

        setState({
          loading: false,
          hasAccess,
          accessUntil,
          accessOrigin: profile.access_origin,
          daysRemaining,
          needsAccess: !hasAccess, // Precisa de acesso se não tem acesso válido
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
