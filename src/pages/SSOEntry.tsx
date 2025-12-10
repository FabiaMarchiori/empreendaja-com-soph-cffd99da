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
        // Store validation in sessionStorage for the session
        sessionStorage.setItem('soph_sso_valid', 'true');
        sessionStorage.setItem('soph_sso_user', result.payload?.sub || '');
        // Token válido - redirecionar para o chat
        navigate('/chat', { replace: true });
      } else {
        setStatus('error');
        setErrorMessage(result.error || 'Acesso não autorizado');
      }
    });
  }, [searchParams, navigate]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0B1E]">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-white text-lg">Validando acesso...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0B1E] p-4">
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 max-w-md text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Acesso não autorizado</h1>
        <p className="text-gray-400 mb-6">{errorMessage}</p>
        <Button onClick={() => navigate('/auth')} className="w-full">
          Fazer login manualmente
        </Button>
      </div>
    </div>
  );
}
