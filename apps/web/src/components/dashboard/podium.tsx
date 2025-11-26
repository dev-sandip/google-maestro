

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Crown, Medal } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

interface RankEntry {
  rank: number;
  user: { name: string; avatar: string; handle: string };
  score: number;
}

export function Podium({ topThree }: { topThree: RankEntry[] }) {
  // Sort visually: 2nd (Left), 1st (Center), 3rd (Right)
  const [first, second, third] = [
    topThree.find(p => p.rank === 1),
    topThree.find(p => p.rank === 2),
    topThree.find(p => p.rank === 3)
  ];

  const PodiumStep = ({
    entry,
    color,
    height,
    icon: Icon
  }: {
    entry?: RankEntry,
    color: string,
    height: string,
    icon: any
  }) => {

    // Determine glow color for the avatar border
    const borderColor = color.includes('yellow') ? 'border-yellow-500' :
      color.includes('zinc') ? 'border-zinc-500' :
        'border-amber-700';

    return (
      <div className="flex flex-col items-center justify-end z-10 w-24 md:w-40 relative group">

        {/* 
            AnimatePresence mode="popLayout" ensures the old user exits 
            before the new user enters, creating a smooth swap effect.
        */}
        <AnimatePresence mode="popLayout">
          {entry ? (
            <motion.div
              // CRITICAL: This key tells React to ONLY re-animate if the USER changes.
              // If the score updates but user is same, this wrapper DOES NOT animate.
              key={entry.user.handle}

              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 25
              }}
              className="flex flex-col items-center w-full mb-3"
            >
              {/* Rank Icon (Crown/Medal) - Floats in */}
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1, type: "spring" }}
                className="mb-2 relative"
              >
                <Icon className={`w-6 h-6 md:w-8 md:h-8 ${entry.rank === 1 ? 'text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.6)]' :
                  entry.rank === 2 ? 'text-zinc-300' : 'text-amber-700'
                  }`} />
              </motion.div>

              {/* Avatar Container */}
              <div className="relative mb-3">
                <div className={`rounded-full p-1 border-2 ${borderColor} bg-[#09090B] shadow-2xl`}>
                  <Avatar className={`w-14 h-14 md:w-20 md:h-20`}>
                    <AvatarImage src={entry.user.avatar} />
                    <AvatarFallback className="text-lg font-bold bg-[#121214]">{entry.user.name[0]}</AvatarFallback>
                  </Avatar>
                </div>

                {/* Rank Pill */}
                <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-[#09090B] border ${borderColor} rounded text-[10px] md:text-[10px] font-mono font-bold uppercase`}>
                  #{entry.rank}
                </div>
              </div>

              {/* User Details */}
              <div className="text-center w-full">
                <h3 className="text-white font-display text-sm md:text-lg font-medium truncate w-full px-2">
                  {entry.user.name}
                </h3>

                {/* SCORE ANIMATION: Inner key ensures only the number pops on score update */}
                <div className="h-6 flex items-center justify-center overflow-hidden">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={entry.score}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      className="text-zinc-400 font-mono text-xs md:text-sm tabular-nums block"
                    >
                      {entry.score}
                    </motion.span>
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          ) : (
            // Spacer for empty slots (e.g., start of round)
            <div className="h-32 w-full" />
          )}
        </AnimatePresence>

        {/* The Podium Pillar (Static) */}
        <div className={`w-full rounded-t-lg bg-gradient-to-b from-[#121214] to-[#09090B] border-t border-x border-white/10 ${height} relative overflow-hidden`}>
          {/* Color Tint */}
          <div className={`absolute inset-0 bg-${borderColor.split('-')[1]}-500/5`} />

          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:10px_10px] opacity-30" />

          {/* Shimmer Effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent w-full h-full animate-[shimmer_3s_infinite]" />
        </div>
      </div>
    );
  };

  return (
    <div className="flex items-end justify-center gap-2 md:gap-6 pb-4 min-h-[320px]">
      <PodiumStep
        entry={second}
        color="zinc"
        height="h-28 md:h-40"
        icon={Medal}
      />
      <PodiumStep
        entry={first}
        color="yellow"
        height="h-40 md:h-56"
        icon={Crown}
      />
      <PodiumStep
        entry={third}
        color="amber"
        height="h-20 md:h-28"
        icon={Medal}
      />
    </div>
  );
}