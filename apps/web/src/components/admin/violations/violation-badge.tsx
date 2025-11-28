import { Badge } from "@/components/ui/badge";
import { AlertTriangle, EyeOff, Laptop, Maximize, MousePointer2 } from "lucide-react";

export const ViolationBadge = ({ type }: { type: string }) => {
  const config: Record<string, { color: string; icon: any; label: string }> = {
    TAB_SWITCH: {
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
      icon: EyeOff,
      label: "Focus Lost"
    },
    FULLSCREEN_EXIT: {
      color: "text-orange-500 bg-orange-500/10 border-orange-500/20",
      icon: Maximize,
      label: "Fullscreen Exit"
    },
    MOUSE_LEAVE: {
      color: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20",
      icon: MousePointer2,
      label: "Cursor Exit"
    },
    DEV_TOOLS: {
      color: "text-red-500 bg-red-500/10 border-red-500/20",
      icon: Laptop,
      label: "Dev Tools Open"
    },
    DEFAULT: {
      color: "text-zinc-500 bg-zinc-500/10 border-zinc-500/20",
      icon: AlertTriangle,
      label: type
    },
  };

  const style = config[type] || config.DEFAULT;
  const Icon = style.icon;

  return (
    <Badge variant="outline" className={`${style.color} font-mono uppercase text-[10px] tracking-wider gap-1.5 py-1 rounded-sm`}>
      <Icon size={12} />
      {style.label}
    </Badge>
  );
};