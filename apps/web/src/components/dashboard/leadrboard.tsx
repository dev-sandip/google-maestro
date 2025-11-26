import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, getUserDetails } from "@/lib/utils";
import type { Id } from "@google-maestro/backend/convex/_generated/dataModel";
import { Medal, Trophy } from 'lucide-react';

interface RankEntry {
  _id: Id<"leaderboard">;
  _creationTime: number;
  totalScore?: number | undefined;
  totalTimeTakenMs?: number | undefined;
  correctCount?: number | undefined;
  lastSubmissionAt?: number | undefined;
  rank?: number | undefined;
  userId: string;
  roundId: Id<"rounds">;
}

export async function LeaderboardTable({ data, currentUserId }: { data: RankEntry[]; currentUserId: string }) {
  const userDetailsArray = await Promise.all(data.map((entry) => {
    return getUserDetails(entry.userId)
  }))
  console.log(userDetailsArray)
  return (
    <div className="w-full overflow-hidden rounded-xl border border-white/10 bg-[#121214]">
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-white/5 bg-white/5 text-[10px] font-mono uppercase tracking-widest text-zinc-500">
        <div className="col-span-1 md:col-span-1 text-center">#</div>
        <div className="col-span-7 md:col-span-6">Agent</div>
        <div className="col-span-2 md:col-span-3 text-right">Time</div>
        <div className="col-span-2 md:col-span-2 text-right">Score</div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-white/5">
        {data.map((entry, index) => (
          <div
            key={entry._id}
            className={cn(
              "grid grid-cols-12 gap-4 px-4 py-4 items-center transition-colors hover:bg-white/5",
              entry.userId === currentUserId && "bg-blue-500/10 hover:bg-blue-500/20"
            )}
          >
            {/* Rank */}
            <div className="col-span-1 md:col-span-1 flex justify-center">
              {entry?.rank === 1 && <Trophy size={16} className="text-yellow-500" />}
              {entry?.rank === 2 && <Medal size={16} className="text-zinc-400" />}
              {entry?.rank === 3 && <Medal size={16} className="text-amber-700" />}
              {entry?.rank > 3 && <span className="font-mono text-zinc-500 text-sm">{entry.rank}</span>}
            </div>

            {/* User */}
            <div className="col-span-7 md:col-span-6 flex items-center gap-3">
              <Avatar className="h-8 w-8 ring-1 ring-white/10">
                <AvatarImage src={userDetailsArray[index]?.avatar} />
                <AvatarFallback className="bg-zinc-800 text-xs">{userDetailsArray[index]?.name.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className={cn(
                  "text-sm font-medium",
                  entry.userId === currentUserId ? "text-blue-400" : "text-zinc-200"
                )}>
                  {userDetailsArray[index]?.name} {entry.userId === currentUserId && "(You)"}
                </span>
                <span className="text-[10px] text-zinc-600 font-mono">@{userDetailsArray[index]?.handle}</span>
              </div>
            </div>

            {/* Time */}
            <div className="col-span-2 md:col-span-3 text-right">
              <span className="font-mono text-sm text-zinc-400">{entry?.timeTaken}</span>
            </div>

            {/* Score */}
            <div className="col-span-2 md:col-span-2 text-right">
              <span className="font-display font-bold text-white">{entry?.score}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}