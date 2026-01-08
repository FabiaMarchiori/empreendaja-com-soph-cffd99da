import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, ExternalLink } from "lucide-react";
import { AccessGate } from "@/components/AccessGate";

const DASHBOARD_PATH = "/"; // Ajuste se o dashboard do app de Precificação tiver outro caminho

const PricingRedirectContent = () => {
  const navigate = useNavigate();
  const [destination, setDestination] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAndRedirect = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        // Se não há sessão ou erro de sessão, redirecionar para login com returnTo
        if (!session || sessionError) {
          navigate("/auth", { state: { returnTo: "/pricing" } });
          return;
        }

        const { data, error: fnError } = await supabase.functions.invoke('get-tool-url', {
          body: { slug: 'pricing' }
        });

        if (fnError || !data?.url) {
          console.error("Error fetching tool URL:", fnError);
          // Se erro relacionado a sessão, redirecionar para login
          if (fnError?.message?.includes('session') || fnError?.message?.includes('auth')) {
            navigate("/auth", { state: { returnTo: "/pricing" } });
            return;
          }
          setError("Não foi possível carregar a ferramenta");
          return;
        }

        const finalUrl = data.url + DASHBOARD_PATH;
        setDestination(finalUrl);
        
        // Redirect fora do iframe (top-level)
        window.location.replace(finalUrl);
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

    fetchAndRedirect();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#482A72] via-[#2E1B4D] via-[#062C4F] to-[#043B59] p-4">
        <div className="glass-strong rounded-2xl p-8 text-center max-w-md">
          <p className="text-white mb-6">{error}</p>
          <Button
            onClick={() => navigate("/")}
            className="bg-gradient-to-r from-[#C372FF] to-[#4AAEFF] text-white"
          >
            Voltar ao Início
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#482A72] via-[#2E1B4D] via-[#062C4F] to-[#043B59] p-4">
      <div className="glass-strong rounded-2xl p-8 text-center max-w-md space-y-6">
        <Loader2 className="w-12 h-12 text-[#4AAEFF] animate-spin mx-auto" />
        <p className="text-white/80">Redirecionando para Precificação Inteligente...</p>
        
        {destination && (
          <Button
            onClick={() => window.location.replace(destination)}
            className="bg-gradient-to-r from-[#C372FF] to-[#4AAEFF] text-white"
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
