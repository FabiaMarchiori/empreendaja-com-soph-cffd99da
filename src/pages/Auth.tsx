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
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8 animate-scale-in">
          <div className="mb-6 flex justify-center">
            <video
              autoPlay
              muted
              loop
              controls
              playsInline
              preload="auto"
              className="w-[80vw] sm:w-[75vw] md:w-[65vw] lg:w-[55vw] max-w-2xl aspect-video rounded-2xl shadow-lg"
              style={{
                background: 'transparent',
                border: 'none',
                boxShadow: 'none',
                outline: 'none'
              }}
            >
              <source 
                src="https://frtnvbhmrtuelztgumou.supabase.co/storage/v1/object/public/videos/Untitled%20design.mp4" 
                type="video/mp4" 
              />
              Seu navegador não suporta vídeos.
            </video>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3 shimmer-text drop-shadow-lg">
            EmpreendaJá
          </h1>
          <p className="text-white text-lg sm:text-xl md:text-2xl font-medium drop-shadow-md">
            Entre para conversar com a Soph
          </p>
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
