import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function verifyHS256(token: string, secret: string): Promise<{ valid: boolean; payload?: any; error?: string }> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { valid: false, error: 'Token mal formatado' };
    }

    const [headerB64, payloadB64, signatureB64] = parts;
    
    // Import key for HMAC-SHA256
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign', 'verify']
    );
    
    // Prepare data and signature
    const data = encoder.encode(`${headerB64}.${payloadB64}`);
    
    // Convert base64url to base64 and decode
    const signatureBase64 = signatureB64.replace(/-/g, '+').replace(/_/g, '/');
    const signatureBytes = Uint8Array.from(atob(signatureBase64), c => c.charCodeAt(0));
    
    // Verify signature
    const isValid = await crypto.subtle.verify('HMAC', key, signatureBytes, data);
    
    if (!isValid) {
      console.log('Token signature verification failed');
      return { valid: false, error: 'Assinatura inválida' };
    }

    // Decode payload
    const payloadBase64 = payloadB64.replace(/-/g, '+').replace(/_/g, '/');
    const payloadJson = atob(payloadBase64);
    const payload = JSON.parse(payloadJson);
    
    console.log('Token payload decoded:', { sub: payload.sub, exp: payload.exp, iat: payload.iat });
    
    // Verify expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      console.log('Token expired:', { exp: payload.exp, now });
      return { valid: false, error: 'Token expirado' };
    }

    // Verify required fields
    if (!payload.sub) {
      console.log('Token missing required field: sub');
      return { valid: false, error: 'Campo sub obrigatório ausente' };
    }

    console.log('Token validated successfully for user:', payload.sub);
    return { valid: true, payload };
  } catch (error) {
    console.error('Token verification error:', error);
    return { valid: false, error: 'Erro ao processar token' };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token } = await req.json();
    
    if (!token || typeof token !== 'string') {
      console.log('Token not provided or invalid type');
      return new Response(JSON.stringify({ valid: false, error: 'Token não fornecido' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const secret = Deno.env.get('SOPH_JWT_SECRET');
    if (!secret) {
      console.error('SOPH_JWT_SECRET not configured in environment');
      return new Response(JSON.stringify({ valid: false, error: 'Configuração do servidor inválida' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const result = await verifyHS256(token, secret);
    
    return new Response(JSON.stringify(result), {
      status: result.valid ? 200 : 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Request processing error:', error);
    return new Response(JSON.stringify({ valid: false, error: 'Erro interno' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
