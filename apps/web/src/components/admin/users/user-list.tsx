
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from '@/components/ui/input';
import { MOCK_USERS } from "@/lib/mock";
import type { UserData } from "@/types";
import {
  Ban,
  Edit,
  Filter, MoreHorizontal,
  Search,
  Shield,
  UserPlus
} from 'lucide-react';
import { motion } from 'motion/react';



// Mock Data


interface UserListViewProps {
  onCreate: () => void;
  onEdit: (user: UserData) => void;
}

export function UserListView({ onCreate, onEdit }: UserListViewProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-display font-medium text-white mb-2">Operative Roster</h1>
          <p className="text-zinc-500 text-sm">Manage access, roles, and competitive standing.</p>
        </div>
        <Button onClick={onCreate} className="bg-white text-black hover:bg-zinc-200 w-full md:w-auto">
          <UserPlus size={16} className="mr-2" /> Recruit Agent
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
          <Input placeholder="Search by handle, email, or ID..." className="pl-10 bg-[#121214] border-white/5 focus-visible:ring-zinc-700" />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-white/10 text-zinc-400 hover:text-white">
            <Filter size={16} className="mr-2" /> Status
          </Button>
          <Button variant="outline" className="border-white/10 text-zinc-400 hover:text-white">
            <Shield size={16} className="mr-2" /> Role
          </Button>
        </div>
      </div>

      {/* Table / Grid */}
      <div className="bg-[#121214] border border-white/5 rounded-xl overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-white/5 bg-white/5 text-[10px] font-mono uppercase tracking-widest text-zinc-500">
          <div className="col-span-5 md:col-span-4">Identity</div>
          <div className="col-span-3 hidden md:block">Stats</div>
          <div className="col-span-3 md:col-span-2">Role</div>
          <div className="col-span-2 hidden md:block">Last Seen</div>
          <div className="col-span-4 md:col-span-1 text-right">Actions</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-white/5">
          {MOCK_USERS.map((user) => (
            <div key={user.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-white/5 transition-colors group">

              {/* Identity */}
              <div className="col-span-5 md:col-span-4 flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-10 w-10 ring-1 ring-white/10">
                    <AvatarImage src={`https://i.pravatar.cc/150?u=${user.id}`} />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                  {/* Status Dot */}
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-[#121214] ${user.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user.name}</p>
                  <p className="text-xs text-zinc-500 truncate">@{user.handle}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="col-span-3 hidden md:flex flex-col justify-center">
                <span className="text-sm font-mono text-zinc-300">{user.elo} ELO</span>
                <span className="text-[10px] text-zinc-600">Ranked</span>
              </div>

              {/* Role */}
              <div className="col-span-3 md:col-span-2 flex items-center">
                <Badge variant="outline" className={`
                        border-opacity-20 text-[10px] font-mono
                        ${user.role === 'ADMIN' ? 'border-orange-500 text-orange-500 bg-orange-500/10' : 'border-blue-500 text-blue-500 bg-blue-500/10'}
                    `}>
                  {user.role}
                </Badge>
              </div>

              {/* Last Seen */}
              <div className="col-span-2 hidden md:block text-xs text-zinc-500 font-mono">
                {user.lastActive}
              </div>

              {/* Actions */}
              <div className="col-span-4 md:col-span-1 flex justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-white">
                      <MoreHorizontal size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-[#09090B] border-white/10 text-zinc-300">
                    <DropdownMenuLabel>User Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => onEdit(user)}>
                      <Edit className="mr-2 h-4 w-4" /> Edit Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-500 focus:text-red-500 focus:bg-red-500/10">
                      <Ban className="mr-2 h-4 w-4" /> {user.status === 'ACTIVE' ? 'Suspend Account' : 'Reactivate Account'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* Footer / Pagination Mock */}
      <div className="mt-4 flex justify-between items-center text-xs text-zinc-500">
        <span>Showing 5 of 142 agents</span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-7 border-white/10 text-zinc-400" disabled>Prev</Button>
          <Button variant="outline" size="sm" className="h-7 border-white/10 text-zinc-400">Next</Button>
        </div>
      </div>
    </motion.div>
  );
}