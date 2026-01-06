import React from "react";

interface PremiumTopicCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  badge?: string;
  onClick: () => void;
}

export const PremiumTopicCard = ({ 
  icon: Icon, 
  title, 
  description, 
  badge = "Ferramenta Avançada",
  onClick 
}: PremiumTopicCardProps) => {
  return (
    <div
      onClick={onClick}
      className="relative p-4 sm:p-5 md:p-6 lg:p-8 cursor-pointer group overflow-hidden 
                 h-full min-h-[160px] sm:min-h-[180px] md:min-h-[200px] lg:min-h-[220px] 
                 card-glass-neon-premium"
    >
      {/* Badge Premium */}
      <div className="absolute top-3 right-3 z-10">
        <span className="badge-premium">{badge}</span>
      </div>

      {/* Brilho interno verde */}
      <div className="absolute inset-0 rounded-[18px] pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                        w-40 h-40 bg-gradient-radial from-[#00FF88]/15 via-[#00CC6A]/8 to-transparent 
                        blur-2xl opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
      
      {/* Glow verde na borda superior */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] 
                      bg-gradient-to-r from-transparent via-[#00FF88]/70 to-transparent 
                      group-hover:via-[#00FF88] transition-all duration-500" />

      {/* Conteúdo */}
      <div className="relative flex flex-col items-center text-center h-full justify-between space-y-3 sm:space-y-4 pt-4">
        {/* Ícone Verde Neon */}
        <div className="relative flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#00FF88]/30 via-[#00CC6A]/20 to-[#00FF88]/10 
                          opacity-50 blur-2xl group-hover:opacity-80 group-hover:blur-3xl
                          transition-all duration-500 scale-150" />
          <div className="relative p-3 sm:p-4 md:p-5 rounded-xl 
                          bg-[#00FF88]/15 backdrop-blur-sm border border-[#00FF88]/30
                          group-hover:bg-[#00FF88]/25 group-hover:border-[#00FF88]/50 
                          group-hover:scale-110 transition-all duration-500">
            <Icon className="w-7 h-7 sm:w-9 sm:h-9 md:w-11 md:h-11 icon-neon-green
                            group-hover:drop-shadow-[0_0_25px_rgba(0,255,136,0.9)]
                            transition-all duration-500" />
          </div>
        </div>

        {/* Título e descrição */}
        <div className="flex-grow flex flex-col justify-center">
          <h3 className="font-bold text-sm sm:text-base md:text-lg text-[#E9FFF2] 
                         group-hover:text-white transition-colors line-clamp-1">{title}</h3>
          <p className="text-xs sm:text-sm text-[#A9D9C4] mt-2 
                        group-hover:text-[#C8F0D8] transition-colors leading-relaxed line-clamp-2">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};
