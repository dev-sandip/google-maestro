
import { UserButton, useUser } from "@clerk/tanstack-react-start";
import { useNavigate } from "@tanstack/react-router";
import { Command } from 'lucide-react';

export function DashboardHeader() {
  const user = useUser()
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#09090B]/80 backdrop-blur-md supports-[backdrop-filter]:bg-[#09090B]/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white text-black flex items-center justify-center rounded-sm">
            <Command size={16} strokeWidth={3} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm leading-none tracking-tight font-display text-white">MAESTRO</span>
            <span className="text-[10px] uppercase font-mono text-zinc-500 tracking-widest">Dash v2.0</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end mr-2">
            <span className="text-xs font-medium text-white">{user.user?.fullName}</span>

          </div>
          <UserButton />

        </div>
      </div>
    </header>
  );
}