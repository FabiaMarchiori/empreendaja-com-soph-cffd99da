import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, ExternalLink } from "lucide-react";
import { AccessGate } from "@/components/AccessGate";

// Token é gerado pela Edge Function e enviado como query param

const PricingRedirectContent = () => {
  const navigate = useNavigate();
  const [destination, setDestination] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateTokenAndRedirect = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        // Se não há sessão ou erro de sessão, redirecionar para login com returnTo
        if (!session || sessionError) {
          navigate("/auth", { state: { returnTo: "/pricing" } });
          return;
        }

        // Chamar nova Edge Function que gera token JWT para o App de Precificação
        const { data, error: fnError } = await supabase.functions.invoke('generate-pricing-token', {
          headers: { Authorization: `Bearer ${session.access_token}` }
        });

        if (fnError || !data?.redirectUrl) {
          console.error("Error generating pricing token:", fnError);
          // Se erro relacionado a sessão, redirecionar para login
          if (fnError?.message?.includes('session') || fnError?.message?.includes('auth') || fnError?.message?.includes('Sessão')) {
            navigate("/auth", { state: { returnTo: "/pricing" } });
            return;
          }
          // Se erro de acesso não autorizado
          if (fnError?.message?.includes('Acesso não autorizado')) {
            setError("Você não tem acesso à ferramenta de Precificação Inteligente");
            return;
          }
          setError("Não foi possível carregar a ferramenta");
          return;
        }

        setDestination(data.redirectUrl);
        
        // Redirecionar navegador para App de Precificação com token JWT
        window.location.replace(data.redirectUrl);
      } catch (err: any) {
        console.error("Error:", err);
        // Tratar erro de sessão como necessidade de login
        if (err?.message?.includes('session') || err?.name === 'AuthSessionMissingError') {
          navigate("/auth", { state: { returnTo: "/pricing" } });
          return;
        }
        setError("Erro ao carregar a ferramenta");
      }
    };

    generateTokenAndRedirect();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#071E2D] via-[#0B2A3C] to-[#0E3447] p-4">
        <div className="glass-strong rounded-2xl p-8 text-center max-w-md border border-[#00E5FF]/20 shadow-[0_0_30px_rgba(0,229,255,0.1)]">
          <p className="text-white mb-6">{error}</p>
          <Button
            onClick={() => navigate("/")}
            className="bg-gradient-to-r from-[#00C2D1] to-[#00E5FF] text-white hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all"
          >
            Voltar ao Início
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#071E2D] via-[#0B2A3C] to-[#0E3447] p-4">
      <div className="glass-strong rounded-2xl p-8 text-center max-w-md space-y-6 border border-[#00E5FF]/20 shadow-[0_0_30px_rgba(0,229,255,0.1)]">
        <Loader2 className="w-12 h-12 text-[#00E5FF] animate-spin mx-auto" />
        <p className="text-white/80">Redirecionando para Precificação Inteligente...</p>
        
        {destination && (
          <Button
            onClick={() => window.location.replace(destination)}
            className="bg-gradient-to-r from-[#00C2D1] to-[#00E5FF] text-white hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Abrir Precificação
          </Button>
        )}
      </div>
    </div>
  );
};

const PricingRedirect = () => {
  return (
    <AccessGate>
      <PricingRedirectContent />
    </AccessGate>
  );
};

export default PricingRedirect;
