import { ChatInterface } from "@/components/ChatInterface";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LogOut } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { toast } from "sonner";

const Chat = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const topic = searchParams.get("topic") || undefined;
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (!session) {
        navigate("/auth");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Você saiu da sua conta");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen bg-background relative overflow-hidden">
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 grid-pattern opacity-30"></div>
      
      <header className="relative border-b border-border/50 glass-strong backdrop-blur-xl sticky top-0 z-10 animate-slide-in-up">
        <div className="container mx-auto px-3 py-3 sm:px-4 sm:py-4 md:px-6 md:py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="rounded-full glass hover:glass-strong transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center gap-4">
            {/* Animated Avatar with Online Indicator */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary opacity-50 blur-xl animate-glow-pulse"></div>
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-2xl glass-strong p-1.5">
                <div className="w-full h-full rounded-xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center animate-gradient-shift" style={{ backgroundSize: '200% 200%' }}>
                  <span className="text-white font-black text-base sm:text-lg">S</span>
                </div>
              </div>
              {/* Online Indicator with Pulse */}
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-secondary rounded-full border-2 border-background animate-glow-pulse"></div>
            </div>
            <div>
              <h1 className="font-bold text-base sm:text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Soph</h1>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse"></span>
                Online agora
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="rounded-full glass hover:glass-strong transition-all"
            title="Sair"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="relative flex-1 overflow-hidden">
        <ChatInterface selectedTopic={topic} />
      </main>
    </div>
  );
};

export default Chat;
