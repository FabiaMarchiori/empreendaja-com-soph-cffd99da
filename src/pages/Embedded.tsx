import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { validateSophToken } from "@/lib/validateSophToken";

export default function Embedded() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("Carregando sua mentora...");

  useEffect(() => {
    const handler = async (event: MessageEvent) => {
      // Aceitar apenas do App de Importadoras
      if (event.origin !== "https://aplicativodeimportadoras25.lovable.app") {
        console.log("[Embedded] Origem ignorada:", event.origin);
        return;
      }

      if (event.data?.type === "SSO_TOKEN") {
        const token = event.data.token;
        console.log("[Embedded] Token recebido via postMessage");
        setStatus("Validando acesso...");

        const result = await validateSophToken(token);

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
