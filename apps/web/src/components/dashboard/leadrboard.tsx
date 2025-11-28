import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Id } from "@google-maestro-new/backend/convex/_generated/dataModel";
import { Medal, Trophy } from 'lucide-react';

// Extended Interface to include User details (Joined data)
export interface EnrichedLeaderboardEntry {
  _id: Id<"leaderboard">;
  _creationTime: number;
  totalScore?: number;
  totalTimeTakenMs?: number;
  rank?: number;
  userId: string;
  user?: {
    name: string;
    avatar?: string;
  };
}

interface LeaderboardTableProps {
  data: EnrichedLeaderboardEntry[];
  currentUserId?: string;
}

export function LeaderboardTable({ data, currentUserId }: LeaderboardTableProps) {

  // Helper to format milliseconds to seconds (e.g. 1250ms -> 1.25s)
  const formatTime = (ms?: number) => {
    if (ms === undefined || ms === null) return "-";
    return `${(ms / 1000).toFixed(2)}s`;
  };

  // Helper to generate consistent avatar if missing
  const getAvatar = (id: string, avatarUrl?: string) => {
    return avatarUrl || `https://avatar.iran.liara.run/public/boy?username=${id}`;
  };

  return (
    <div className="w-full overflow-hidden rounded-xl border border-white/10 bg-[#121214]">
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-white/5 bg-white/5 text-[10px] font-mono uppercase tracking-widest text-zinc-500">
        <div className="col-span-2 md:col-span-1 text-center">Rank</div>
        <div className="col-span-6 md:col-span-6">Agent</div>
        <div className="col-span-2 md:col-span-3 text-right">Time</div>
        <div className="col-span-2 md:col-span-2 text-right">Score</div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-white/5">
        {data.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 text-sm font-mono">
            No rankings available yet.
          </div>
        ) : (
          data.map((entry, index) => {
            // Fallback rank calculation if backend doesn't provide it
            const rank = entry.rank || index + 1;
            const isCurrentUser = entry.userId === currentUserId;

            return (
              <div
                key={entry._id}
                className={cn(
                  "grid grid-cols-12 gap-4 px-4 py-4 items-center transition-colors hover:bg-white/5",
                  isCurrentUser && "bg-blue-500/10 hover:bg-blue-500/20"
                )}
              >
                {/* Rank */}
                <div className="col-span-2 md:col-span-1 flex justify-center">
                  {rank === 1 && <Trophy size={16} className="text-yellow-500" />}
                  {rank === 2 && <Medal size={16} className="text-zinc-400" />}
                  {rank === 3 && <Medal size={16} className="text-amber-700" />}
                  {rank > 3 && <span className="font-mono text-zinc-500 text-sm">#{rank}</span>}
                </div>

                {/* User */}
                <div className="col-span-6 md:col-span-6 flex items-center gap-3">
                  <Avatar className="h-8 w-8 ring-1 ring-white/10">
                    <AvatarImage src={getAvatar(entry.userId, entry.user?.avatar)} />
                    <AvatarFallback className="bg-zinc-800 text-xs text-zinc-400">
                      {entry.user?.name?.slice(0, 2).toUpperCase() || "??"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex flex-col min-w-0">
                    <span className={cn(
                      "text-sm font-medium truncate",
                      isCurrentUser ? "text-blue-400" : "text-zinc-200"
                    )}>
                      {entry.user?.name || "Unknown Agent"} {isCurrentUser && "(You)"}
                    </span>
                    <span className="text-[10px] text-zinc-600 font-mono truncate">
                      ID: {entry.userId.slice(-6)}
                    </span>
                  </div>
                </div>

                {/* Time */}
                <div className="col-span-2 md:col-span-3 text-right">
                  <span className="font-mono text-sm text-zinc-400">
                    {formatTime(entry.totalTimeTakenMs)}
                  </span>
                </div>

                {/* Score */}
                <div className="col-span-2 md:col-span-2 text-right">
                  <span className="font-display font-bold text-white text-lg">
                    {entry.totalScore ?? 0}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}