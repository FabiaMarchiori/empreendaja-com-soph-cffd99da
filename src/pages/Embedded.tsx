import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { validateSophToken } from "@/lib/validateSophToken";

// URLs permitidas para receber postMessage
const ALLOWED_ORIGINS = [
  "https://aplicativodeimportadoras25.lovable.app",
  "http://localhost:5173", // Para desenvolvimento local
  "http://localhost:3000"
];

// Regex para validar subdomínios legítimos do lovable.app
const LOVABLE_APP_PATTERN = /^https:\/\/[a-z0-9-]+\.lovable\.app$/;

export default function Embedded() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("Carregando sua mentora...");

  useEffect(() => {
    const handler = async (event: MessageEvent) => {
      // Verificar se a origem é permitida (exata ou subdomínio válido do lovable.app)
      const isAllowedOrigin = ALLOWED_ORIGINS.includes(event.origin) || 
        LOVABLE_APP_PATTERN.test(event.origin);

      if (!isAllowedOrigin) {
        return;
      }

      // Verificar se é SSO_TOKEN
      if (event.data?.type === "SSO_TOKEN") {
        const token = event.data.token;
        
        if (!token) {
          setStatus("Erro: token ausente");
          return;
        }

        setStatus("Validando acesso...");

        try {
          const result = await validateSophToken(token);

          if (result.valid && result.payload?.sub) {
            // Store token for re-validation, plus validation timestamp
            sessionStorage.setItem("soph_sso_token", token);
            sessionStorage.setItem("soph_sso_valid", "true");
            sessionStorage.setItem("soph_sso_user", result.payload.sub);
            sessionStorage.setItem("soph_sso_validated_at", Date.now().toString());
            
            setStatus("Acesso autorizado! Redirecionando...");
            
            setTimeout(() => {
              navigate("/chat");
            }, 500);
          } else {
            setStatus("Acesso não autorizado");
            setTimeout(() => navigate("/auth"), 2000);
          }
        } catch {
          setStatus("Erro ao validar acesso");
          setTimeout(() => navigate("/auth"), 2000);
        }
      }
    };

    window.addEventListener("message", handler);

    return () => {
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
