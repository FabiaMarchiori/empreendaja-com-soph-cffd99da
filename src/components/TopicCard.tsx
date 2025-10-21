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
      className="p-6 cursor-pointer transition-all hover:shadow-lg hover:scale-105 border-2 hover:border-primary group"
      style={{ transition: "var(--transition-smooth)" }}
    >
      <div className="flex flex-col items-center text-center space-y-3">
        <div className="p-4 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 group-hover:from-primary/20 group-hover:to-secondary/20 transition-all">
          <Icon className="w-8 h-8 text-primary" />
        </div>
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </Card>
  );
};
