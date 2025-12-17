import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAccessControl } from '@/hooks/useAccessControl';

interface AccessGateProps {
  children: ReactNode;
}

export const AccessGate = ({ children }: AccessGateProps) => {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth(true);
  const { loading: accessLoading, hasAccess, needsAccess } = useAccessControl();

  useEffect(() => {
    if (authLoading || accessLoading) return;

    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

    if (needsAccess || !hasAccess) {
      navigate('/sem-acesso');
    }
  }, [authLoading, accessLoading, isAuthenticated, hasAccess, needsAccess, navigate]);

  // Loading state
  if (authLoading || accessLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  // Not authenticated - will redirect
  if (!isAuthenticated) {
    return null;
  }

  // No access - will redirect
  if (needsAccess || !hasAccess) {
    return null;
  }

  // Has access - render children
  return <>{children}</>;
};
