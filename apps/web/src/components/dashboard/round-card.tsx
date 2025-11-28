
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { RoundStatus } from "@/types";
import type { Id } from "@google-maestro-new/backend/convex/_generated/dataModel";
import { useNavigate } from "@tanstack/react-router";
import { CheckCircle2, ChevronRight, Clock, Lock, PlayCircle, Trophy } from 'lucide-react';
import { motion } from 'motion/react';
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";



interface RoundCardProps {
  _id: string;
  title: string;
  startAt: string;
  duration: string;
  status: RoundStatus;
  participants?: string[];
  maxScore?: number;
  participants?: Id<"users">[] | undefined;
}

export function RoundCard({ _id, title, startAt, duration, status, participants, maxScore }: RoundCardProps) {
  const navigate = useNavigate();

  const statusConfig = {
    LIVE: {
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/20',
      icon: <PlayCircle size={14} />,
      label: 'LIVE NOW',
      buttonText: 'Enter Arena',
      buttonVariant: 'default' as const,
      glow: true
    },
    UPCOMING: {
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      icon: <Clock size={14} />,
      label: 'UPCOMING',
      buttonText: 'Notify Me',
      buttonVariant: 'secondary' as const,
      glow: false
    },
    COMPLETED: {
      color: 'text-zinc-500',
      bg: 'bg-zinc-500/10',
      border: 'border-white/5',
      icon: <CheckCircle2 size={14} />,
      label: 'COMPLETED',
      buttonText: 'View Stats',
      buttonVariant: 'outline' as const,
      glow: false
    }
  };

  const config = statusConfig[status];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`group relative overflow-hidden rounded-xl border ${status === 'COMPLETED' ? 'bg-[#09090B] border-white/5' : 'bg-[#121214] border-white/10'} p-5 md:p-6 transition-all hover:border-white/20 flex flex-col h-full`}
    >
      {/* Live Glow Effect */}
      {config.glow && (
        <div className="absolute -top-12 -right-12 w-24 h-24 md:w-32 md:h-32 bg-orange-500/20 blur-[50px] md:blur-[60px] rounded-full pointer-events-none group-hover:bg-orange-500/30 transition-all" />
      )}

      {/* Header */}
      <div className="flex justify-between items-start mb-4 md:mb-6 relative z-10">
        <Badge variant="outline" className={`${config.bg} ${config.color} ${config.border} border gap-1.5 py-1 px-2 md:px-2.5 rounded-sm font-mono text-[10px] tracking-wider uppercase`}>
          <span className={`relative flex h-1.5 w-1.5`}>
            {status === 'LIVE' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>}
            <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${status === 'LIVE' ? 'bg-orange-500' : 'bg-current'}`}></span>
          </span>
          {config.label}
        </Badge>

        <span className="text-zinc-500 font-mono text-[10px] md:text-xs flex items-center gap-1">
          <Trophy size={12} />
          {status === 'COMPLETED' ? `Score: ${maxScore || '-'}` : 'Ranked'}
        </span>
      </div>

      {/* Content */}
      <div className="mb-6 md:mb-8 relative z-10 flex-grow">
        <h3 className="text-lg md:text-xl font-medium text-white mb-2 font-display tracking-tight group-hover:text-blue-400 transition-colors line-clamp-2">
          {title}
        </h3>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-zinc-500 text-[10px] md:text-xs font-mono">
            <Clock size={12} />
            <span>Starts: {startAt}</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-500 text-[10px] md:text-xs font-mono">
            <Clock size={12} />
            <span>Duration: {duration}</span>
          </div>
        </div>
      </div>

      {/* Footer / Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-auto pt-4 border-t border-white/5 relative z-10 gap-4 sm:gap-0">
        <div className="flex items-center gap-2">
          {/* Actual Avatar Stack */}
          <div className="flex -space-x-2 overflow-hidden pl-1">
            {participants?.map((_, i) => (
              <Avatar key={i} className="inline-block h-6 w-6 ring-2 ring-[#121214]">
                {/* Using random avatar service for demo */}
                <AvatarImage src={`https://i.pravatar.cc/150?u=${i + 1}`} />
                <AvatarFallback className="bg-zinc-800 text-[8px] text-zinc-400 font-mono">{i + 1}</AvatarFallback>
              </Avatar>
            ))}
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">
            +{participants?.length}
          </span>
        </div>

        <Button
          variant={config.buttonVariant === 'default' ? 'default' : 'outline'}
          onClick={() => navigate({ to: `/user/round/${_id}` })}
          disabled={status === 'COMPLETED' || status === 'UPCOMING'}
          className={`
                w-full sm:w-auto h-8 md:h-9 text-xs font-medium uppercase tracking-wide rounded-sm gap-2
                ${status === 'LIVE' ? 'bg-[#FF4F00] hover:bg-[#E64600] text-white border-0' : ''}
                ${status === 'UPCOMING' ? 'bg-white text-black hover:bg-zinc-200 border-0' : ''}
                ${status === 'COMPLETED' ? 'text-zinc-400 border-white/10 hover:bg-white/5 hover:text-white' : ''}
            `}
        >
          {config.buttonText}
          {status === 'LIVE' ? <ChevronRight size={14} /> : null}
          {status === 'UPCOMING' ? <Lock size={12} /> : null}
        </Button>
      </div>
    </motion.div>
  );
}