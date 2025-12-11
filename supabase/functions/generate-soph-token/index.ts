import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Função para gerar JWT HS256
async function generateHS256Token(payload: object, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  
  // Header JWT
  const header = { alg: 'HS256', typ: 'JWT' };
  const headerB64 = btoa(JSON.stringify(header))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  
  // Payload
  const payloadB64 = btoa(JSON.stringify(payload))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  
  // Assinatura
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const data = encoder.encode(`${headerB64}.${payloadB64}`);
  const signature = await crypto.subtle.sign('HMAC', key, data);
  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  
  return `${headerB64}.${payloadB64}.${signatureB64}`;
}

// Função para validar sessão do Supabase
async function getUserFromSession(supabaseAccessToken: string) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  console.log('[generate-soph-token] Validando sessão do usuário...');
  
  const resp = await fetch(`${supabaseUrl}/auth/v1/user`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${supabaseAccessToken}`,
      apikey: serviceRoleKey!
    }
  });

  if (!resp.ok) {
    const text = await resp.text();
    console.error('[generate-soph-token] Erro ao validar sessão:', text);
    return { error: text };
  }

  const user = await resp.json();
  console.log('[generate-soph-token] Usuário validado:', user.id);
  return { user };
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[generate-soph-token] Requisição recebida:', req.method);

    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Use POST' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Extrair token do header Authorization
    const authorization = req.headers.get('authorization');
    if (!authorization || !authorization.startsWith('Bearer ')) {
      console.error('[generate-soph-token] Header Authorization ausente ou inválido');
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseToken = authorization.split(' ')[1];
    const { user, error } = await getUserFromSession(supabaseToken);

    if (error || !user) {
      console.error('[generate-soph-token] Sessão inválida:', error);
      return new Response(JSON.stringify({ error: 'Invalid session' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Gerar token SSO para a Soph
    const secret = Deno.env.get('SOPH_JWT_SECRET');
    if (!secret) {
      console.error('[generate-soph-token] SOPH_JWT_SECRET não configurado');
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + 5 * 60; // 5 minutos

    const payload = {
      sub: user.id,
      email: user.email,
      iat,
      exp,
      iss: 'importadoras-25',
    };

    console.log('[generate-soph-token] Gerando token para usuário:', user.id);
    const token = await generateHS256Token(payload, secret);
    console.log('[generate-soph-token] Token gerado com sucesso');

    return new Response(JSON.stringify({ token }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[generate-soph-token] Erro interno:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
