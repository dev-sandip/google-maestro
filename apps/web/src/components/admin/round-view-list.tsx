import { Button } from '@/components/ui/button';
import type { Doc, Id } from '@google-maestro-new/backend/convex/_generated/dataModel';
import { Calendar, Clock, Edit3, Plus, Radio, Terminal, Trophy } from 'lucide-react';
import { motion } from 'motion/react';
import { DeleteDialog } from '../delete-dialog';

interface RoundListViewProps {
  onCreate: () => void;
  onEdit: (id: Id<"rounds">) => void;
  onLive: (id: Id<"rounds">) => void;
  onDelete: (id: Id<"rounds">) => void;
  rounds: Doc<"rounds">[];
}

export function RoundListView({ onCreate, onEdit, onLive, onDelete, rounds }: RoundListViewProps) {

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'LIVE': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'UPCOMING': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'COMPLETED': return 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20';
      default: return 'text-zinc-400 bg-zinc-500/10 border-white/5';
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-display font-medium text-white mb-2">Operations</h1>
          <p className="text-zinc-500 text-sm">Manage competitive rounds and configurations.</p>
        </div>
        <Button onClick={onCreate} className="bg-white text-black hover:bg-zinc-200">
          <Plus size={16} className="mr-2" /> Create Round
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {rounds.map((round) => (
          <div key={round._id} className="group relative bg-[#121214] border border-white/5 hover:border-white/10 rounded-xl p-6 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4">

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-zinc-900 rounded-lg flex items-center justify-center border border-white/5">
                <Terminal size={20} className="text-zinc-500" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-white">{round.title}</h3>
                <div className="flex items-center gap-4 mt-1 text-xs text-zinc-500 font-mono">
                  <span className="flex items-center gap-1"><Calendar size={12} /> {round.startAt}</span>
                  <span className="flex items-center gap-1"><Clock size={12} /> {round.participants?.length || 0} Participants</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
              <span className={`px-3 py-1 rounded text-[10px] font-mono uppercase tracking-wider border ${getStatusColor(round.status)}`}>
                {round.status}
              </span>

              <div className="flex items-center gap-2">
                {/* Leaderboard Button (Icon only for non-completed, Full button for completed) */}
                {round.status === 'COMPLETED' ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 font-mono text-xs uppercase"
                  // onClick={() => onLeaderboard(round._id)}
                  >
                    <Trophy size={14} className="mr-2" /> Results
                  </Button>
                ) : (
                  <Button variant="ghost" size="icon" className="hover:bg-white/5" title="View Leaderboard">
                    <Trophy size={16} className="text-zinc-400" />
                  </Button>
                )}

                <Button variant="ghost" size="icon" className="hover:bg-white/5" onClick={() => onEdit(round._id)}>
                  <Edit3 size={16} className="text-zinc-400" />
                </Button>

                {round.status === 'LIVE' ? (
                  <Button
                    size="sm"
                    className="bg-orange-600 hover:bg-orange-700 text-white border-0 font-mono text-xs uppercase"
                    onClick={() => onLive(round._id)}
                  >
                    <Radio size={14} className="mr-2" /> Control Room
                  </Button>
                ) : (
                  <DeleteDialog
                    title="Delete round?"
                    description="All questions, submissions, and leaderboard data for this round will be permanently deleted."
                    onConfirm={() => onDelete(round._id)}
                  />
                )}
              </div>
            </div>

          </div>
        ))}
      </div>
    </motion.div>
  );
}