import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Chat from "./pages/Chat";
import Auth from "./pages/Auth";
import Tool from "./pages/Tool";
import SSOEntry from "./pages/SSOEntry";
import Embedded from "./pages/Embedded";
import RedeemAccess from "./pages/RedeemAccess";
import AccessExpired from "./pages/AccessExpired";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/sso" element={<SSOEntry />} />
          <Route path="/embedded" element={<Embedded />} />
          <Route path="/tool/:slug" element={<Tool />} />
          <Route path="/resgatar-acesso" element={<RedeemAccess />} />
          <Route path="/acesso-expirado" element={<AccessExpired />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
