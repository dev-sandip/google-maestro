

import { DeleteDialog } from '@/components/delete-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { convexQuery } from '@convex-dev/react-query';
import { api } from '@google-maestro-new/backend/convex/_generated/api';
import type { Id } from '@google-maestro-new/backend/convex/_generated/dataModel';
import { useSuspenseQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  Mail,
  Plus,
  Search,
  Trash2,
  User,
  Users
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { toast } from 'sonner';


interface ParticipantsListViewProps {
  roundId: string;
  onBack: () => void;
  onImport: () => void;
}

export function ParticipantsListView({ roundId, onBack, onImport }: ParticipantsListViewProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // --- DATA ---
  const emailsQuery = useSuspenseQuery(convexQuery(api.allowed.getAllowedUsers, {
    roundId: roundId as Id<'rounds'>
  }));
  const roundQuery = useSuspenseQuery(convexQuery(api.rounds.getRoundById, {
    roundId: roundId as Id<'rounds'>
  }));
  const round = roundQuery.data;
  const participants = emailsQuery.data;

  // --- MUTATION ---·
  // const removeParticipant = useMutation(api.rounds.); // You need to implement this in backend

  const handleRemove = async (email: string) => {
    try {
      // await removeParticipant({ roundId, email });
      toast.success("Participant removed from roster");
    } catch (e) {
      toast.error("Failed to remove participant");
    }
  };

  // --- FILTERING ---
  const filteredParticipants = participants?.emails.filter(email =>
    email.includes(searchQuery)
  );

  if (!round) return <div>Loading protocol...</div>;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-4xl mx-auto h-[calc(100vh-100px)] flex flex-col"
    >
      {/* --- HEADER --- */}
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="text-zinc-500 hover:text-white pl-0">
            <ArrowRight size={16} className="rotate-180 mr-2" /> Back
          </Button>
          <div className="h-6 w-px bg-white/10" />
          <div>
            <h1 className="text-xl font-display font-medium text-white flex items-center gap-3">
              Roster: {round.title}
            </h1>
            <p className="text-xs text-zinc-500 font-mono">
              {participants?.emails.length} Agents Registered
            </p>
          </div>
        </div>

        <Button onClick={onImport} className="bg-white text-black hover:bg-zinc-200">
          <Plus size={16} className="mr-2" /> Import CSV
        </Button>
      </div>

      {/* --- TOOLBAR --- */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search agents by email..."
            className="pl-10 bg-[#121214] border-white/10 text-white focus-visible:ring-zinc-700"
          />
        </div>
      </div>

      {/* --- LIST AREA --- */}
      <div className="bg-[#121214] border border-white/5 rounded-xl overflow-hidden flex flex-col flex-grow">

        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-white/5 bg-white/5 text-[10px] font-mono uppercase tracking-widest text-zinc-500">
          <div className="col-span-8">Identity</div>
          <div className="col-span-4 text-right">Actions</div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-grow overflow-y-auto custom-scrollbar p-2">
          {filteredParticipants?.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
              <Users size={32} className="mb-4 opacity-50" />
              <p className="font-mono text-sm">No agents found in this sector.</p>
            </div>
          ) : (
            <div className="space-y-1">
              <AnimatePresence>
                {filteredParticipants?.map((email) => (
                  <motion.div
                    key={email}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    className="grid grid-cols-12 gap-4 px-4 py-3 items-center rounded-lg hover:bg-white/5 transition-colors group border border-transparent hover:border-white/5"
                  >
                    {/* Identity */}
                    <div className="col-span-8 flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                        <User size={14} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-zinc-200 font-medium truncate">{email}</span>
                        <span className="text-[10px] text-zinc-500 font-mono">INVITED</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="col-span-4 flex justify-end items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-white" onClick={() => {
                        navigator.clipboard.writeText(email);
                        toast.success("Email copied");
                      }}>
                        <Mail size={14} />
                      </Button>

                      <DeleteDialog
                        title="Remove Participant?"
                        description={`Are you sure you want to remove ${email} from this round?`}
                        onConfirm={() => handleRemove(email)}
                        trigger={
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 size={14} />
                          </Button>
                        }
                      />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}