import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Send, Sparkles, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Message = { role: "user" | "assistant"; content: string };

interface ChatInterfaceProps {
  selectedTopic?: string;
}

// Função para detectar e renderizar links como botões
const renderMessageContent = (content: string) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = content.split(urlRegex);
  
  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 my-2 px-4 py-2.5 bg-gradient-to-r from-primary via-secondary to-accent text-white font-medium rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
          style={{ backgroundSize: '200% 200%' }}
        >
          <ExternalLink className="w-4 h-4" />
          Acessar Ferramenta
        </a>
      );
    }
    return <span key={index}>{part}</span>;
  });
};

export const ChatInterface = ({ selectedTopic }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (selectedTopic) {
      const topicMessages: Record<string, string> = {
        sales: "Como posso aumentar minhas vendas nas redes sociais?",
        content: "Pode me ajudar a criar um cronograma de postagens?",
        mei: "Quero abrir meu MEI. Por onde começo?",
        brand: "Como faço para registrar minha marca?",
        marketplace: "Quero vender em marketplaces. Qual o primeiro passo?",
        logo: "Como criar uma logomarca profissional de graça?",
        website: "Preciso de um site para meu negócio. Como faço?"
      };
      
      const message = topicMessages[selectedTopic];
      if (message) {
        sendMessage(message);
      }
    }
  }, [selectedTopic]);

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText) return;
    
    // Validate input length (max 2000 characters)
    if (messageText.length > 2000) {
      toast.error("Mensagem muito longa. Máximo de 2000 caracteres.");
      return;
    }

    const userMsg: Message = { role: "user", content: messageText };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    let assistantContent = "";
    const upsertAssistant = (chunk: string) => {
      assistantContent += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => 
            i === prev.length - 1 ? { ...m, content: assistantContent } : m
          );
        }
        return [...prev, { role: "assistant", content: assistantContent }];
      });
    };

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Você precisa estar autenticado para enviar mensagens.");
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('chat-with-soph', {
        body: { 
          messages: [...messages, userMsg],
          topic: selectedTopic
        }
      });

      if (error) {
        if (error.message?.includes('429')) {
          toast.error("Muitas requisições. Aguarde um momento.");
        } else if (error.message?.includes('402')) {
          toast.error("Créditos esgotados.");
        } else {
          toast.error("Erro ao processar mensagem.");
        }
        setIsLoading(false);
        return;
      }

      const response = data as Response;

      if (!response.ok) {
        if (response.status === 429) {
          toast.error("Muitas requisições. Aguarde um momento.");
        } else if (response.status === 402) {
          toast.error("Créditos esgotados.");
        } else {
          toast.error("Erro ao processar mensagem.");
        }
        setIsLoading(false);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Stream não disponível");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        
        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) upsertAssistant(content);
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Erro ao conectar com a Soph.");
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-scale-in">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary opacity-50 blur-2xl animate-glow-pulse"></div>
              <div className="relative w-24 h-24 rounded-3xl glass-strong p-2">
                <div className="w-full h-full rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center animate-gradient-shift" style={{ backgroundSize: '200% 200%' }}>
                  <Sparkles className="w-12 h-12 text-white animate-pulse" />
                </div>
              </div>
            </div>
            <h3 className="text-3xl font-bold mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Olá! Eu sou a Soph 👋
            </h3>
            <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
              Sua agente virtual de negócios. Estou aqui para ajudar você a crescer seu empreendimento!
            </p>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"} animate-slide-in-up`}
          >
            {msg.role === "assistant" && (
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-xl glass-strong p-1.5">
                  <div className="w-full h-full rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center animate-glow-pulse">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            )}
            <div
              className={`max-w-[75%] rounded-2xl px-5 py-4 ${
                msg.role === "user"
                  ? "bg-gradient-to-br from-primary via-secondary to-accent text-white shadow-primary animate-gradient-shift"
                  : "glass-strong text-foreground"
              }`}
              style={{ 
                transition: "var(--transition-smooth)",
                ...(msg.role === "user" && { backgroundSize: '200% 200%' })
              }}
            >
              <div className="whitespace-pre-wrap leading-relaxed">
                {renderMessageContent(msg.content)}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-3 justify-start animate-slide-in-up">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-xl glass-strong p-1.5">
                <div className="w-full h-full rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center animate-glow-pulse">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
            <div className="glass-strong rounded-2xl px-5 py-4">
              <div className="flex gap-2">
                <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div className="w-3 h-3 bg-secondary rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                <div className="w-3 h-3 bg-accent rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="p-6 border-t border-border/50 glass-strong">
        <div className="flex gap-3">
          <div className="relative flex-1 group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-accent opacity-0 group-focus-within:opacity-100 blur-xl transition-opacity duration-500"></div>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite sua mensagem (máx. 2000 caracteres)..."
              className="relative resize-none min-h-[70px] max-h-[140px] glass border-2 focus:border-primary/50 transition-all duration-300"
              disabled={isLoading}
              maxLength={2000}
            />
          </div>
          <Button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="relative h-[70px] w-[70px] bg-gradient-to-br from-primary via-secondary to-accent shadow-primary hover:shadow-2xl transition-all duration-300 group overflow-hidden"
            style={{ backgroundSize: '200% 200%' }}
          >
            <span className="absolute inset-0 bg-gradient-to-br from-accent via-secondary to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ backgroundSize: '200% 200%' }}></span>
            <Send className="relative w-6 h-6 z-10 group-hover:scale-110 transition-transform" />
          </Button>
        </div>
      </div>
    </div>
  );
};
