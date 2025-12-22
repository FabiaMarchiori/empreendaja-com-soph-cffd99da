import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { validateSophToken } from "@/lib/validateSophToken";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SSOEntry() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setErrorMessage('Token não fornecido');
      return;
    }

    validateSophToken(token).then((result) => {
      if (result.valid) {
        const userId = result.payload?.sub || 'sso_user';
        
        // Store token for re-validation, plus validation timestamp
        sessionStorage.setItem('soph_sso_token', token);
        sessionStorage.setItem('soph_sso_valid', 'true');
        sessionStorage.setItem('soph_sso_user', userId);
        sessionStorage.setItem('soph_sso_validated_at', Date.now().toString());
        
        // Small delay to ensure sessionStorage is written
        setTimeout(() => {
          navigate('/chat', { replace: true });
        }, 100);
      } else {
        setStatus('error');
        setErrorMessage(result.error || 'Acesso não autorizado');
      }
    }).catch(() => {
      setStatus('error');
      setErrorMessage('Erro ao validar token');
    });
  }, [searchParams, navigate]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-foreground text-lg">Validando acesso...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="glass-strong border border-border/50 rounded-3xl p-8 max-w-md text-center">
        <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Acesso não autorizado</h1>
        <p className="text-muted-foreground mb-6">{errorMessage}</p>
        <Button onClick={() => navigate('/auth')} className="w-full">
          Fazer login manualmente
        </Button>
      </div>
    </div>
  );
}
