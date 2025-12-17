import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, ArrowLeft, Mail, CreditCard, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AccessExpired = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

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

  const handleContact = () => {
    window.open('mailto:suporte@empreendaja.com.br?subject=Renovação de acesso Soph', '_blank');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
      </div>
      
      <Card className="w-full max-w-md border-border/50 bg-card/80 backdrop-blur-sm relative z-10">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center mb-4">
            <Clock className="w-8 h-8 text-orange-500" />
          </div>
          <CardTitle className="text-2xl text-foreground">
            Acesso Expirado
          </CardTitle>
          <CardDescription className="text-base mt-2">
            Seu período de acesso gratuito à Soph terminou. Mas não se preocupe, você pode continuar usando!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 text-center">
            <p className="text-sm text-muted-foreground mb-1">Gostou da Soph?</p>
            <p className="text-foreground font-medium">
              Continue sua jornada empreendedora com nosso plano completo!
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => window.open('https://empreendaja.com.br/planos', '_blank')}
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Ver planos disponíveis
            </Button>

            <Button
              variant="outline"
              onClick={handleContact}
              className="w-full"
            >
              <Mail className="w-4 h-4 mr-2" />
              Falar com suporte
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate('/resgatar-acesso')}
              className="w-full"
            >
              Tenho outro código promocional
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

export default AccessExpired;
