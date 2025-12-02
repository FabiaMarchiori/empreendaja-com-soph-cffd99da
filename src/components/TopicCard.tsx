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
                 h-full min-h-[160px] sm:min-h-[180px] md:min-h-[200px] lg:min-h-[220px] 
                 rounded-[20px] backdrop-blur-xl
                 bg-gradient-to-b from-[#060F3A] to-[#0C2148]
                 border border-[#060F3A]/30
                 shadow-[0_0_30px_rgba(6,15,58,0.3),inset_0_0_30px_rgba(255,255,255,0.02)]
                 hover:border-[#184160]/50 
                 hover:shadow-[0_0_40px_rgba(24,65,96,0.4),0_0_60px_rgba(12,33,72,0.3),inset_0_0_40px_rgba(255,255,255,0.04)]
                 hover:-translate-y-2 transition-all duration-500"
    >
      {/* Brilho interno central */}
      <div className="absolute inset-0 rounded-[20px] pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                        w-40 h-40 bg-gradient-radial from-white/8 via-[#184160]/10 to-transparent 
                        blur-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
      </div>
      
      {/* Glow azul na borda superior */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] 
                      bg-gradient-to-r from-transparent via-[#184160]/40 to-transparent 
                      group-hover:via-[#184160]/70 transition-all duration-500" />

      {/* Conteúdo */}
      <div className="relative flex flex-col items-center text-center h-full justify-between space-y-3 sm:space-y-4">
        {/* Ícone Azul Yale Profundo (#184160) */}
        <div className="relative flex-shrink-0">
          {/* Glow atrás do ícone */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0C2148] via-[#184160] to-[#060F3A] 
                          opacity-30 blur-2xl group-hover:opacity-50 group-hover:blur-3xl
                          transition-all duration-500 scale-150" />
          <div className="relative p-3 sm:p-4 md:p-5 rounded-xl 
                          bg-white/10 backdrop-blur-sm
                          group-hover:bg-white/15 group-hover:scale-110 transition-all duration-500">
            <Icon className="w-7 h-7 sm:w-9 sm:h-9 md:w-11 md:h-11 text-[#184160] 
                            drop-shadow-[0_0_15px_rgba(24,65,96,0.6)]
                            group-hover:drop-shadow-[0_0_20px_rgba(24,65,96,0.8)]
                            transition-all duration-500" />
          </div>
        </div>

        {/* Título branco (#FFFFFF), descrição branco 70% */}
        <div className="flex-grow flex flex-col justify-center">
          <h3 className="font-bold text-sm sm:text-base md:text-lg text-white 
                         group-hover:text-white transition-colors line-clamp-1">{title}</h3>
          <p className="text-xs sm:text-sm text-white/70 mt-2 
                        group-hover:text-white/80 transition-colors leading-relaxed line-clamp-2">{description}</p>
        </div>
      </div>
    </Card>
  );
};
