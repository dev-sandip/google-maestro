
import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';
import { Command, XCircle } from 'lucide-react';

export function GameHeader({ roundTitle, questionNumber, totalQuestions }: { roundTitle: string, questionNumber: number, totalQuestions: number }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-white/5 bg-[#09090B]/80 backdrop-blur-md flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-orange-500 text-white flex items-center justify-center rounded-sm shadow-[0_0_15px_rgba(255,79,0,0.3)]">
          <Command size={16} strokeWidth={3} />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-sm leading-none text-white font-display uppercase tracking-wider">{roundTitle}</span>
          <span className="text-[10px] font-mono text-zinc-500">
            Q-{questionNumber} of {totalQuestions}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Link to="/user/dashboard">
          <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-red-500 hover:bg-red-500/10 h-8 text-xs font-mono uppercase">
            <XCircle size={14} className="mr-2" /> Abort
          </Button>
        </Link>
      </div>
    </header>
  );
}