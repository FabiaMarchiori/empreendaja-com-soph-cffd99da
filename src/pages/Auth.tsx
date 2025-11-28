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
            <video
              autoPlay
              muted
              loop
              playsInline
              className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 object-contain"
              style={{
                background: 'transparent',
                border: 'none',
                boxShadow: 'none',
                outline: 'none'
              }}
            >
              <source 
                src="https://www.dropbox.com/scl/fi/xc1q3ivpss1yvfs2mf5s1/Untitled-design.mp4?rlkey=5hz8rhvh4jkv92ysg508zu58u&raw=1" 
                type="video/mp4" 
              />
            </video>
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
