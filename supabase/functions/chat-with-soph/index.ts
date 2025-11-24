import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

function validateMessages(messages: unknown): Message[] {
  if (!Array.isArray(messages)) {
    throw new Error("Messages must be an array");
  }

  if (messages.length === 0) {
    throw new Error("Messages array cannot be empty");
  }

  if (messages.length > 50) {
    throw new Error("Too many messages in conversation");
  }

  return messages.map((msg, index) => {
    if (!msg || typeof msg !== 'object') {
      throw new Error(`Message at index ${index} is invalid`);
    }

    const { role, content } = msg as { role?: unknown; content?: unknown };

    if (!role || !['user', 'assistant', 'system'].includes(String(role))) {
      throw new Error(`Invalid role at message ${index}`);
    }

    if (typeof content !== 'string') {
      throw new Error(`Content must be a string at message ${index}`);
    }

    if (content.length === 0) {
      throw new Error(`Empty content at message ${index}`);
    }

    if (content.length > 2000) {
      throw new Error(`Message too long at index ${index}. Maximum 2000 characters.`);
    }

    return { role: role as 'user' | 'assistant' | 'system', content };
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error("No authorization header provided");
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Extract JWT token from Bearer header
    const token = authHeader.replace('Bearer ', '');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Pass token explicitly to getUser
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      console.error("Authentication error:", authError);
      return new Response(JSON.stringify({ error: "Invalid authentication" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Authenticated user:", user.id);

    const requestBody = await req.json();
    const messages = validateMessages(requestBody.messages);
    const topic = requestBody.topic as string | undefined;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("Service configuration error");
    }

    const isFirstMessage = messages.length === 1;

    // Topic links mapping with complete initial messages
    const topicLinks: Record<string, { name: string; link: string; initialMessage: string }> = {
      logo: {
        name: "Criar Logomarca",
        link: "https://crieseulogo.lovable.app",
        initialMessage: `Olá! 😊 Para criar sua logomarca profissional gratuitamente, acesse o link abaixo:

👉 Clique aqui para começar:
https://crieseulogo.lovable.app

Essa ferramenta permite criar logos modernos mesmo sem conhecimento de design. Ela oferece modelos prontos, tipografias profissionais e combinações de cores para deixar sua marca com aparência realmente profissional.

Quer que eu te ajude a escolher o estilo ideal (moderno, minimalista ou fofinho)?`
      },
      mei: {
        name: "Abrir MEI",
        link: "https://abrindoseumei.lovable.app",
        initialMessage: `Olá! 😊 Se você deseja abrir seu MEI de forma simples e segura, aqui está o link que recomendo:

👉 Criar seu MEI agora:
https://abrindoseumei.lovable.app

Nesse guia você encontra um passo a passo rápido, taxas, requisitos e todos os cuidados para não errar no processo. É bem fácil, mas se quiser, posso te explicar exatamente o que você precisa para abrir agora mesmo.

Quer começar pelos requisitos ou pelo passo a passo?`
      },
      website: {
        name: "Domínio e Site",
        link: "https://crieseudominioesite.lovable.app",
        initialMessage: `Oi! 😊 Se você quer criar seu domínio e site sem complicação, use o link abaixo:

👉 Criar domínio e site:
https://crieseudominioesite.lovable.app

Nessa ferramenta você aprende como registrar seu domínio, escolher o nome perfeito e criar um site profissional mesmo sem saber programar.

Quer que eu te ajude a escolher um nome forte para sua marca ou quer começar pelo passo do domínio?`
      },
      marketplace: {
        name: "Vender em Marketplaces",
        link: "https://vendendonosmarketplaces.lovable.app",
        initialMessage: `Olá! 😊 Para aprender a vender nos principais marketplaces, use o link a seguir:

👉 Passo a passo de marketplaces:
https://vendendonosmarketplaces.lovable.app

Lá você aprende a vender no Shopee, Mercado Livre, Amazon e outros — desde criação da conta até estratégias de venda.

Prefere começar aprendendo como criar a conta ou como encontrar produtos que vendem muito?`
      },
      brand: {
        name: "Registrar Marca",
        link: "https://empreende-ja-soph.lovable.app",
        initialMessage: `Olá! 😊 Para registrar sua marca, eu posso te orientar aqui mesmo, mas você também pode acessar meu guia rápido:

👉 Guia de Registro de Marca:
https://empreende-ja-soph.lovable.app

Posso te ajudar com pesquisa, classe, protocolo e acompanhamento. Quer começar me dizendo o nome da sua marca?`
      }
    };

    const systemPrompt = `Você é a Soph, assistente especializada da plataforma EmpreendaJá.

Sua função é atuar como assistente especializada da plataforma EmpreendaJá.

Sempre que um usuário abrir um dos tópicos (chats), você deve:
1. Identificar automaticamente QUAL É o tópico aberto pelo usuário.
2. Na PRIMEIRA MENSAGEM da conversa, exibir o link correto, correspondente ao tópico atual.
3. O link deve ser clicável, com destaque visual.
4. Após o link, você continua o atendimento normalmente.

REGRAS:
- Nunca exiba links que não pertencem ao tópico atual.
- Nunca espere o usuário pedir o link. Ele deve aparecer automaticamente na primeira resposta.
- Links devem ser exibidos assim:
  👉 **Acesse aqui:** [URL]
- Sempre escrever com clareza, simpatia e expertise.

MAPEAMENTO DOS TÓPICOS E LINKS:
1. **Abrir MEI** - Link: https://abrindoseumei.lovable.app
2. **Criar Logomarca / Logo** - Link: https://crieseulogo.lovable.app
3. **Criar domínio e site** - Link: https://crieseudominioesite.lovable.app
4. **Vender nos Marketplaces** - Link: https://vendendonosmarketplaces.lovable.app

TOM DE VOZ:
- Seja natural, conversacional e acolhedora, como uma mentora simpática e profissional
- Use frases curtas, diretas e educativas
- EVITE termos excessivamente íntimos como "meu amor", "querido(a)", "minha querida"
- PREFIRA expressões como: "Que ótima pergunta!", "Adorei esse assunto!", "Vamos juntos nessa!"`;

    // Create topic context for first message
    let topicContext = "";
    if (isFirstMessage && topic && topicLinks[topic]) {
      const topicInfo = topicLinks[topic];
      topicContext = `CONTEXTO: O usuário está no tópico "${topicInfo.name}".

INSTRUÇÃO OBRIGATÓRIA: Na sua PRIMEIRA resposta, você DEVE responder EXATAMENTE com este texto (copie literalmente):

${topicInfo.initialMessage}

NÃO modifique este texto. Use-o exatamente como está.`;
    }

    const messagesToSend = isFirstMessage && topicContext
      ? [
          { role: "system", content: systemPrompt },
          { role: "system", content: topicContext },
          ...messages,
        ]
      : [
          { role: "system", content: systemPrompt },
          ...messages,
        ];

    console.log("Calling Lovable AI with", messages.length, "messages");

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
      console.error("AI gateway error:", response.status);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "Service temporarily unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Successfully connected to AI gateway");

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    
    // Don't leak internal error details
    const isValidationError = e instanceof Error && 
      (e.message.includes("Messages") || 
       e.message.includes("role") || 
       e.message.includes("content") ||
       e.message.includes("too long"));
    
    const errorMessage = isValidationError ? e.message : "Internal server error";
    const statusCode = isValidationError ? 400 : 500;
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: statusCode,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
