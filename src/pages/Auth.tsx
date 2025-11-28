import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Auth() {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#0A0B1E]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-scale-in">
          <div className="mb-6 flex justify-center">
            <iframe
              src="https://www.youtube.com/embed/PKUhsUbrqcQ?autoplay=1&mute=1&loop=1&controls=1&playlist=PKUhsUbrqcQ&modestbranding=1&rel=0&playsinline=1"
              className="w-64 h-36 sm:w-80 sm:h-44 md:w-96 md:h-56 rounded-2xl"
              style={{
                background: 'transparent',
                border: 'none',
                boxShadow: 'none',
                outline: 'none'
              }}
              allow="autoplay; encrypted-media"
              allowFullScreen={false}
            />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Empreenda Já
          </h1>
          <p className="text-muted-foreground text-lg">
            Entre para conversar com a Soph
          </p>
        </div>

        <div className="glass-strong rounded-3xl p-5 sm:p-6 md:p-8 shadow-elegant">
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
                  button_label: "Entrar",
                  loading_button_label: "Entrando...",
                  link_text: "Já tem uma conta? Entre",
                },
                sign_up: {
                  email_label: "Email",
                  password_label: "Senha",
                  button_label: "Criar conta",
                  loading_button_label: "Criando conta...",
                  link_text: "Não tem uma conta? Cadastre-se",
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
