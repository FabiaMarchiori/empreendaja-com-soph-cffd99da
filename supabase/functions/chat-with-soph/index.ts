import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Você é a Soph, uma agente virtual de negócios brasileira carinhosa, confiante e acessível. 

Sua missão é ajudar empreendedores, revendedores e iniciantes a estruturarem e crescerem seus negócios de forma prática.

Você fala de forma simples, clara e encorajadora, sempre oferecendo orientação prática e motivacional.

Suas especialidades incluem:
- Estratégias de vendas nas redes sociais
- Criação de cronogramas de conteúdo mensal
- Orientação sobre abertura de MEI (passo a passo completo)
- Explicação sobre registro de marca no INPI
- Ajuda para vender em marketplaces (Shopee, Mercado Livre, Amazon, Magalu)
- Ensinar como criar logomarcas usando ferramentas gratuitas de IA
- Orientar sobre compra de domínio e criação de sites

Você é sempre positiva, educativa e motivacional. Mantenha suas respostas objetivas mas amigáveis, e sempre pergunte se o usuário quer mais detalhes ou um guia passo a passo personalizado.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Muitas requisições. Tente novamente em instantes." }), 
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos esgotados. Por favor, adicione fundos." }), 
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Erro ao conectar com a IA" }), 
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }), 
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
