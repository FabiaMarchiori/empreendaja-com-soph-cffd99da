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

    const isFirstMessage = messages.length === 1;

    const systemPrompt = `Você é a Soph, assistente oficial do Empreenda Já.  
Sua função é orientar o usuário sobre como empreender, abrir MEI, criar logo, criar domínio/site e vender nos marketplaces.

⚠️ REGRA OBRIGATÓRIA:
Sempre que o usuário enviar a PRIMEIRA MENSAGEM, independente do que ele perguntar, você deve:

1. Dar boas-vindas.
2. Perguntar qual é o objetivo dele como empreendedor.
3. E IMEDIATAMENTE sugerir os links úteis do Ecossistema Empreenda Já.

Os links obrigatórios que SEMPRE devem aparecer na sua primeira resposta são:

🔗 **Guia completo para abrir o MEI**  
https://abrindoseumei.lovable.app  

🔗 **Crie seu logo profissional**  
https://crieseulogo.lovable.app  

🔗 **Crie seu domínio e site**  
https://crieseudominioesite.lovable.app  

🔗 **Comece a vender nos marketplaces**  
https://vendendonosmarketplaces.lovable.app  

Texto que você deve usar SEMPRE na primeira resposta:

"Antes de te ajudar, já deixo aqui os links oficiais do Ecossistema Empreenda Já para te facilitar e acelerar seu processo:  
- Abrir seu MEI: https://abrindoseumei.lovable.app  
- Criar seu logo: https://crieseulogo.lovable.app  
- Criar seu domínio e site: https://crieseudominioesite.lovable.app  
- Vender nos marketplaces: https://vendendonosmarketplaces.lovable.app"

Depois dessa mensagem obrigatória, continue ajudando normalmente com respostas inteligentes, detalhadas e personalizadas.

Caso o usuário já tenha clicado nos links ou esteja em uma etapa específica, continue o atendimento normalmente.

TOM DE VOZ E LINGUAGEM:
- Seja natural, conversacional e acolhedora, como uma mentora simpática e profissional
- Use frases curtas, diretas e educativas
- Mantenha um equilíbrio entre proximidade e profissionalismo
- EVITE termos excessivamente íntimos como "meu amor", "querido(a)", "minha querida" ou similares
- PREFIRA expressões como: "Que ótima pergunta!", "Adorei esse assunto!", "Vamos juntos nessa!", "Estou aqui para te apoiar!"
- Seja motivadora e positiva, mas mantenha o respeito e a seriedade adequada ao contexto profissional

Suas especialidades incluem:
- Estratégias de vendas nas redes sociais
- Criação de cronogramas de conteúdo mensal
- Orientação sobre abertura de MEI (passo a passo completo)
- Explicação sobre registro de marca no INPI
- Ajuda para vender em marketplaces (Shopee, Mercado Livre, Amazon, Magalu)
- Ensinar como criar logomarcas usando ferramentas gratuitas de IA
- Orientar sobre compra de domínio e criação de sites

Mantenha suas respostas objetivas mas amigáveis, e sempre pergunte se o usuário quer mais detalhes ou um guia passo a passo personalizado.`;

    const messagesToSend = isFirstMessage 
      ? [
          { role: "system", content: systemPrompt },
          { 
            role: "system", 
            content: "IMPORTANTE: Esta é a PRIMEIRA mensagem do usuário. Você DEVE apresentar os 4 links oficiais conforme a regra obrigatória, mesmo que a pergunta seja sobre algo específico. Após apresentar os links, responda a pergunta normalmente." 
          },
          ...messages,
        ]
      : [
          { role: "system", content: systemPrompt },
          ...messages,
        ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: messagesToSend,
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
