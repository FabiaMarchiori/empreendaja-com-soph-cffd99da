import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, ArrowLeft, Gift, CreditCard, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

const NoAccess = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, loading } = useAuth();

  // Redirecionar para login se não autenticado
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [loading, isAuthenticated, navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    sessionStorage.removeItem('soph_sso_valid');
    sessionStorage.removeItem('soph_sso_user');
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso."
    });
    navigate('/');
  };

  const handleSubscribe = () => {
    // TODO: Substituir pelo link real do checkout Kiwify
    window.open('https://empreendaja.com.br/planos', '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center background-empreendaja p-4">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      </div>
      
      {/* Noise Overlay */}
      <div className="noise-overlay" />
      
      <Card className="w-full max-w-md border-border/50 bg-card/80 backdrop-blur-sm relative z-10">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl text-foreground">
            Você ainda não tem acesso
          </CardTitle>
          <CardDescription className="text-base mt-2">
            Escolha como deseja começar sua jornada com a Soph:
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 text-center">
            <p className="text-sm text-muted-foreground mb-1">A Soph é sua agente virtual de negócios</p>
            <p className="text-foreground font-medium">
              Estruture e cresça seu negócio com orientação especializada!
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleSubscribe}
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Quero assinar
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate('/resgatar-acesso')}
              className="w-full border-border/50"
            >
              <Gift className="w-4 h-4 mr-2" />
              Tenho um código de acesso
            </Button>
          </div>

          <div className="pt-4 border-t border-border/50 flex gap-2">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="flex-1 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <Button 
              variant="ghost" 
              onClick={handleLogout}
              className="flex-1 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NoAccess;
