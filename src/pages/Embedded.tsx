import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { validateSophToken } from "@/lib/validateSophToken";

// URLs permitidas para receber postMessage
const ALLOWED_ORIGINS = [
  "https://aplicativodeimportadoras25.lovable.app",
  "http://localhost:5173", // Para desenvolvimento local
  "http://localhost:3000"
];

export default function Embedded() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("Carregando sua mentora...");

  useEffect(() => {
    console.log("[Embedded] Página carregada");
    console.log("[Embedded] Minha localização:", window.location.href);

    const handler = async (event: MessageEvent) => {
      // LOG COMPLETO
      console.log("[Embedded] postMessage recebido:", {
        origin: event.origin,
        type: event.data?.type,
        hasToken: !!event.data?.token,
        location: window.location.href
      });

      // Verificar se a origem é permitida
      const isAllowedOrigin = ALLOWED_ORIGINS.some(origin => 
        event.origin === origin || event.origin.includes('lovable.app')
      );

      if (!isAllowedOrigin) {
        console.warn("[Embedded] ⚠️ Origem não permitida:", event.origin);
        console.warn("[Embedded] Origens permitidas:", ALLOWED_ORIGINS);
        return;
      }

      // Verificar se é SSO_TOKEN
      if (event.data?.type === "SSO_TOKEN") {
        console.log("[Embedded] ✅ SSO_TOKEN recebido da origem permitida!");
        
        const token = event.data.token;
        
        if (!token) {
          console.error("[Embedded] Token vazio recebido");
          setStatus("Erro: token ausente");
          return;
        }

        setStatus("Validando acesso...");

        try {
          const result = await validateSophToken(token);
          console.log("[Embedded] Resultado da validação:", result);

          if (result.valid && result.payload?.sub) {
            sessionStorage.setItem("soph_sso_valid", "true");
            sessionStorage.setItem("soph_sso_user", result.payload.sub);
            
            console.log("[Embedded] ✅ SSO válido, redirecionando para /chat");
            setStatus("Acesso autorizado! Redirecionando...");
            
            setTimeout(() => {
              navigate("/chat");
            }, 500);
          } else {
            console.error("[Embedded] ❌ Token inválido:", result.error);
            setStatus("Acesso não autorizado");
            setTimeout(() => navigate("/auth"), 2000);
          }
        } catch (error) {
          console.error("[Embedded] Erro na validação:", error);
          setStatus("Erro ao validar acesso");
          setTimeout(() => navigate("/auth"), 2000);
        }
      } else {
        console.log("[Embedded] Tipo de mensagem desconhecido:", event.data?.type);
      }
    };

    window.addEventListener("message", handler);

    console.log("[Embedded] Listener de postMessage ativo");
    console.log("[Embedded] Aguardando token do parent...");

    return () => {
      console.log("[Embedded] Removendo listener");
      window.removeEventListener("message", handler);
    };
  }, [navigate]);

  return (
    <div className="w-screen h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-pulse">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <span className="text-primary-foreground font-black text-2xl">S</span>
          </div>
        </div>
        <p className="text-muted-foreground">{status}</p>
      </div>
    </div>
  );
}
