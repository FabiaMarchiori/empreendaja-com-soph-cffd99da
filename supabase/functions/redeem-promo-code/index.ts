import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// URL da API do App Importadoras para validação de códigos
const IMPORTADORAS_API_URL = 'https://appdeimportadoras25demarco.netlify.app/api/validate-soph-code';

// Duração fixa do acesso em meses (regra de negócio do App Importadoras)
const DURATION_MONTHS = 6;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    // Cliente com auth do usuário
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Não autorizado' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verificar usuário autenticado
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Usuário não autenticado' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Receber código
    const { code } = await req.json();
    if (!code || typeof code !== 'string' || code.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Código inválido' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const normalizedCode = code.trim().toUpperCase();

    // Cliente service_role para operações administrativas
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Verificar se usuário já tem acesso ativo
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('access_until')
      .eq('id', user.id)
      .maybeSingle();

    if (existingProfile?.access_until) {
      const accessUntil = new Date(existingProfile.access_until);
      if (accessUntil > new Date()) {
        return new Response(JSON.stringify({ 
          error: 'Você já possui acesso ativo até ' + accessUntil.toLocaleDateString('pt-BR')
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // ===== INTEGRAÇÃO COM API DO APP IMPORTADORAS =====
    console.log('Calling Importadoras API for code validation...');
    
    let importadorasResult;
    try {
      const importadorasResponse = await fetch(IMPORTADORAS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: normalizedCode })
      });

      console.log('Importadoras API response status:', importadorasResponse.status);

      if (!importadorasResponse.ok) {
        console.error('Importadoras API returned non-OK status:', importadorasResponse.status);
        return new Response(JSON.stringify({ 
          error: 'Não foi possível validar o código. Tente novamente em alguns instantes.' 
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      importadorasResult = await importadorasResponse.json();
      console.log('Importadoras API result valid:', importadorasResult.valid);

    } catch (fetchError) {
      console.error('Error calling Importadoras API:', fetchError);
      return new Response(JSON.stringify({ 
        error: 'Não foi possível validar o código. Tente novamente em alguns instantes.' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Verificar resposta da API
    if (!importadorasResult.valid) {
      return new Response(JSON.stringify({ 
        error: 'Código inválido ou não autorizado. Verifique seu acesso no App Importadoras.' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // ===== CÓDIGO VÁLIDO - LIBERAR ACESSO =====
    
    // Calcular data de expiração (6 meses fixos)
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setMonth(expiresAt.getMonth() + DURATION_MONTHS);

    // Atualizar ou criar perfil do usuário
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email,
        access_origin: 'importadoras',
        access_until: expiresAt.toISOString(),
        updated_at: now.toISOString()
      }, { onConflict: 'id' });

    if (profileError) {
      console.error('Error updating profile:', profileError);
      return new Response(JSON.stringify({ error: 'Erro ao ativar acesso' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Access granted successfully for user:', user.id);

    return new Response(JSON.stringify({
      success: true,
      message: 'Acesso ativado com sucesso!',
      access_until: expiresAt.toISOString(),
      duration_months: DURATION_MONTHS
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Internal server error:', error);
    return new Response(JSON.stringify({ error: 'Erro interno do servidor' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
