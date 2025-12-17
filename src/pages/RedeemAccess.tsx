import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift, Loader2, ArrowLeft, CheckCircle, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const RedeemAccess = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [accessUntil, setAccessUntil] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const handleRedeem = async () => {
    if (!code.trim()) {
      toast({
        title: "Código inválido",
        description: "Por favor, insira um código promocional válido.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        toast({
          title: "Sessão expirada",
          description: "Por favor, faça login novamente.",
          variant: "destructive"
        });
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase.functions.invoke('redeem-promo-code', {
        body: { code: code.trim() }
      });

      if (error) {
        throw new Error(error.message || 'Erro ao resgatar código');
      }

      if (data.error) {
        toast({
          title: "Erro",
          description: data.error,
          variant: "destructive"
        });
        return;
      }

      if (data.success) {
        setSuccess(true);
        setAccessUntil(data.access_until);
        toast({
          title: "Acesso ativado!",
          description: `Você tem ${data.duration_months} meses de acesso à Soph.`,
        });
      }
    } catch (error: any) {
      console.error('Erro ao resgatar código:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível resgatar o código. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Faça login primeiro</CardTitle>
            <CardDescription>
              Você precisa estar logado para resgatar um código promocional.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Button onClick={() => navigate('/auth')} className="w-full">
              Fazer login
            </Button>
            <Button variant="ghost" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
        </div>
        
        <Card className="w-full max-w-md border-border/50 bg-card/80 backdrop-blur-sm relative z-10">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <CardTitle className="text-2xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Acesso Ativado!
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Parabéns! Seu acesso foi ativado com sucesso.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center p-4 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-sm text-muted-foreground mb-1">Acesso válido até</p>
              <p className="text-lg font-semibold text-foreground">
                {accessUntil ? formatDate(accessUntil) : '6 meses a partir de hoje'}
              </p>
            </div>
            
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
              <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
              <p>Agora você tem acesso a todas as ferramentas e funcionalidades da Soph!</p>
            </div>

            <Button 
              onClick={() => navigate('/')} 
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              Começar a usar a Soph
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      </div>
      
      <Card className="w-full max-w-md border-border/50 bg-card/80 backdrop-blur-sm relative z-10">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
            <Gift className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Resgatar Acesso
          </CardTitle>
          <CardDescription className="text-base mt-2">
            Digite seu código promocional para ativar seu acesso à Soph
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Digite seu código (ex: EMPREENDA2024)"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="text-center text-lg tracking-wider font-mono uppercase"
              disabled={loading}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRedeem();
              }}
            />
            <p className="text-xs text-muted-foreground text-center">
              O código é enviado por e-mail para usuários elegíveis
            </p>
          </div>

          <Button
            onClick={handleRedeem}
            disabled={loading || !code.trim()}
            className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Validando...
              </>
            ) : (
              <>
                <Gift className="w-4 h-4 mr-2" />
                Ativar meu acesso
              </>
            )}
          </Button>

          <div className="pt-4 border-t border-border/50">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="w-full text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para início
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RedeemAccess;
