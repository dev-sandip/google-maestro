

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { UserData } from '@/types';
import { ArrowRight, Ban, CheckCircle2, Mail, Save, Shield, Terminal } from 'lucide-react';
import { motion } from 'motion/react';

interface UserEditorViewProps {
  isNew: boolean;
  userData: UserData | null;
  onBack: () => void;
}

export function UserEditorView({ isNew, userData, onBack }: UserEditorViewProps) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-2xl mx-auto">

      {/* Navigation */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={onBack} className="text-zinc-500 hover:text-white pl-0">
          <ArrowRight size={16} className="rotate-180 mr-2" /> Back to Roster
        </Button>
        <div className="h-6 w-px bg-white/10" />
        <h1 className="text-xl font-display font-medium text-white">
          {isNew ? 'New Recruitment' : `Edit: ${userData?.handle}`}
        </h1>
      </div>

      <div className="bg-[#121214] border border-white/5 rounded-xl p-6 md:p-8 space-y-8">

        {/* Section: Identity */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-zinc-100 font-medium">
            <div className="p-1.5 bg-blue-500/10 rounded text-blue-500"><Terminal size={16} /></div>
            Digital Identity
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-xs uppercase text-zinc-500">Full Name</Label>
              <Input defaultValue={userData?.name} placeholder="e.g. John Doe" className="bg-zinc-900 border-white/10" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase text-zinc-500">Agent Handle</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">@</span>
                <Input defaultValue={userData?.handle} placeholder="gamertag" className="pl-7 bg-zinc-900 border-white/10" />
              </div>
            </div>
            <div className="space-y-2 col-span-1 md:col-span-2">
              <Label className="text-xs uppercase text-zinc-500">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                <Input defaultValue={userData?.email} placeholder="agent@maestro.dev" className="pl-10 bg-zinc-900 border-white/10" />
              </div>
            </div>
          </div>
        </div>

        {/* Section: Permissions */}
        <div className="space-y-4 pt-4 border-t border-white/5">
          <div className="flex items-center gap-2 text-zinc-100 font-medium">
            <div className="p-1.5 bg-orange-500/10 rounded text-orange-500"><Shield size={16} /></div>
            Clearance & Security
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-xs uppercase text-zinc-500">Access Level</Label>
              <select className="flex h-10 w-full rounded-md border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-700">
                <option value="USER">User (Standard)</option>
                <option value="ADMIN">Admin (High Command)</option>
              </select>
            </div>
            {isNew && (
              <div className="space-y-2">
                <Label className="text-xs uppercase text-zinc-500">Initial Password</Label>
                <Input type="password" placeholder="••••••••" className="bg-zinc-900 border-white/10" />
              </div>
            )}
            {!isNew && (
              <div className="space-y-2">
                <Label className="text-xs uppercase text-zinc-500">Account Status</Label>
                <div className="flex items-center gap-4 mt-2">
                  <Button size="sm" variant="outline" className="border-green-500/20 text-green-500 hover:bg-green-500/10">
                    <CheckCircle2 size={14} className="mr-2" /> Active
                  </Button>
                  <Button size="sm" variant="outline" className="border-red-500/20 text-red-500 hover:bg-red-500/10">
                    <Ban size={14} className="mr-2" /> Suspend
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Bar */}
        <div className="pt-6 border-t border-white/5 flex justify-end gap-3">
          <Button variant="ghost" onClick={onBack}>Cancel</Button>
          <Button className="bg-white text-black hover:bg-zinc-200">
            <Save size={16} className="mr-2" /> {isNew ? 'Create Operative' : 'Save Changes'}
          </Button>
        </div>

      </div>
    </motion.div>
  );
}