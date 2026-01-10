import { LucideIcon } from "lucide-react";

interface TopicCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick: () => void;
}

export const TopicCard = ({ icon: Icon, title, description, onClick }: TopicCardProps) => {
  return (
    <div
      onClick={onClick}
      className="relative p-4 sm:p-5 md:p-6 lg:p-8 cursor-pointer group overflow-hidden 
                 h-full min-h-[160px] sm:min-h-[180px] md:min-h-[200px] lg:min-h-[220px] 
                 card-glass-neon"
    >
      {/* Brilho interno central - CIANO */}
      <div className="absolute inset-0 rounded-[18px] pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                        w-40 h-40 bg-gradient-radial from-[#00E5FF]/10 via-[#00C2D1]/5 to-transparent 
                        blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
      
      {/* Glow ciano na borda superior */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] 
                      bg-gradient-to-r from-transparent via-[#00E5FF]/50 to-transparent 
                      group-hover:via-[#00E5FF]/90 transition-all duration-500" />

      {/* Conteúdo */}
      <div className="relative flex flex-col items-center text-center h-full justify-between space-y-3 sm:space-y-4">
        {/* Ícone Neon Ciano (#00E5FF) */}
        <div className="relative flex-shrink-0">
          {/* Glow atrás do ícone */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#00E5FF]/30 via-[#00C2D1]/20 to-[#00E5FF]/10 
                          opacity-40 blur-2xl group-hover:opacity-70 group-hover:blur-3xl
                          transition-all duration-500 scale-150" />
          <div className="relative p-3 sm:p-4 md:p-5 rounded-xl 
                          bg-[#00E5FF]/10 backdrop-blur-sm border border-[#00E5FF]/20
                          group-hover:bg-[#00E5FF]/20 group-hover:border-[#00E5FF]/40 
                          group-hover:scale-110 transition-all duration-500">
            <Icon className="w-7 h-7 sm:w-9 sm:h-9 md:w-11 md:h-11 icon-neon-cyan
                            group-hover:drop-shadow-[0_0_20px_rgba(0,229,255,0.8)]
                            transition-all duration-500" />
          </div>
        </div>

        {/* Título (#FFFFFF), descrição (#D6EAF2) */}
        <div className="flex-grow flex flex-col justify-center">
          <h3 className="font-bold text-sm sm:text-base md:text-lg text-white 
                         group-hover:text-white transition-colors line-clamp-1">{title}</h3>
          <p className="text-xs sm:text-sm text-[#D6EAF2] mt-2 
                        group-hover:text-[#E9F7FF] transition-colors leading-relaxed line-clamp-2">{description}</p>
        </div>
      </div>
    </div>
  );
};
