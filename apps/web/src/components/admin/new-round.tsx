
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RoundStatusEnum } from '@/types';
import { api } from '@google-maestro-new/backend/convex/_generated/api';
import { useForm } from '@tanstack/react-form';
import { useMutation } from "convex/react";
import { Activity, AlertCircle, AlignLeft, ArrowRight, Clock, Save, Settings } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import z from 'zod';

interface RoundCreateViewProps {
  onBack: () => void;
  onSuccess: (newRoundId: string) => void;
}

export function RoundCreateView({ onBack, onSuccess }: RoundCreateViewProps) {
  const createRound = useMutation(api.rounds.create);

  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      startAt: "",
      status: RoundStatusEnum.UPCOMING
    },
    onSubmit: async ({ value }) => {
      try {
        const newRoundId = await createRound({
          title: value.title,
          description: value.description ?? "",
          startAt: value.startAt,
          status: value.status,
        });

        toast.success("Round created successfully!");

        console.log("newRoundId", newRoundId);
        onSuccess(newRoundId);



      } catch (error) {
        console.error(error);
        toast.error("Failed to create round");
      }
    },
    validators: {
      onSubmit: z.object({
        title: z.string().min(1, "Title is required"),
        description: z.string(),
        startAt: z.string(),
        status: z.enum(RoundStatusEnum),
      })
    }
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-2xl mx-auto h-[calc(100vh-100px)] flex flex-col"
    >
      {/* --- HEADER --- */}
      <div className="flex items-center gap-4 mb-8 shrink-0">
        <Button variant="ghost" onClick={onBack} className="text-zinc-500 hover:text-white pl-0">
          <ArrowRight size={16} className="rotate-180 mr-2" /> Back
        </Button>
        <div className="h-6 w-px bg-white/10" />
        <div>
          <h1 className="text-xl font-display font-medium text-white flex items-center gap-3">
            Initialize New Round
            <Badge variant="outline" className="text-zinc-500 border-zinc-700 bg-zinc-900">NEW</Badge>
          </h1>
        </div>
      </div>

      {/* --- FORM AREA --- */}
      <div className="bg-[#121214] border border-white/5 rounded-xl p-8 space-y-8">
        <div className="flex items-center gap-2 text-zinc-100 font-medium border-b border-white/5 pb-4 mb-6">
          <div className="p-1.5 bg-blue-500/10 rounded text-blue-500"><Settings size={16} /></div>
          Configuration Manifest
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-6"
        >
          {/* Title */}
          <form.Field name="title">
            {(field) => (
              <div className="space-y-2">
                <Label className="text-xs uppercase text-zinc-500 font-mono tracking-wider">Round Title</Label>
                <Input
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="e.g. Protocol: Obsidian"
                  className="bg-zinc-900 border-white/10 h-11 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-zinc-700"
                />
                {field.state.meta.errors.map((error) => (
                  <p key={error?.message} className="text-red-500 text-xs">{error?.message}</p>
                ))}
              </div>
            )}
          </form.Field>

          {/* Grid: Start Time & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <form.Field name="startAt">
              {(field) => (
                <div className="space-y-2">
                  <Label className="text-xs uppercase text-zinc-500 font-mono tracking-wider">Scheduled Start</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                    <Input
                      type="datetime-local"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="pl-10 bg-zinc-900 border-white/10 h-11 text-zinc-100 focus-visible:ring-zinc-700"
                    />
                  </div>
                </div>
              )}
            </form.Field>

            <form.Field name="status">
              {(field) => (
                <div className="space-y-2">
                  <Label className="text-xs uppercase text-zinc-500 font-mono tracking-wider">Initial Status</Label>
                  <div className="relative">
                    <Activity size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                    <select
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value as RoundStatusEnum)}
                      className="appearance-none pl-10 pr-3 bg-zinc-900 border-white/10 h-11 text-zinc-100 focus:ring-zinc-700 focus:outline-none focus:ring-2 focus:border-transparent rounded-md w-full"
                    >
                      <option value="" disabled hidden>Select Status</option>
                      <option value={RoundStatusEnum.UPCOMING}>{RoundStatusEnum.UPCOMING}</option>
                      <option value={RoundStatusEnum.LIVE}>{RoundStatusEnum.LIVE}</option>
                      <option value={RoundStatusEnum.COMPLETED}>{RoundStatusEnum.COMPLETED}</option>
                    </select>
                    <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              )}
            </form.Field>
          </div>

          {/* Description */}
          <form.Field name="description">
            {(field) => (
              <div className="space-y-2">
                <Label className="text-xs uppercase text-zinc-500 font-mono tracking-wider">Briefing / Description</Label>
                <div className="relative">
                  <AlignLeft className="absolute left-3 top-3 text-zinc-500" size={16} />
                  <Textarea
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="pl-10 bg-zinc-900 border-white/10 min-h-[120px] resize-none pt-3 text-zinc-100 focus-visible:ring-zinc-700"
                    placeholder="Mission details..."
                  />
                </div>
              </div>
            )}
          </form.Field>

          {/* Footer Actions */}
          <div className="pt-6 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-500 text-xs font-mono">
              <AlertCircle size={14} />
              Save manifest to unlock sequence editor.
            </div>
            <form.Subscribe>
              {(state) => (
                <Button
                  type="submit"
                  disabled={!state.canSubmit || state.isSubmitting}
                  className="bg-white text-black hover:bg-zinc-200 min-w-[140px]"
                >
                  <Save size={16} className="mr-2" />
                  {state.isSubmitting ? 'Creating...' : 'Create Round'}
                </Button>
              )}
            </form.Subscribe>
          </div>
        </form>
      </div>
    </motion.div>
  );
}