import { LiveTicker } from "@/components/dashboard/live-tracker";
import { Podium } from "@/components/dashboard/podium";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import { convexQuery } from "@convex-dev/react-query";
import { api } from "@google-maestro-new/backend/convex/_generated/api";
import type { Id } from "@google-maestro-new/backend/convex/_generated/dataModel";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from '@tanstack/react-router';
import {
  ArrowLeft,
  Maximize2,
  Minimize2,
  PauseCircle,
  PlayCircle,
  Trophy,
  Users
} from 'lucide-react';
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from 'react';

const AdminLeaderboard = ({ roundId }: { roundId: string }) => {
  // 1. Fetch Real Data
  const leaderboardQuery = useSuspenseQuery(convexQuery(api.leaderboard.getLeaderboardByRound, {
    roundId: roundId as Id<"rounds">
  }));
  const rawLeaderboard = leaderboardQuery.data || [];

  // 2. Local UI State
  const [isProjectorMode, setIsProjectorMode] = useState(false);
  const [isLive, setIsLive] = useState(true);

  // 3. Transform & Sort Data
  const users = useMemo(() => {
    // Sort by score descending
    const sorted = [...rawLeaderboard].sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));

    // Map to UI structure
    return sorted.map((entry, index) => ({
      id: entry.userId,
      name: entry.user?.name ?? "Unknown Agent",
      handle: entry.user?.name?.toLowerCase().replace(/\s/g, '') ?? "unknown",
      avatar: `https://avatar.iran.liara.run/public/boy?username=${entry.user?.name?.toLowerCase().replace(/\s/g, '') ?? "unknown"}`, // Consistent avatar generation
      score: entry.totalScore ?? 0,
      rank: index + 1,
      role: entry.user?.role
    }));
  }, [rawLeaderboard]);

  // 4. Derived Subsets
  const topThree = users.slice(0, 3).map(u => ({
    rank: u.rank,
    score: u.score,
    user: { name: u.name, avatar: u.avatar, handle: u.handle }
  }));

  const restOfUsers = users.slice(3);

  // Note: For a real live ticker, you would need a separate query fetching "recent submissions"
  // For now, we pass an empty array or you can hook up a `api.submissions.getRecent` query here.
  const activities: any[] = [];

  return (
    <div className={`min-h-screen bg-[#09090B] text-zinc-100 font-sans overflow-hidden flex flex-col transition-all duration-500 ${isProjectorMode ? 'p-0' : 'p-0 md:p-4'}`}>

      {/* Background Grid */}
      {!isProjectorMode && (
        <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      )}

      {/* --- CONTROLS HEADER --- */}
      <motion.div
        layout
        className={`z-50 bg-[#121214] border-b border-white/10 flex items-center justify-between px-6 py-4 ${isProjectorMode ? 'fixed top-0 left-0 right-0 opacity-0 hover:opacity-100 transition-opacity' : 'rounded-t-xl border-x border-t'}`}
      >
        <div className="flex items-center gap-4">
          {!isProjectorMode && (
            <Link to="/admin/dashboard">
              <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
                <ArrowLeft size={20} />
              </Button>
            </Link>
          )}
          <div>
            <h1 className="text-lg font-bold font-display text-white flex items-center gap-2">
              MAESTRO <span className="text-orange-500">ADMIN</span>
            </h1>
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
              Live Rankings
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsLive(!isLive)}
            className={`border-white/10 font-mono text-xs gap-2 ${isLive ? 'text-green-400 bg-green-500/10' : 'text-zinc-500'}`}
          >
            {isLive ? <PauseCircle size={14} /> : <PlayCircle size={14} />}
            {isLive ? 'LIVE' : 'PAUSED'}
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={() => setIsProjectorMode(!isProjectorMode)}
            className="bg-white text-black hover:bg-zinc-200 gap-2 font-mono text-xs"
          >
            {isProjectorMode ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            {isProjectorMode ? 'EXIT PROJECTOR' : 'PROJECTOR MODE'}
          </Button>
        </div>
      </motion.div>


      {/* --- MAIN CONTENT LAYOUT --- */}
      <div className={`flex flex-col lg:flex-row flex-grow overflow-hidden bg-[#09090B] relative ${isProjectorMode ? '' : 'border-x border-b border-white/10 rounded-b-xl'}`}>

        {/* LEFT PANEL: LEADERBOARD */}
        <div className="flex-1 flex flex-col p-4 md:p-8 overflow-hidden relative">

          {/* Stats Row */}
          <div className="flex gap-8 mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded text-blue-500"><Users size={20} /></div>
              <div>
                <p className="text-2xl font-display font-bold leading-none">{users.length}</p>
                <p className="text-[10px] font-mono text-zinc-500 uppercase">Active Agents</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded text-orange-500"><Trophy size={20} /></div>
              <div>
                <p className="text-2xl font-display font-bold leading-none">
                  {users.length > 0 ? users[0].score : 0}
                </p>
                <p className="text-[10px] font-mono text-zinc-500 uppercase">Top Score</p>
              </div>
            </div>
          </div>

          {/* Podium Section */}
          <div className={`mb-8 transition-all duration-500 ${isProjectorMode ? 'scale-110 origin-top mt-8' : ''}`}>
            {users.length > 0 ? (
              <Podium topThree={topThree} />
            ) : (
              <div className="h-64 flex items-center justify-center border border-dashed border-white/10 rounded-xl bg-white/5">
                <p className="text-zinc-500 font-mono text-sm">No data available yet.</p>
              </div>
            )}
          </div>

          {/* Remaining List */}
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <div className="grid grid-cols-12 gap-4 text-[10px] font-mono uppercase text-zinc-500 border-b border-white/10 pb-2 mb-2 px-4">
              <div className="col-span-1">#</div>
              <div className="col-span-8">Agent</div>
              <div className="col-span-3 text-right">Score</div>
            </div>

            <AnimatePresence>
              {restOfUsers.map((user) => (
                <motion.div
                  layout
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`grid grid-cols-12 gap-4 items-center p-3 md:p-4 rounded border border-transparent ${isProjectorMode ? 'my-2 bg-white/5 border-white/5' : 'hover:bg-white/5'} transition-colors`}
                >
                  <div className="col-span-1 font-mono text-zinc-400 font-bold text-lg">
                    {user.rank}
                  </div>
                  <div className="col-span-8 flex items-center gap-3">
                    <Avatar className="h-8 w-8 ring-1 ring-white/10">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="bg-zinc-800 text-xs font-mono">{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className={`font-medium ${isProjectorMode ? 'text-xl' : 'text-sm'} text-zinc-200`}>
                        {user.name}
                        {user.role === 'ADMIN' && <span className="ml-2 text-[10px] text-orange-500 border border-orange-500/20 px-1 rounded">ADMIN</span>}
                      </p>
                      <p className="text-[10px] font-mono text-zinc-500">@{user.handle}</p>
                    </div>
                  </div>
                  <div className="col-span-3 text-right">
                    <span className={`font-display font-bold ${isProjectorMode ? 'text-2xl text-white' : 'text-lg text-zinc-300'}`}>
                      {user.score}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT PANEL: LIVE ACTIVITY */}
        <div className={`
            border-t lg:border-t-0 lg:border-l border-white/10 transition-all duration-300
            ${isProjectorMode ? 'w-full lg:w-96' : 'w-full lg:w-80'}
            h-64 lg:h-auto
         `}>
          <LiveTicker activities={activities} />
        </div>

      </div>
    </div>
  )
}

export default AdminLeaderboard