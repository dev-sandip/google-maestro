import { cn } from "@/lib/utils";
import { useUser } from "@clerk/tanstack-react-start";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "@google-maestro-new/backend/convex/_generated/api";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Activity, Calendar, Terminal } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { DashboardHeader } from "./header";
import { RoundCard } from "./round-card";

type FilterType = 'ALL' | 'HISTORY' | 'UPCOMING';

export const UserDashboard = () => {
  // Data Fetching
  const roundsQuery = useSuspenseQuery(convexQuery(api.rounds.getAll, {}));
  const rounds = roundsQuery.data || [];
  const { user } = useUser();

  // State
  const [activeTab, setActiveTab] = useState<FilterType>('ALL');

  // Constants
  const duration = "10"; // Placeholder
  const today = new Date().toLocaleDateString("en-US", { weekday: 'long', month: 'long', day: 'numeric' });

  // Filtering Logic
  const filteredRounds = rounds.filter((round) => {
    if (activeTab === 'HISTORY') return round.status === 'COMPLETED';
    if (activeTab === 'UPCOMING') return round.status === 'UPCOMING';
    return round.status !== 'LIVE'; // ALL = Upcoming + Completed (Live has its own section)
  });

  const liveRounds = rounds.filter(r => r.status === 'LIVE');

  const TabButton = ({ tab, label }: { tab: FilterType, label: string }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={cn(
        "pb-3 text-sm font-medium transition-all whitespace-nowrap px-1 border-b-2 outline-none",
        activeTab === tab
          ? "text-white border-white"
          : "text-zinc-500 border-transparent hover:text-zinc-300"
      )}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-100 font-sans selection:bg-orange-500/30">

      {/* Background Grid */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:30px_30px] md:bg-[size:40px_40px] pointer-events-none" />

      <DashboardHeader />

      <main className="relative z-10 container mx-auto px-4 md:px-6 py-8 md:py-12">

        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-white/5 pb-8">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-orange-500 text-xs font-mono uppercase tracking-widest mb-2"
            >
              <Terminal size={12} />
              <span>Operative Dashboard</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-5xl font-display font-medium text-white"
            >
              Welcome back, {user?.firstName}.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-zinc-500 mt-2 text-sm md:text-base"
            >
              Systems online. You have access to <span className="text-white">{rounds.length}</span> total protocols.
            </motion.p>
          </div>

          {/* Date Widget (Placeholder for future stats) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="hidden md:flex items-center gap-3 text-right"
          >
            <div className="flex flex-col">
              <span className="text-xs font-mono text-zinc-600 uppercase tracking-widest">Current Date</span>
              <span className="text-sm text-zinc-300">{today}</span>
            </div>
            <div className="w-10 h-10 rounded bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-500">
              <Calendar size={18} />
            </div>
          </motion.div>
        </div>

        {/* Live Rounds Section */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-white flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
              </span>
              Live Operations
            </h2>
            {liveRounds.length > 0 && (
              <span className="text-xs font-mono text-orange-500 border border-orange-500/20 bg-orange-500/10 px-2 py-1 rounded">
                {liveRounds.length} ACTIVE
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveRounds.map((round) => (
              <RoundCard key={round._id} duration={duration} {...round} />
            ))}

            {/* Empty State for Live */}
            {liveRounds.length === 0 && (
              <div className="col-span-full h-32 border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center bg-white/5 gap-2">
                <Activity className="text-zinc-600" size={24} />
                <p className="text-zinc-500 font-mono text-sm">No active operations detected.</p>
              </div>
            )}
          </div>
        </div>

        {/* Filtered Rounds Section */}
        <div className="pb-10 min-h-[400px]">
          {/* Tabs */}
          <div className="flex items-center gap-6 mb-8 border-b border-white/5 overflow-x-auto no-scrollbar">
            <TabButton tab="ALL" label="All Rounds" />
            <TabButton tab="UPCOMING" label="Upcoming" />
            <TabButton tab="HISTORY" label="History" />
          </div>

          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredRounds.map((round) => (
                <RoundCard key={round._id} duration={duration} {...round} />
              ))}
            </AnimatePresence>

            {/* Empty State for Filters */}
            {filteredRounds.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full py-24 text-center border border-white/5 rounded-xl bg-[#121214]"
              >
                <p className="text-zinc-500 font-mono text-sm">No records found in this sector.</p>
              </motion.div>
            )}
          </motion.div>
        </div>

      </main>
    </div>
  )
}