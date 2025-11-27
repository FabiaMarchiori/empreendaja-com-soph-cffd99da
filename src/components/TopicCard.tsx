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
      className="relative p-3 sm:p-4 md:p-6 lg:p-8 cursor-pointer group overflow-hidden glass hover:glass-strong border-2 border-transparent hover:border-primary/50"
      style={{ transition: "var(--transition-bounce)" }}
    >
      {/* Animated Gradient Border Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-accent opacity-20 animate-gradient-shift" style={{ backgroundSize: '200% 200%' }}></div>
      </div>
      
      {/* Spotlight Effect on Hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-radial from-primary/10 via-transparent to-transparent"></div>
      </div>

      <div className="relative flex flex-col items-center text-center space-y-4">
        {/* 3D Icon with Glow Effect */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-accent opacity-50 blur-xl group-hover:blur-2xl transition-all duration-500 animate-gradient-shift" style={{ backgroundSize: '200% 200%' }}></div>
          <div className="relative p-2 sm:p-3 md:p-4 lg:p-5 rounded-2xl bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 group-hover:from-primary/30 group-hover:via-secondary/30 group-hover:to-accent/30 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 animate-gradient-shift" style={{ transition: "var(--transition-bounce)", backgroundSize: '200% 200%' }}>
            <Icon className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white glow-text transition-colors duration-500" />
          </div>
        </div>

        {/* Title and Description */}
        <h3 className="font-bold text-sm sm:text-base md:text-lg lg:text-xl text-foreground group-hover:text-primary transition-colors duration-300">{title}</h3>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2">{description}</p>
      </div>

      {/* Expanding Shadow on Hover */}
      <div className="absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ boxShadow: 'var(--shadow-primary)' }}></div>
    </Card>
  );
};
