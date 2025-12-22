import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    // Verificar se código existe e não foi usado
    const { data: promoCode, error: codeError } = await supabaseAdmin
      .from('promo_codes')
      .select('*')
      .eq('code', normalizedCode)
      .eq('used', false)
      .maybeSingle();

    if (codeError) {
      console.error('Error fetching promo code:', codeError);
      return new Response(JSON.stringify({ error: 'Erro ao verificar código' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!promoCode) {
      return new Response(JSON.stringify({ error: 'Código inválido ou já utilizado' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Verificar se código tem email vinculado (opcional)
    if (promoCode.email && promoCode.email.toLowerCase() !== user.email?.toLowerCase()) {
      return new Response(JSON.stringify({ error: 'Este código está vinculado a outro e-mail' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Calcular data de expiração
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setMonth(expiresAt.getMonth() + promoCode.duration_months);

    // Marcar código como usado
    const { error: updateCodeError } = await supabaseAdmin
      .from('promo_codes')
      .update({
        used: true,
        used_by: user.id,
        used_at: now.toISOString(),
        expires_at: expiresAt.toISOString()
      })
      .eq('id', promoCode.id);

    if (updateCodeError) {
      console.error('Error updating promo code:', updateCodeError);
      return new Response(JSON.stringify({ error: 'Erro ao processar código' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Atualizar ou criar perfil do usuário
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email,
        access_origin: promoCode.origin,
        access_until: expiresAt.toISOString(),
        updated_at: now.toISOString()
      }, { onConflict: 'id' });

    if (profileError) {
      console.error('Error updating profile:', profileError);
      // Reverter o código para não usado
      await supabaseAdmin
        .from('promo_codes')
        .update({ used: false, used_by: null, used_at: null, expires_at: null })
        .eq('id', promoCode.id);
      
      return new Response(JSON.stringify({ error: 'Erro ao ativar acesso' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Acesso ativado com sucesso!',
      access_until: expiresAt.toISOString(),
      duration_months: promoCode.duration_months
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
