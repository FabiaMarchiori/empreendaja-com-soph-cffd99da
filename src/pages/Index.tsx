import { useState, useEffect } from "react";
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
  Sparkles,
  LogIn,
  MessageCircle,
  User as UserIcon,
  LogOut
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

const Index = () => {
  const navigate = useNavigate();
  const [showTopics, setShowTopics] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      // Se usuário estiver logado, mostrar os tópicos automaticamente
      if (session?.user) {
        setShowTopics(true);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      // Se usuário fez login, mostrar os tópicos
      if (session?.user) {
        setShowTopics(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

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
    },
    {
      id: "free-chat",
      icon: MessageCircle,
      title: "Chat Livre",
      description: "Tire suas dúvidas e converse com a Soph"
    }
  ];

  const handleTopicClick = (topicId: string) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    
    if (topicId === "free-chat") {
      navigate("/chat");
    } else {
      navigate(`/chat?topic=${topicId}`);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setShowTopics(false);
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Aurora Background Effect */}
      <div className="aurora-bg"></div>
      
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 grid-pattern opacity-50"></div>
      
      {/* Gradient Mesh Background */}
      <div className="absolute inset-0" style={{ background: 'var(--gradient-mesh)' }}></div>
      
      {/* Floating Orbs */}
      <div className="orb orb-primary w-96 h-96 -top-48 -left-48" style={{ animationDelay: '0s' }}></div>
      <div className="orb orb-secondary w-80 h-80 top-1/3 -right-40" style={{ animationDelay: '-2s' }}></div>
      <div className="orb orb-accent w-64 h-64 bottom-20 left-1/4" style={{ animationDelay: '-4s' }}></div>
      
      {/* Geometric Shapes */}
      <div className="geo-shape w-32 h-32 top-20 right-20 rotate-45" style={{ animationDuration: '25s' }}></div>
      <div className="geo-shape w-20 h-20 bottom-32 left-16 rounded-full" style={{ animationDuration: '30s', animationDirection: 'reverse' }}></div>
      <div className="geo-shape w-16 h-16 top-1/2 right-10" style={{ animationDuration: '20s' }}></div>
      
      {/* Floating Particles */}
      {[...Array(8)].map((_, i) => (
        <div 
          key={i}
          className="particle"
          style={{ 
            top: `${Math.random() * 100}%`, 
            left: `${Math.random() * 100}%`,
            animationDelay: `${i * 0.5}s`,
            animationDuration: `${3 + Math.random() * 3}s`,
            background: i % 3 === 0 ? 'hsl(var(--primary))' : i % 3 === 1 ? 'hsl(var(--secondary))' : 'hsl(var(--accent))'
          }}
        ></div>
      ))}
      
      {/* Noise Overlay */}
      <div className="noise-overlay"></div>

      {/* Profile Menu - Top Right */}
      {user && (
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full w-12 h-12 sm:w-14 sm:h-14 hover:scale-105 transition-transform border-2 border-white/20" style={{ backgroundColor: '#6A0DAD' }}>
                <UserIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="border-white/20 min-w-[200px] rounded-xl" style={{ backgroundColor: '#6A0DAD' }}>
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-white hover:text-white">
                <LogIn className="mr-2 h-4 w-4" />
                Voltar ao Login
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-400 hover:text-red-400 focus:text-red-400">
                <LogOut className="mr-2 h-4 w-4" />
                Sair do App
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
      
      {!showTopics ? (
        <div className="relative flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 text-center">
          <div className="max-w-5xl space-y-8">
            {/* Animated Avatar with Complex Gradients */}
            <div className="relative animate-float">
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-accent opacity-30 blur-3xl animate-glow-pulse"></div>
              <div className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 mx-auto mb-6 rounded-3xl glass-strong p-2 shadow-2xl animate-scale-in">
                <div className="w-full h-full rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center animate-gradient-shift" style={{ backgroundSize: '200% 200%' }}>
                  <Sparkles className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 text-white animate-pulse" />
                </div>
              </div>
              
              {/* Floating Particles */}
              <div className="absolute top-0 left-1/4 w-2 h-2 rounded-full bg-primary animate-float" style={{ animationDelay: '0s', animationDuration: '4s' }}></div>
              <div className="absolute top-1/4 right-1/4 w-3 h-3 rounded-full bg-secondary animate-float" style={{ animationDelay: '0.5s', animationDuration: '3s' }}></div>
              <div className="absolute bottom-1/4 left-1/3 w-2 h-2 rounded-full bg-accent animate-float" style={{ animationDelay: '1s', animationDuration: '5s' }}></div>
            </div>

            {/* Title with Gradient Text */}
            <div className="space-y-4 animate-slide-in-up overflow-visible" style={{ animationDelay: '0.2s' }}>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black shimmer-text drop-shadow-lg whitespace-nowrap">
                EmpreendaJá
              </h1>
              <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground">
                com <span className="text-secondary">Soph</span>
              </p>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
                Sua agente virtual de negócios que vai te ajudar a estruturar e crescer o seu negócio
              </p>
            </div>

            {/* CTA Buttons with Enhanced Effects */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 animate-slide-in-up" style={{ animationDelay: '0.4s' }}>
              <Button
                size="lg"
                onClick={() => setShowTopics(true)}
                className="relative text-sm sm:text-base md:text-lg px-6 py-4 sm:px-8 sm:py-5 md:px-10 md:py-7 bg-gradient-to-r from-primary via-secondary to-accent shadow-primary hover:shadow-2xl transition-all font-bold group overflow-hidden"
                style={{ backgroundSize: '200% 200%' }}
              >
                <span className="relative z-10">Começar Agora</span>
                <div className="absolute inset-0 bg-gradient-to-r from-accent via-secondary to-primary opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundSize: '200% 200%' }}></div>
              </Button>
              {user ? (
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate("/chat")}
                  className="text-sm sm:text-base md:text-lg px-6 py-4 sm:px-8 sm:py-5 md:px-10 md:py-7 border-2 glass hover:glass-strong font-bold"
                >
                  Chat Livre
                </Button>
              ) : (
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate("/auth")}
                  className="text-sm sm:text-base md:text-lg px-6 py-4 sm:px-8 sm:py-5 md:px-10 md:py-7 border-2 glass hover:glass-strong font-bold gap-2"
                >
                  <LogIn className="w-5 h-5" />
                  Fazer Login
                </Button>
              )}
            </div>

            {/* Animated Statistics Cards */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6 pt-12 max-w-md mx-auto animate-slide-in-up" style={{ animationDelay: '0.6s' }}>
              <div className="glass-strong rounded-2xl p-4 hover:scale-105 transition-transform">
                <div className="text-2xl sm:text-3xl md:text-4xl font-black bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent">100%</div>
                <div className="text-xs text-muted-foreground font-medium mt-1">Gratuito</div>
              </div>
              <div className="glass-strong rounded-2xl p-4 hover:scale-105 transition-transform">
                <div className="text-2xl sm:text-3xl md:text-4xl font-black bg-gradient-to-br from-secondary to-accent bg-clip-text text-transparent">24/7</div>
                <div className="text-xs text-muted-foreground font-medium mt-1">Disponível</div>
              </div>
              <div className="glass-strong rounded-2xl p-4 hover:scale-105 transition-transform">
                <div className="text-2xl sm:text-3xl md:text-4xl font-black bg-gradient-to-br from-accent to-primary bg-clip-text text-transparent">7+</div>
                <div className="text-xs text-muted-foreground font-medium mt-1">Tópicos</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative container mx-auto px-4 pt-16 sm:pt-20 pb-8 sm:pb-12 md:pb-16 max-w-6xl">
          {/* Gradient Mesh de fundo */}
          <div className="absolute inset-0 gradient-mesh-premium pointer-events-none" />
          
          {/* Luzes neon decorativas */}
          <div className="absolute top-20 left-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-60 h-60 bg-secondary/15 rounded-full blur-3xl" />
          
          {/* Título com glow intenso */}
          <div className="text-center mb-16 space-y-4 animate-fade-up-scale">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black shimmer-text title-glow">
              Como posso te ajudar hoje?
            </h2>
            <p className="text-lg text-white/80 font-medium drop-shadow-lg">
              Escolha um tópico ou inicie um chat livre com a Soph
            </p>
          </div>

          {/* Grid com animações staggered */}
          <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-3 mb-12">
            {topics.map((topic, index) => (
              <div 
                key={topic.id}
                className="animate-fade-up-scale"
                style={{ 
                  animationDelay: `${0.1 + index * 0.08}s`,
                  animationFillMode: 'both'
                }}
              >
                <TopicCard
                  icon={topic.icon}
                  title={topic.title}
                  description={topic.description}
                  onClick={() => handleTopicClick(topic.id)}
                />
              </div>
            ))}
          </div>

          {/* Footer Institucional */}
          <footer className="relative py-8 mt-16 border-t border-white/10">
            <div className="container mx-auto px-4 text-center">
              <p className="text-sm sm:text-base text-white/60 font-medium">
                Material desenvolvido por{" "}
                <span className="text-white font-semibold">EmpreendeJá com Soph</span>
                {" "}— Inteligência que impulsiona negócios
              </p>
              <div className="flex items-center justify-center gap-1 mt-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-xs text-white/40">Powered by AI</span>
              </div>
            </div>
          </footer>
        </div>
      )}
    </div>
  );
};

export default Index;
