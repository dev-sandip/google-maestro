import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { Doc, Id } from '@google-maestro-new/backend/convex/_generated/dataModel';
import { Link } from '@tanstack/react-router';
import {
  Calendar,
  Clock,
  Edit3,
  Key,
  Plus,
  Radio,
  Terminal,
  Trash2,
  Trophy,
  Users
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { DeleteDialog } from '../delete-dialog';

interface RoundListViewProps {
  onCreate: () => void;
  onEdit: (id: Id<"rounds">) => void;
  onLive: (id: Id<"rounds">) => void;
  onDelete: (id: Id<"rounds">) => void;
  onAddParticipants: (id: Id<"rounds">) => void; // Added Prop
  rounds: Doc<"rounds">[];
}

export function RoundListView({ onCreate, onEdit, onLive, onDelete, onAddParticipants, rounds }: RoundListViewProps) {

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'LIVE': return { badge: 'text-orange-500 bg-orange-500/10 border-orange-500/20', indicator: 'bg-orange-500' };
      case 'UPCOMING': return { badge: 'text-blue-500 bg-blue-500/10 border-blue-500/20', indicator: 'bg-blue-500' };
      case 'COMPLETED': return { badge: 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20', indicator: 'bg-zinc-500' };
      default: return { badge: 'text-zinc-400 bg-zinc-500/10 border-white/5', indicator: 'bg-zinc-600' };
    }
  };

  const copyCode = (e: React.MouseEvent, code: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    toast.success("Room code copied");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      {/* Page Action Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-display font-medium text-white mb-2">Operations</h1>
          <p className="text-zinc-500 text-sm">Manage competitive rounds and configurations.</p>
        </div>
        <Button onClick={onCreate} className="bg-white text-black hover:bg-zinc-200">
          <Plus size={16} className="mr-2" /> Create Round
        </Button>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {rounds.map((round) => {
          const statusStyle = getStatusStyle(round.status);

          return (
            <div key={round._id} className="group relative flex flex-col bg-[#121214] border border-white/5 hover:border-white/10 rounded-xl p-5 transition-all">

              {/* --- TOP: Info & Status --- */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-zinc-900 rounded-lg flex items-center justify-center border border-white/5 shrink-0">
                    <Terminal size={20} className="text-zinc-500 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white leading-tight mb-1">{round.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider border ${statusStyle.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.indicator} ${round.status === 'LIVE' ? 'animate-pulse' : ''}`} />
                        {round.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* --- MIDDLE: Metadata Grid --- */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="flex flex-col p-3 bg-zinc-900/30 rounded border border-white/5">
                  <span className="text-[10px] text-zinc-500 uppercase font-mono mb-1">Scheduled</span>
                  <div className="flex items-center gap-2 text-xs text-zinc-300">
                    <Calendar size={12} /> {round.startAt}
                  </div>
                </div>

                <div className="flex flex-col p-3 bg-zinc-900/30 rounded border border-white/5">
                  <span className="text-[10px] text-zinc-500 uppercase font-mono mb-1">Access Code</span>
                  <div
                    className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer hover:text-white transition-colors"
                    onClick={(e) => copyCode(e, round.roomCode ?? "")}
                  >
                    <Key size={12} />
                    <span className="tracking-widest font-mono text-orange-500">{round.roomCode || "----"}</span>
                  </div>
                </div>

                <div className="col-span-2 flex flex-col p-3 bg-zinc-900/30 rounded border border-white/5">
                  <span className="text-[10px] text-zinc-500 uppercase font-mono mb-1">Census</span>
                  <div className="flex items-center gap-2 text-xs text-zinc-300">
                    <Clock size={12} /> {round.participants?.length || 0} People Registered
                  </div>
                </div>
              </div>

              {/* --- BOTTOM: Actions --- */}
              <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">

                {/* Left: Management Tools */}
                <div className="flex items-center gap-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/5"
                          onClick={() => onAddParticipants(round._id)}
                        >
                          <Users size={16} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent><p>Manage Participants</p></TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/5"
                          onClick={() => onEdit(round._id)}
                        >
                          <Edit3 size={16} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent><p>Edit Configuration</p></TooltipContent>
                    </Tooltip>

                    <DeleteDialog
                      title="Delete round?"
                      description="This will permanently delete the round and all associated data."
                      onConfirm={() => onDelete(round._id)}
                      trigger={
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-red-500 hover:bg-red-500/10">
                          <Trash2 size={16} />
                        </Button>
                      }
                    />
                  </TooltipProvider>
                </div>

                {/* Right: Primary Action */}
                <div className="flex items-center gap-2">
                  <Link to={`/admin/leaderboard/${round._id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`h-8 border-white/10 font-mono text-xs ${round.status === 'COMPLETED' ? 'text-white border-white/20' : 'text-zinc-500'}`}
                    >
                      <Trophy size={14} className="mr-2" /> Results
                    </Button>
                  </Link>

                  {round.status === 'LIVE' && (
                    <Button
                      size="sm"
                      onClick={() => onLive(round._id)}
                      className="h-8 bg-orange-600 hover:bg-orange-700 text-white border-0 font-mono text-xs uppercase"
                    >
                      <Radio size={14} className="mr-2 animate-pulse" /> Control
                    </Button>
                  )}
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}