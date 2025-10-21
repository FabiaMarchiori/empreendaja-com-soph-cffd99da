import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TopicCard } from "@/components/TopicCard";
import { 
  TrendingUp, 
  Calendar, 
  FileText, 
  Award, 
  ShoppingCart, 
  Palette, 
  Globe,
  Sparkles
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  const [showTopics, setShowTopics] = useState(false);

  const topics = [
    {
      id: "sales",
      icon: TrendingUp,
      title: "Vendas nas Redes Sociais",
      description: "Aprenda estratégias eficazes para captar vendas"
    },
    {
      id: "content",
      icon: Calendar,
      title: "Cronograma de Conteúdo",
      description: "Planeje suas postagens mensais"
    },
    {
      id: "mei",
      icon: FileText,
      title: "Abrir MEI",
      description: "Guia completo passo a passo"
    },
    {
      id: "brand",
      icon: Award,
      title: "Registrar Marca",
      description: "Proteja sua marca no INPI"
    },
    {
      id: "marketplace",
      icon: ShoppingCart,
      title: "Vender em Marketplaces",
      description: "Shopee, Mercado Livre, Amazon e mais"
    },
    {
      id: "logo",
      icon: Palette,
      title: "Criar Logomarca",
      description: "Ferramentas gratuitas de IA"
    },
    {
      id: "website",
      icon: Globe,
      title: "Domínio e Site",
      description: "Presença online profissional"
    }
  ];

  const handleTopicClick = (topicId: string) => {
    navigate(`/chat?topic=${topicId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      {!showTopics ? (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
          <div className="max-w-2xl space-y-8 animate-in fade-in duration-700">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-20 blur-3xl"></div>
              <div className="relative w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary via-primary-glow to-secondary shadow-2xl flex items-center justify-center">
                <Sparkles className="w-16 h-16 text-white animate-pulse" />
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-primary-glow to-secondary bg-clip-text text-transparent">
                EmpreendeJá
              </h1>
              <p className="text-2xl md:text-3xl font-semibold text-foreground">
                com Soph
              </p>
              <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto">
                Sua agente virtual de negócios que vai te ajudar a estruturar e crescer seu empreendimento
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Button
                size="lg"
                onClick={() => setShowTopics(true)}
                className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-primary-glow shadow-primary hover:shadow-lg transition-all"
              >
                Começar Agora
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/chat")}
                className="text-lg px-8 py-6 border-2"
              >
                Chat Livre
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-8 pt-12 max-w-md mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">100%</div>
                <div className="text-sm text-muted-foreground">Gratuito</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary">24/7</div>
                <div className="text-sm text-muted-foreground">Disponível</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">7+</div>
                <div className="text-sm text-muted-foreground">Tópicos</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-4xl font-bold">Como posso te ajudar hoje?</h2>
            <p className="text-xl text-muted-foreground">
              Escolha um tópico ou inicie um chat livre com a Soph
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {topics.map((topic) => (
              <TopicCard
                key={topic.id}
                icon={topic.icon}
                title={topic.title}
                description={topic.description}
                onClick={() => handleTopicClick(topic.id)}
              />
            ))}
          </div>

          <div className="text-center">
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/chat")}
              className="border-2"
            >
              Ou inicie um chat livre
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
