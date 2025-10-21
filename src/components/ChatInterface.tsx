import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Send, Sparkles } from "lucide-react";
import { toast } from "sonner";

type Message = { role: "user" | "assistant"; content: string };

interface ChatInterfaceProps {
  selectedTopic?: string;
}

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
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-with-soph`;
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });

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
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4 shadow-primary">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Olá! Eu sou a Soph 👋</h3>
            <p className="text-muted-foreground max-w-md">
              Sua agente virtual de negócios. Estou aqui para ajudar você a crescer seu empreendimento!
            </p>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.role === "user"
                  ? "bg-gradient-to-br from-primary to-primary-glow text-white shadow-primary"
                  : "bg-card border border-border text-foreground"
              }`}
              style={{ transition: "var(--transition-smooth)" }}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-card border border-border rounded-2xl px-4 py-3">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-border bg-background">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua mensagem..."
            className="resize-none min-h-[60px] max-h-[120px]"
            disabled={isLoading}
          />
          <Button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="h-[60px] w-[60px] bg-gradient-to-br from-primary to-primary-glow shadow-primary hover:shadow-lg transition-all"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
