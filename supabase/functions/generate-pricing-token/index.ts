import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PRICING_APP_URL = 'https://aplicativodeprecificacao.netlify.app';

// Base64url encode function
function base64UrlEncode(data: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...data));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Generate HS256 signed JWT
async function generateHS256Token(payload: object, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  
  // Header
  const header = { alg: 'HS256', typ: 'JWT' };
  const headerB64 = base64UrlEncode(encoder.encode(JSON.stringify(header)));
  
  // Payload
  const payloadB64 = base64UrlEncode(encoder.encode(JSON.stringify(payload)));
  
  // Signature
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const data = encoder.encode(`${headerB64}.${payloadB64}`);
  const signature = await crypto.subtle.sign('HMAC', key, data);
  const signatureB64 = base64UrlEncode(new Uint8Array(signature));
  
  return `${headerB64}.${payloadB64}.${signatureB64}`;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Token de autenticação não fornecido' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseToken = authHeader.replace('Bearer ', '');

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Validate user session
    const { data: { user }, error: userError } = await supabase.auth.getUser(supabaseToken);
    
    if (userError || !user) {
      console.error('User validation error:', userError);
      return new Response(
        JSON.stringify({ error: 'Sessão inválida ou expirada' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has access
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('has_access, access_until')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('Profile fetch error:', profileError);
      return new Response(
        JSON.stringify({ error: 'Perfil não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check access_until (primary access control)
    const hasValidAccess = profile.access_until && new Date(profile.access_until) >= new Date();
    
    if (!hasValidAccess) {
      return new Response(
        JSON.stringify({ error: 'Acesso não autorizado à ferramenta de precificação' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the JWT secret
    const jwtSecret = Deno.env.get('SOPH_JWT_SECRET');
    if (!jwtSecret) {
      console.error('SOPH_JWT_SECRET not configured');
      return new Response(
        JSON.stringify({ error: 'Configuração do servidor inválida' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate JWT token with required payload for Pricing App
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      email: user.email,
      origem: 'soph',
      permissao: 'pricing_access',
      iat: now,
      exp: now + 300 // 5 minutes expiration
    };

    const token = await generateHS256Token(payload, jwtSecret);
    
    // Build redirect URL
    const redirectUrl = `${PRICING_APP_URL}/access?token=${token}`;

    console.log(`Generated pricing token for user: ${user.email}`);

    return new Response(
      JSON.stringify({ redirectUrl }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
