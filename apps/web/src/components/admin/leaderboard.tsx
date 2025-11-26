import { LiveTicker } from "@/components/dashboard/live-tracker";
import { Podium } from "@/components/dashboard/podium";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import { INITIAL_USERS } from '@/lib/mock';
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
import { useEffect, useState } from 'react';
const AdminLeaderboard = ({ roundId }: { roundId: string }) => {
  const leaderboardQuery = useSuspenseQuery(convexQuery(api.leaderboard.getLeaderboardByRound, { roundId: roundId as Id<"rounds"> }))
  const leaderboard = leaderboardQuery.data;
  // const usersArray = await Promise.all(leaderboard.map((data) => {
  //   return getUserDetails(data.userId)
  // }))
  // console.log(usersArray)
  const [users, setUsers] = useState(INITIAL_USERS);
  const [activities, setActivities] = useState<any[]>([]);
  const [isProjectorMode, setIsProjectorMode] = useState(false);
  const [isLive, setIsLive] = useState(true);

  // --- LIVE SIMULATION EFFECT ---
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      // 1. Pick a random user to score
      const randomUserIndex = Math.floor(Math.random() * users.length);
      const isCorrect = Math.random() > 0.3; // 70% chance correct
      const points = isCorrect ? 50 : 0;

      const updatedUser = {
        ...users[randomUserIndex],
        score: users[randomUserIndex].score + points
      };

      // 2. Add to activity feed
      const newActivity = {
        id: Date.now().toString(),
        user: updatedUser.name,
        action: isCorrect ? 'CORRECT' : 'WRONG',
        timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };

      setActivities(prev => [newActivity, ...prev].slice(0, 8)); // Keep last 8

      // 3. Update Users & Re-sort
      if (isCorrect) {
        setUsers(prev => {
          const newList = [...prev];
          newList[randomUserIndex] = updatedUser;
          return newList.sort((a, b) => b.score - a.score);
        });
      }

    }, 6000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [isLive, users]);


  // Derived Data
  const topThree = users.slice(0, 3).map((u, i) => ({ ...u, rank: i + 1, user: u })); // Adapter for Podium component
  const restOfUsers = users.slice(3);
  return <div className={`min-h-screen bg-[#09090B] text-zinc-100 font-sans overflow-hidden flex flex-col transition-all duration-500 ${isProjectorMode ? 'p-0' : 'p-0 md:p-4'}`}>

    {/* Background Grid - Only visible in standard mode to reduce noise in projector */}
    {!isProjectorMode && (
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
    )}

    {/* --- CONTROLS HEADER (Hidden in Projector Mode via group-hover or toggle) --- */}
    <motion.div
      layout
      className={`z-50 bg-[#121214] border-b border-white/10 flex items-center justify-between px-6 py-4 ${isProjectorMode ? 'fixed top-0 left-0 right-0 opacity-0 hover:opacity-100 transition-opacity' : 'rounded-t-xl border-x border-t'}`}
    >
      <div className="flex items-center gap-4">
        {!isProjectorMode && (
          <Link to="/dashboard">
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
            Round #404 • Live Rankings
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Live Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsLive(!isLive)}
          className={`border-white/10 font-mono text-xs gap-2 ${isLive ? 'text-green-400 bg-green-500/10' : 'text-zinc-500'}`}
        >
          {isLive ? <PauseCircle size={14} /> : <PlayCircle size={14} />}
          {isLive ? 'LIVE' : 'PAUSED'}
        </Button>

        {/* Projector Toggle */}
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
              <p className="text-2xl font-display font-bold leading-none">1,250</p>
              <p className="text-[10px] font-mono text-zinc-500 uppercase">Top Score</p>
            </div>
          </div>
        </div>

        {/* Podium Section */}
        <div className={`mb-8 transition-all duration-500 ${isProjectorMode ? 'scale-110 origin-top mt-8' : ''}`}>
          <Podium topThree={topThree} />
        </div>

        {/* Remaining List - Auto Scrolling container if needed */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div className="grid grid-cols-12 gap-4 text-[10px] font-mono uppercase text-zinc-500 border-b border-white/10 pb-2 mb-2 px-4">
            <div className="col-span-1">#</div>
            <div className="col-span-8">Agent</div>
            <div className="col-span-3 text-right">Score</div>
          </div>

          <AnimatePresence>
            {restOfUsers.map((user, index) => (
              <motion.div
                layout
                key={user.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`grid grid-cols-12 gap-4 items-center p-3 md:p-4 rounded border border-transparent ${isProjectorMode ? 'my-2 bg-white/5 border-white/5' : 'hover:bg-white/5'} transition-colors`}
              >
                <div className="col-span-1 font-mono text-zinc-400 font-bold text-lg">
                  {index + 4}
                </div>
                <div className="col-span-8 flex items-center gap-3">
                  <Avatar className="h-8 w-8 ring-1 ring-white/10">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className={`font-medium ${isProjectorMode ? 'text-xl' : 'text-sm'} text-zinc-200`}>{user.name}</p>
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

      {/* RIGHT PANEL: LIVE ACTIVITY (Collapsible on mobile) */}
      <div className={`
            border-t lg:border-t-0 lg:border-l border-white/10 transition-all duration-300
            ${isProjectorMode ? 'w-full lg:w-96' : 'w-full lg:w-80'}
            h-64 lg:h-auto
         `}>
        <LiveTicker activities={activities} />
      </div>

    </div>
  </div>
}

export default AdminLeaderboard