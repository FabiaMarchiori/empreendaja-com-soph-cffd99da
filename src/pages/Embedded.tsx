import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { validateSophToken } from "@/lib/validateSophToken";

export default function Embedded() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("Carregando sua mentora...");

  useEffect(() => {
    console.log("[Embedded] Página carregada");
    console.log("[Embedded] Minha localização:", window.location.href);

    const handler = async (event: MessageEvent) => {
      // LOG COMPLETO ANTES DE QUALQUER VERIFICAÇÃO
      console.log("[Embedded] DEBUG ORIGIN:", {
        origin: event.origin,
        data: event.data,
        location: window.location.href
      });

      // Verificar origem - APENAS LOGAR, NÃO REJEITAR
      if (event.origin !== "https://aplicativodeimportadoras25.lovable.app") {
        console.warn("[Embedded] Origem diferente da esperada:", event.origin);
        console.warn("[Embedded] Esperado:", "https://aplicativodeimportadoras25.lovable.app");
        // NÃO dá return aqui - queremos ver TUDO
      }

      // Verificar se é SSO_TOKEN
      if (event.data?.type === "SSO_TOKEN") {
        console.log("[Embedded] ✅ SSO_TOKEN recebido!");
        console.log("[Embedded] Token presente:", !!event.data.token);
        
        const token = event.data.token;
        setStatus("Validando acesso...");

        const result = await validateSophToken(token);
        console.log("[Embedded] Resultado da validação:", result);

        if (result.valid && result.payload?.sub) {
          sessionStorage.setItem("soph_sso_valid", "true");
          sessionStorage.setItem("soph_sso_user", result.payload.sub);
          console.log("[Embedded] SSO válido, redirecionando para /chat");
          navigate("/chat");
        } else {
          console.error("[Embedded] Token inválido:", result.error);
          setStatus("Acesso não autorizado");
          setTimeout(() => navigate("/auth"), 2000);
        }
      } else {
        console.log("[Embedded] Tipo de mensagem:", event.data?.type || "indefinido");
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
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
