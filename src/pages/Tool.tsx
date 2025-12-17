import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { AccessGate } from "@/components/AccessGate";

const ToolContent = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth(true);
  const [toolLoading, setToolLoading] = useState(true);
  const [toolUrl, setToolUrl] = useState<string | null>(null);
  const [toolName, setToolName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchToolUrl = async () => {
      if (!isAuthenticated || !slug) return;

      try {
        const { data, error } = await supabase.functions.invoke('get-tool-url', {
          body: { slug }
        });

        if (error) {
          console.error("Error fetching tool URL:", error);
          setError("Ferramenta não encontrada");
          setToolLoading(false);
          return;
        }

        if (data?.url) {
          setToolUrl(data.url);
          setToolName(data.name || "Ferramenta");
        } else {
          setError("Ferramenta não disponível");
        }
      } catch (err) {
        console.error("Error:", err);
        setError("Erro ao carregar ferramenta");
      } finally {
        setToolLoading(false);
      }
    };

    if (isAuthenticated && slug) {
      fetchToolUrl();
    }
  }, [isAuthenticated, slug]);

  if (toolLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#482A72] via-[#2E1B4D] via-[#062C4F] to-[#043B59]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-[#4AAEFF] animate-spin" />
          <p className="text-white/80">Carregando ferramenta...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#482A72] via-[#2E1B4D] via-[#062C4F] to-[#043B59] p-4">
        <div className="glass-strong rounded-2xl p-8 text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">{error}</h2>
          <p className="text-white/60 mb-6">
            A ferramenta solicitada não está disponível ou não foi encontrada.
          </p>
          <Button
            onClick={() => navigate("/")}
            className="bg-gradient-to-r from-[#C372FF] to-[#4AAEFF] text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Início
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-3 py-2 border-b border-border/50 glass-strong backdrop-blur-xl">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="rounded-full glass hover:glass-strong transition-all px-2 py-1"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Voltar
        </Button>
        <h1 className="text-sm font-semibold bg-gradient-to-r from-[#C372FF] to-[#4AAEFF] bg-clip-text text-transparent">
          {toolName}
        </h1>
        <div className="w-16" />
      </header>

      {/* Iframe Container */}
      <main className="flex-1 relative tool-iframe-container">
        {toolUrl && (
          <iframe
            src={toolUrl}
            className="w-full h-full border-0"
            title={toolName}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
      </main>
    </div>
  );
};

const Tool = () => {
  return (
    <AccessGate>
      <ToolContent />
    </AccessGate>
  );
};

export default Tool;
