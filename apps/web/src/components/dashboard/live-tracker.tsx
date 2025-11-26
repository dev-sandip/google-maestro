
import { Check, Terminal, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

interface ActivityItem {
  id: string;
  user: string;
  action: 'CORRECT' | 'WRONG';
  timestamp: string;
}

export function LiveTicker({ activities }: { activities: ActivityItem[] }) {
  return (
    <div className="h-full flex flex-col bg-[#09090B] border-l border-white/10 w-full md:w-80">
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
        <span className="text-xs font-mono uppercase tracking-widest text-zinc-400 flex items-center gap-2">
          <Terminal size={12} /> Live Feed
        </span>
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
      </div>

      <div className="flex-1 overflow-hidden relative p-4 space-y-3">
        {/* Gradient Mask for fade out */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#09090B] to-transparent z-10" />

        <AnimatePresence initial={false}>
          {activities.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center justify-between p-3 rounded bg-white/5 border border-white/5"
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium text-white">{item.user}</span>
                <span className="text-[10px] font-mono text-zinc-500">{item.timestamp}</span>
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold font-mono ${item.action === 'CORRECT' ? 'text-green-500' : 'text-red-500'
                }`}>
                {item.action === 'CORRECT' ? '+50' : 'FAIL'}
                {item.action === 'CORRECT' ? <Check size={14} /> : <X size={14} />}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}