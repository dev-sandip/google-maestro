import { AdminHeader } from '@/components/admin/header';
import { LiveControlView } from '@/components/admin/live-control';
import { RoundCreateView } from '@/components/admin/new-round';
import { RoundEditorView } from '@/components/admin/round-editor';
import { RoundListView } from '@/components/admin/round-view-list';
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
  const [activeRoundId, setActiveRoundId] = useState<string>("");

  const handleEdit = (id: Id<"rounds">) => {
    setActiveRoundId(id);
    setView('EDIT_ROUND');
  };

  const handleDelete = (id: Id<"rounds">) => {
    try {
      deleteRoundMutation({ id });
      toast.success("Round deleted successfully");
    }
    catch (error) {
      toast.error("Failed to delete round");
    }
  };

  const handleLive = (id: Id<"rounds">) => {
    console.log("edit id is ", id)
    setActiveRoundId(id);
    setView('LIVE_CONTROL');
  };
  return <div className="min-h-screen bg-[#09090B] text-zinc-100 font-sans selection:bg-orange-500/30">
    <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

    <AdminHeader />

    <main className="container mx-auto px-4 md:px-6 py-8 relative z-10">
      <AnimatePresence mode="wait">

        {view === 'LIST' && (
          <RoundListView
            rounds={rounds}
            key="list"
            onCreate={() => setView('CREATE_ROUND')}
            onEdit={(id) => handleEdit(id)}
            onLive={(id) => handleLive(id)}
            onDelete={(id) => handleDelete(id)}
          />
        )}

        {(view === 'EDIT_ROUND') && (
          <RoundEditorView
            key="editor"
            roundId={activeRoundId as Id<"rounds">}
            onBack={() => setView('LIST')}
          />
        )}
        {
          view === "CREATE_ROUND" && (
            <RoundCreateView
              onBack={() => setView('LIST')}
              onSuccess={(id) => {
                setActiveRoundId(id);
                setView('EDIT_ROUND');
              }}
            />
          )
        }

        {view === 'LIVE_CONTROL' && (
          <LiveControlView
            key="live"
            roundId={activeRoundId}
            onExit={() => setView('LIST')}
          />
        )}

      </AnimatePresence>
    </main>
  </div>
}