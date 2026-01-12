import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = (location.state as { returnTo?: string })?.returnTo || null;

  useEffect(() => {
    const checkAccessAndRedirect = async (userId: string) => {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('has_access')
          .eq('id', userId)
          .maybeSingle();

        if (profile?.has_access === true) {
          // Usuário com acesso ativo -> entra no app ou returnTo
          navigate(returnTo || "/");
        } else {
          // Usuário sem acesso -> vai resgatar código
          navigate("/resgatar-acesso");
        }
      } catch (error) {
        console.error("Error checking access:", error);
        navigate("/resgatar-acesso");
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
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#071E2D] relative">
      {/* Botão Voltar para Soph */}
      <Link 
        to="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-[#00E5FF] hover:text-[#00E5FF]/80 transition-colors group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Voltar para Soph</span>
      </Link>

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
