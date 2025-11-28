import { AdminHeader } from '@/components/admin/header'
import { RoundViolationsView } from '@/components/admin/violations/round-violations-view'
import { UserViolationHistory } from '@/components/admin/violations/user-violation-history'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '@google-maestro-new/backend/convex/_generated/api'
import type { Id } from '@google-maestro-new/backend/convex/_generated/dataModel'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { AnimatePresence } from 'motion/react'
import { useState } from 'react'

export const Route = createFileRoute('/admin/violations/$roundId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { roundId } = Route.useParams()
  const logsQuery = useSuspenseQuery(convexQuery(api.violations.getViolationsByRound, {
    roundId: roundId as Id<"rounds">
  }))
  const logs = logsQuery.data;
  const navigate = useNavigate()
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  return <div className="min-h-screen bg-[#09090B] text-zinc-100 font-sans selection:bg-orange-500/30">
    <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

    <AdminHeader />

    <main className="container mx-auto px-4 md:px-6 py-8 relative z-10">
      <AnimatePresence mode="wait">
        {selectedUserId ? (
          <UserViolationHistory
            key="detail"
            userId={selectedUserId}
            logs={logs}
            onBack={() => setSelectedUserId(null)}
          />
        ) : (
          <RoundViolationsView
            key="list"
            roundId={roundId}
            logs={logs}
            onSelectUser={setSelectedUserId}
            onBack={() => navigate({ to: "/admin/dashboard" })}
          />
        )}
      </AnimatePresence>
    </main>
  </div>
}
