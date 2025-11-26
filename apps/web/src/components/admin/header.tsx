
import { UserButton } from '@clerk/tanstack-react-start';
import { Link } from '@tanstack/react-router';
import { Terminal } from 'lucide-react';

export function AdminHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#09090B]/80 backdrop-blur-md">
      <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-zinc-100 text-black flex items-center justify-center rounded font-bold font-display">
            <Terminal size={18} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-widest text-white">MAESTRO</span>
            <span className="font-mono text-[10px] text-zinc-500 uppercase">Admin Console</span>
          </div>
        </Link>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-mono uppercase text-green-500">System Nominal</span>
          </div>
          {/* <div className="w-8 h-8 bg-zinc-800 rounded-full border border-white/10" /> */}
          <UserButton />
        </div>
      </div>
    </header>
  );
}