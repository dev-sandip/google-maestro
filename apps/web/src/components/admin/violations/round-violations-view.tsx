

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Id } from "@google-maestro-new/backend/convex/_generated/dataModel";
import { ArrowRight, ExternalLink, Filter, Search, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { ViolationBadge } from './violation-badge'; // Import from above

// Type definition based on your prompt
type ViolationLog = {
  user: {
    _id: Id<"users">;
    name: string;
    email?: string;
    role: "ADMIN" | "USER" | "SUPERADMIN";
  } | undefined;
  _id: Id<"violations">;
  _creationTime: number;
  userAgent?: string;
  type: string;
  timestamp: string;
  userId: Id<"users">;
};

interface RoundViolationsViewProps {
  roundId: string;
  logs: ViolationLog[];
  onSelectUser: (userId: string) => void;
  onBack: () => void;
}

export function RoundViolationsView({ roundId, logs, onSelectUser, onBack }: RoundViolationsViewProps) {
  const [search, setSearch] = useState("");

  const filteredLogs = logs.filter(log =>
    log.user?.name.toLowerCase().includes(search.toLowerCase()) ||
    log.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col h-full space-y-6"
    >

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} size="icon" className="text-zinc-500 hover:text-white">
            <ArrowRight className="rotate-180" size={20} />
          </Button>
          <div className="h-8 w-px bg-white/10" />
          <div>
            <h1 className="text-2xl font-display font-medium text-white flex items-center gap-3">
              Security Logs
              <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-500 text-xs font-mono border border-red-500/20">
                {logs.length} DETECTED
              </span>
            </h1>
            <p className="text-zinc-500 text-xs font-mono mt-1 uppercase tracking-widest">Protocol ID: {roundId.slice(-8)}</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex gap-4">
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by agent or violation type..."
            className="pl-10 bg-[#121214] border-white/10 text-zinc-200 focus-visible:ring-red-500/50 h-10 placeholder:text-zinc-600"
          />
        </div>
        <Button variant="outline" className="border-white/10 text-zinc-400 hover:text-white bg-[#121214]">
          <Filter size={16} className="mr-2" /> Filter
        </Button>
      </div>

      {/* Log Feed */}
      <div className="bg-[#121214] border border-white/5 rounded-xl overflow-hidden flex flex-col flex-grow">
        <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-white/5 bg-white/5 text-[10px] font-mono uppercase tracking-widest text-zinc-500">
          <div className="col-span-3">Timestamp</div>
          <div className="col-span-4">Agent</div>
          <div className="col-span-3">Infraction</div>
          <div className="col-span-2 text-right">Action</div>
        </div>

        <div className="flex-grow overflow-y-auto custom-scrollbar p-2 space-y-1">
          {filteredLogs.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-zinc-600">
              <ShieldAlert size={48} className="mb-4 opacity-20" />
              <p className="font-mono text-sm">System Secure. No logs found.</p>
            </div>
          ) : (
            filteredLogs.map((log, i) => (
              <motion.div
                key={log._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="grid grid-cols-12 gap-4 px-4 py-3 items-center rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/5 group"
              >
                {/* Time */}
                <div className="col-span-3 flex flex-col">
                  <span className="text-zinc-300 font-mono text-xs">
                    {new Date(log._creationTime).toLocaleTimeString([], { hour12: false })}
                  </span>
                  <span className="text-[10px] text-zinc-600 font-mono truncate">
                    {new Date(log._creationTime).toLocaleDateString()}
                  </span>
                </div>

                {/* User */}
                <div className="col-span-4 flex items-center gap-3">
                  <Avatar className="h-6 w-6 ring-1 ring-white/10">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${log.userId}`} />
                    <AvatarFallback className="text-[8px] bg-zinc-800 text-zinc-400">{log.user?.name?.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm text-zinc-200 truncate">{log.user?.name || "Unknown Agent"}</span>
                    <span className="text-[10px] text-zinc-600 font-mono truncate">ID: {log.userId.slice(0, 8)}</span>
                  </div>
                </div>

                {/* Violation */}
                <div className="col-span-3">
                  <ViolationBadge type={log.type} />
                </div>

                {/* Action */}
                <div className="col-span-2 text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onSelectUser(log.userId)}
                    className="h-7 text-[10px] font-mono text-zinc-500 hover:text-white gap-2 uppercase tracking-wide opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Investigate <ExternalLink size={12} />
                  </Button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}