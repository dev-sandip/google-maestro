import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import type { Id } from "@google-maestro-new/backend/convex/_generated/dataModel";
import {
  ArrowLeft,
  Clock,
  Laptop,
  Mail,
  ShieldAlert
} from 'lucide-react';
import { motion } from 'motion/react';
import { ViolationBadge } from './violation-badge';
type ViolationLog = {
  user: {
    _id: Id<"users">;
    name: string;
    email?: string;
  } | undefined;
  _id: Id<"violations">;
  _creationTime: number;
  userAgent?: string;
  type: string;
  userId: Id<"users">;
};

interface UserViolationHistoryProps {
  userId: string;
  logs: ViolationLog[];
  onBack: () => void;
}

export function UserViolationHistory({ userId, logs, onBack }: UserViolationHistoryProps) {
  // Filter logs for this specific user
  const userLogs = logs.filter(l => l.userId === userId).sort((a, b) => b._creationTime - a._creationTime);
  const user = userLogs[0]?.user;

  // Calculate Risk Score (Mock logic)
  const riskScore = userLogs.length * 10 + (userLogs.filter(l => l.type === 'DEV_TOOLS').length * 50);
  const riskLevel = riskScore > 100 ? 'CRITICAL' : riskScore > 50 ? 'HIGH' : 'MODERATE';
  const riskColor = riskScore > 100 ? 'text-red-500' : riskScore > 50 ? 'text-orange-500' : 'text-yellow-500';

  return (
    <div className="flex flex-col h-full space-y-6">

      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <Button variant="ghost" onClick={onBack} size="sm" className="text-zinc-500 hover:text-white pl-0">
          <ArrowLeft className="mr-2" size={16} /> Back to Log
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: User Profile & Risk */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <div className="bg-[#121214] border border-white/5 rounded-xl p-6 flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 ring-2 ring-white/10 mb-4">
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`} />
              <AvatarFallback className="text-2xl bg-zinc-800">{user?.name?.[0]}</AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-display text-white">{user?.name || "Unknown Agent"}</h2>
            <div className="flex items-center gap-2 text-zinc-500 text-sm mt-2 font-mono">
              <Mail size={12} /> {user?.email || "No Email"}
            </div>

            <div className="w-full h-px bg-white/5 my-6" />

            {/* Risk Meter */}
            <div className="w-full text-left">
              <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-widest">Risk Assessment</span>
              <div className="flex items-end justify-between mt-1">
                <span className={`text-3xl font-display font-bold ${riskColor}`}>{riskLevel}</span>
                <span className="text-zinc-400 font-mono text-xs">{riskScore} PTS</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-800 rounded-full mt-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(riskScore, 100)}%` }}
                  className={`h-full ${riskScore > 100 ? 'bg-red-500' : 'bg-orange-500'}`}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-[#121214] border border-white/5 rounded-xl p-4 space-y-2">
            <Button variant="destructive" className="w-full bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 font-mono text-xs">
              <ShieldAlert size={14} className="mr-2" /> DISQUALIFY AGENT
            </Button>
            <Button variant="outline" className="w-full border-white/10 text-zinc-400 hover:text-white font-mono text-xs">
              EXPORT EVIDENCE
            </Button>
          </div>
        </div>

        {/* Right: Timeline */}
        <div className="lg:col-span-2 bg-[#121214] border border-white/5 rounded-xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-white/5 bg-white/5">
            <h3 className="text-sm font-medium text-white flex items-center gap-2">
              <Clock size={16} /> Incident Timeline
            </h3>
          </div>

          <div className="flex-grow overflow-y-auto custom-scrollbar p-6">
            <div className="relative border-l border-white/10 ml-3 space-y-8">
              {userLogs.map((log, index) => (
                <motion.div
                  key={log._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative pl-8"
                >
                  {/* Timeline Dot */}
                  <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-zinc-900 border border-zinc-500 ring-4 ring-[#121214]" />

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-mono text-zinc-500">
                      {new Date(log._creationTime).toLocaleString()}
                    </span>
                    <ViolationBadge type={log.type} />
                  </div>

                  <div className="bg-zinc-900/50 border border-white/5 rounded p-3 text-sm text-zinc-300">
                    <div className="flex items-center gap-2 mb-1 text-zinc-500 text-xs font-mono">
                      <Laptop size={12} />
                      {log.userAgent || "Unknown Device"}
                    </div>
                    {/* Contextual Info based on type */}
                    {log.type === 'TAB_SWITCH' && <p>User lost focus of the active window.</p>}
                    {log.type === 'DEV_TOOLS' && <p className="text-red-400">Browser developer tools were opened.</p>}
                    {log.type === 'FULLSCREEN_EXIT' && <p>Application fullscreen mode was terminated.</p>}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}