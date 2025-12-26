import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// URL da API do App Importadoras para validação de códigos
const IMPORTADORAS_API_URL = 'https://appdeimportadoras25demarco.netlify.app/api/validate-soph-code';

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('validate-soph-code: Request received');

  try {
    // Parse body
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      console.log('validate-soph-code: Invalid JSON body');
      return new Response(
        JSON.stringify({ valid: false }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const code = body?.code;
    
    // Validate code format
    if (!code || typeof code !== 'string' || code.trim().length === 0) {
      console.log('validate-soph-code: Empty or invalid code');
      return new Response(
        JSON.stringify({ valid: false }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const normalizedCode = code.trim().toUpperCase();
    console.log('validate-soph-code: Validating code:', normalizedCode);

    // Call Importadoras API
    let importadorasResult;
    try {
      console.log('validate-soph-code: Calling Importadoras API...');
      
      const importadorasResponse = await fetch(IMPORTADORAS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: normalizedCode })
      });

      console.log('validate-soph-code: Importadoras API status:', importadorasResponse.status);

      // Se API retornar erro, retornar valid: false (mas HTTP 200)
      if (!importadorasResponse.ok) {
        console.log('validate-soph-code: Importadoras API returned non-OK status');
        return new Response(
          JSON.stringify({ valid: false }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Parse response
      try {
        importadorasResult = await importadorasResponse.json();
      } catch (jsonError) {
        console.log('validate-soph-code: Invalid JSON from Importadoras API');
        return new Response(
          JSON.stringify({ valid: false }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

    } catch (fetchError) {
      console.error('validate-soph-code: Fetch error:', fetchError);
      return new Response(
        JSON.stringify({ valid: false }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return result based on API response
    const isValid = importadorasResult?.valid === true;
    console.log('validate-soph-code: Final result:', isValid);

    return new Response(
      JSON.stringify({ valid: isValid }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    // Qualquer erro interno retorna HTTP 200 + valid: false
    console.error('validate-soph-code: Internal error:', error);
    return new Response(
      JSON.stringify({ valid: false }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
