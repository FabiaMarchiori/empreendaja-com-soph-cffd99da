import { ChatInterface } from "@/components/ChatInterface";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

const Chat = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const topic = searchParams.get("topic") || undefined;

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-primary">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <div>
              <h1 className="font-semibold">Soph</h1>
              <p className="text-xs text-muted-foreground">Sua agente virtual de negócios</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        <ChatInterface selectedTopic={topic} />
      </main>
    </div>
  );
};

export default Chat;
