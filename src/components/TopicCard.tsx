import { LucideIcon } from "lucide-react";
import { Card } from "./ui/card";

interface TopicCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick: () => void;
}

export const TopicCard = ({ icon: Icon, title, description, onClick }: TopicCardProps) => {
  return (
    <Card
      onClick={onClick}
      className="relative p-4 sm:p-5 md:p-6 lg:p-8 cursor-pointer group overflow-hidden 
                 h-full min-h-[160px] sm:min-h-[180px] md:min-h-[200px] lg:min-h-[220px] rounded-2xl
                 bg-gradient-to-br from-slate-900/80 via-purple-900/60 to-slate-900/80
                 backdrop-blur-xl border border-purple-500/20
                 hover:border-purple-400/50 
                 hover:shadow-[0_0_40px_rgba(139,92,246,0.4),0_0_80px_rgba(168,85,247,0.2)]
                 hover:-translate-y-2 transition-all duration-500"
    >
      {/* Animated Gradient Border */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 rounded-2xl animate-border-glow" />
      </div>
      
      {/* Inner Glow on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20 
                      opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
      
      {/* Spotlight Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 
                        bg-gradient-radial from-white/10 via-transparent to-transparent blur-xl" />
      </div>

      {/* Conteúdo */}
      <div className="relative flex flex-col items-center text-center h-full justify-between space-y-3 sm:space-y-4">
        {/* Ícone com Glow */}
        <div className="relative flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-accent 
                          opacity-40 blur-2xl group-hover:blur-3xl group-hover:opacity-60 
                          transition-all duration-500 scale-150" />
          <div className="relative p-3 sm:p-4 md:p-5 rounded-2xl 
                          bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 
                          group-hover:from-primary/30 group-hover:via-secondary/30 group-hover:to-accent/30 
                          group-hover:scale-110 transition-all duration-500">
            <Icon className="w-7 h-7 sm:w-9 sm:h-9 md:w-11 md:h-11 text-white 
                            drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
          </div>
        </div>

        {/* Texto com transição de cor */}
        <div className="flex-grow flex flex-col justify-center">
          <h3 className="font-bold text-sm sm:text-base md:text-lg text-white 
                         group-hover:text-white transition-colors line-clamp-1">{title}</h3>
          <p className="text-xs sm:text-sm text-white/60 mt-2 
                        group-hover:text-white/80 transition-colors leading-relaxed line-clamp-2">{description}</p>
        </div>
      </div>
    </Card>
  );
};
