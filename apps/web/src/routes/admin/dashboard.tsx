import { AdminHeader } from '@/components/admin/header';
import { LiveControlView } from '@/components/admin/live-control';
import { RoundCreateView } from '@/components/admin/new-round';
import { RoundEditorView } from '@/components/admin/round-editor';
import { RoundListView } from '@/components/admin/round-view-list';
import { ParticipantsUploadView } from '@/components/admin/users/upload';
import { ParticipantsListView } from '@/components/admin/users/view';
import type { ViewState } from '@/types';
import { convexQuery } from '@convex-dev/react-query';
import { api } from '@google-maestro-new/backend/convex/_generated/api';
import type { Id } from '@google-maestro-new/backend/convex/_generated/dataModel';

import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useMutation } from 'convex/react';
import { AnimatePresence } from "motion/react";
import { useState } from 'react';
import { toast } from 'sonner';

export const Route = createFileRoute('/admin/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  const roundsQuery = useSuspenseQuery(convexQuery(api.rounds.getAll, {}));
  const rounds = roundsQuery.data;
  const deleteRoundMutation = useMutation(api.rounds.deleteRound);

  const [view, setView] = useState<ViewState>('LIST');
  const [activeRoundId, setActiveRoundId] = useState<Id<"rounds"> | null>(null);

  // --- HANDLERS ---

  const handleCreate = () => {
    setActiveRoundId(null);
    setView('CREATE_ROUND');
  };

  const handleEdit = (id: Id<"rounds">) => {
    setActiveRoundId(id);
    setView('EDIT_ROUND');
  };

  const handleLive = (id: Id<"rounds">) => {
    setActiveRoundId(id);
    setView('LIVE_CONTROL');
  };

  const handleManageParticipants = (id: Id<"rounds">) => {
    setActiveRoundId(id);
    setView('PARTICIPANTS');
  };

  const handleDelete = async (id: Id<"rounds">) => {
    try {
      await deleteRoundMutation({ id });
      toast.success("Round deleted successfully");
    } catch (error) {
      toast.error("Failed to delete round");
    }
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-100 font-sans selection:bg-orange-500/30">
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <AdminHeader />

      <main className="container mx-auto px-4 md:px-6 py-8 relative z-10">
        <AnimatePresence mode="wait">

          {view === 'LIST' && (
            <RoundListView
              rounds={rounds || []}
              key="list"
              onCreate={handleCreate}
              onEdit={handleEdit}
              onLive={handleLive}
              onDelete={handleDelete}
              onAddParticipants={handleManageParticipants}
            />
          )}

          {view === "CREATE_ROUND" && (
            <RoundCreateView
              key="create"
              onBack={() => setView('LIST')}
              onSuccess={(id) => {
                setActiveRoundId(id as Id<"rounds">);
                setView('EDIT_ROUND');
              }}
            />
          )}

          {view === 'EDIT_ROUND' && activeRoundId && (
            <RoundEditorView
              key="editor"
              roundId={activeRoundId}
              onBack={() => setView('LIST')}
            />
          )}

          {view === 'LIVE_CONTROL' && activeRoundId && (
            <LiveControlView
              key="live"
              roundId={activeRoundId}
              onExit={() => setView('LIST')}
            />
          )}

          {view === 'PARTICIPANTS' && activeRoundId && (
            <ParticipantsListView
              key="participants-list"
              roundId={activeRoundId}
              onBack={() => setView('LIST')}
              onImport={() => setView('IMPORT_PARTICIPANTS')}
            />
          )}

          {view === 'IMPORT_PARTICIPANTS' && activeRoundId && (
            <ParticipantsUploadView
              key="participants-upload"
              roundId={activeRoundId}
              onBack={() => setView('PARTICIPANTS')} // Returns to list to verify import
            />
          )}

        </AnimatePresence>
      </main>
    </div>
  )
}