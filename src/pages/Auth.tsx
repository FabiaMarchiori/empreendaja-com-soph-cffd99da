import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Verificar se veio do botão "Já tenho código de acesso"
  const fromRedemption = location.state?.fromRedemption === true;

  useEffect(() => {
    const checkAccessAndRedirect = async (userId: string) => {
      // Se veio do fluxo de resgate, redirecionar direto para resgatar código
      if (fromRedemption) {
        navigate("/resgatar-acesso");
        return;
      }

      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('access_until')
          .eq('id', userId)
          .maybeSingle();

        if (!profile?.access_until) {
          // Usuário nunca resgatou acesso
          navigate("/sem-acesso");
          return;
        }

        const accessUntil = new Date(profile.access_until);
        const now = new Date();
        
        if (accessUntil > now) {
          // Acesso válido
          navigate("/");
        } else {
          // Acesso expirado
          navigate("/sem-acesso");
        }
      } catch (error) {
        console.error("Error checking access:", error);
        navigate("/sem-acesso");
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        checkAccessAndRedirect(session.user.id);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        checkAccessAndRedirect(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, fromRedemption]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#0A0B1E]">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8 animate-scale-in">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3 shimmer-text drop-shadow-lg">
            EmpreendaJá
          </h1>
          <p className="text-white text-lg sm:text-xl md:text-2xl font-medium drop-shadow-md">
            Entre para conversar com a Soph
          </p>
          {/* BUILD MARKER: v2-2024-12-22 - REMOVER DEPOIS */}
        </div>

        <div className="glass-strong rounded-3xl p-5 sm:p-6 md:p-8 shadow-elegant max-w-md mx-auto">
          <SupabaseAuth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: 'hsl(var(--primary))',
                    brandAccent: 'hsl(var(--primary))',
                  },
                },
              },
              className: {
                container: 'auth-container',
                button: 'auth-button',
                input: 'auth-input',
              },
            }}
            providers={['google']}
            redirectTo={`${window.location.origin}/`}
            localization={{
              variables: {
                sign_in: {
                  email_label: "Email",
                  password_label: "Senha",
                  email_input_placeholder: "seu@email.com",
                  password_input_placeholder: "••••••••",
                  button_label: "Entrar",
                  loading_button_label: "Entrando...",
                  link_text: "Já tem uma conta? Entre",
                },
                sign_up: {
                  email_label: "Email",
                  password_label: "Senha",
                  email_input_placeholder: "seu@email.com",
                  password_input_placeholder: "••••••••",
                  button_label: "Criar conta",
                  loading_button_label: "Criando conta...",
                  link_text: "Não tem uma conta? Cadastre-se",
                },
                forgotten_password: {
                  email_label: "Email",
                  email_input_placeholder: "seu@email.com",
                  button_label: "Enviar instruções",
                  loading_button_label: "Enviando...",
                  link_text: "Esqueceu sua senha?",
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
