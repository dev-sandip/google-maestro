import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { RoundStatusEnum } from '@/types';
import { convexQuery } from '@convex-dev/react-query';
import { api } from '@google-maestro-new/backend/convex/_generated/api';
import type { Id } from '@google-maestro-new/backend/convex/_generated/dataModel';

import { useForm } from '@tanstack/react-form';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useMutation } from "convex/react";
import { Activity, ArrowRight, CheckCircle2, Clock, Edit3, List, Plus, Save, Settings, Trash2, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { toast } from 'sonner';
import z from 'zod';

interface RoundEditorViewProps {
  roundId: Id<"rounds">;
  onBack: () => void;
}

type TabState = 'SETTINGS' | 'QUESTIONS';

export function RoundEditorView({ roundId, onBack }: RoundEditorViewProps) {
  const [activeTab, setActiveTab] = useState<TabState>('QUESTIONS');
  const [editingId, setEditingId] = useState<Id<"questions"> | null>(null);

  // --- DATA FETCHING ---
  const roundQuery = useSuspenseQuery(convexQuery(api.rounds.getRoundById, {
    roundId: roundId
  }));
  const roundData = roundQuery.data;

  const questionQuery = useSuspenseQuery(convexQuery(api.questions.getQuestionByRoundID, {
    roundId: roundId
  }));
  const questions = questionQuery.data || [];

  // --- MUTATIONS ---
  const updateRound = useMutation(api.rounds.update);
  const createQuestion = useMutation(api.questions.createQuestions);
  const updateQuestion = useMutation(api.questions.updateQuestions); // Assumes update mutation exists
  const deleteQuestion = useMutation(api.questions.deleteQuestions); // Assumes remove mutation exists

  // --- FORMS ---

  // 1. QUESTION FORM
  const QuestionForm = useForm({
    defaultValues: {
      question: "",
      answer: "",
      time: 60,
      fuzzy: false,
    },
    onSubmit: async ({ value, formApi }) => {
      try {
        if (editingId) {
          // UPDATE EXISTING
          await updateQuestion({
            _id: editingId,
            question: value.question,
            answer: value.answer,
            time: Number(value.time),
            fuzzy: value.fuzzy,
            roundId: roundId,
          });
          toast.success("Protocol updated successfully");
          setEditingId(null);
        } else {
          // CREATE NEW
          await createQuestion({
            question: value.question,
            answer: value.answer,
            time: Number(value.time),
            fuzzy: value.fuzzy,
            roundId: roundId,
          });
          toast.success("Protocol appended to sequence");
        }
        formApi.reset();
        // Reset default values specifically to avoid stale form state
        formApi.setFieldValue("time", 60);
        formApi.setFieldValue("fuzzy", false);
      } catch (e) {
        toast.error(editingId ? "Failed to update question" : "Failed to add question");
      }
    },
    validators: {
      onChange: z.object({
        question: z.string().min(1),
        answer: z.string().min(1),
        time: z.number().min(5),
        fuzzy: z.boolean(),
      })
    }
  });

  const handleEditClick = (q: typeof questions[0]) => {
    setEditingId(q._id);
    QuestionForm.setFieldValue("question", q.question);
    QuestionForm.setFieldValue("answer", q.answer);
    QuestionForm.setFieldValue("time", q.time);
    QuestionForm.setFieldValue("fuzzy", q.fuzzy);

    // Scroll to form
    document.getElementById('question-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    QuestionForm.reset();
    QuestionForm.setFieldValue("time", 60);
  };

  const handleDeleteClick = async (id: Id<"questions">) => {
    if (confirm("Are you sure you want to delete this protocol?")) {
      try {
        await deleteQuestion({ _id: id });
        toast.success("Protocol deleted");
        // If we deleted the one being edited, reset form
        if (editingId === id) {
          handleCancelEdit();
        }
      } catch (e) {
        toast.error("Failed to delete question");
      }
    }
  };

  // 2. SETTINGS FORM
  const SettingsForm = useForm({
    defaultValues: {
      title: roundData?.title ?? "",
      description: roundData?.description ?? "",
      startAt: roundData?.startAt ?? "",
      status: roundData?.status ?? "UPCOMING"
    },
    onSubmit: async ({ value }) => {
      try {
        await updateRound({
          _id: roundId,
          ...value,
        });
        toast.success("Round updated");
      } catch (e) {
        toast.error("Failed to update round");
      }
    }
  });

  if (!roundData) return <div className="p-8 text-zinc-500">Loading protocol data...</div>;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-5xl mx-auto h-[calc(100vh-100px)] flex flex-col"
    >
      {/* --- HEADER --- */}
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="text-zinc-500 hover:text-white pl-0">
            <ArrowRight size={16} className="rotate-180 mr-2" /> Back
          </Button>
          <div className="h-6 w-px bg-white/10" />
          <div>
            <h1 className="text-xl font-display font-medium text-white flex items-center gap-3">
              {roundData.title}
              <Badge variant="outline" className="text-zinc-500 border-zinc-700 bg-zinc-900">
                {roundData.status}
              </Badge>
            </h1>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-[#121214] border border-white/5 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('SETTINGS')}
            className={cn(
              "px-4 py-1.5 text-xs font-mono uppercase rounded transition-all flex items-center gap-2",
              activeTab === 'SETTINGS' ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <Settings size={14} /> Manifest
          </button>
          <button
            onClick={() => setActiveTab('QUESTIONS')}
            className={cn(
              "px-4 py-1.5 text-xs font-mono uppercase rounded transition-all flex items-center gap-2",
              activeTab === 'QUESTIONS' ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500"
            )}
          >
            <List size={14} /> Sequence
          </button>
        </div>
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar pb-24">
        <AnimatePresence mode="wait">

          {/* TAB 1: SETTINGS */}
          {activeTab === 'SETTINGS' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-2xl"
            >
              <div className="bg-[#121214] border border-white/5 rounded-xl p-8 space-y-8">
                <div className="flex items-center gap-2 text-zinc-100 font-medium border-b border-white/5 pb-4 mb-6">
                  <div className="p-1.5 bg-blue-500/10 rounded text-blue-500"><Settings size={16} /></div>
                  Configuration Manifest
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    SettingsForm.handleSubmit();
                  }}
                  className="space-y-6"
                >
                  <SettingsForm.Field name="title">
                    {(field) => (
                      <div className="space-y-2">
                        <Label className="text-xs uppercase text-zinc-500 font-mono tracking-wider">Round Title</Label>
                        <Input
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          className="bg-zinc-900 border-white/10 h-11 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-zinc-700"
                        />
                      </div>
                    )}
                  </SettingsForm.Field>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SettingsForm.Field name="startAt">
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
                    </SettingsForm.Field>

                    <SettingsForm.Field name="status">
                      {(field) => (
                        <div className="space-y-2">
                          <Label className="text-xs uppercase text-zinc-500 font-mono tracking-wider">Initial Status</Label>
                          <div className="relative">
                            <Activity size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                            <select
                              value={field.state.value}
                              onChange={(e) => field.handleChange(e.target.value as RoundStatusEnum)}
                              className="appearance-none pl-10 pr-3 bg-zinc-900 border-white/10 h-11 text-zinc-100 focus:ring-zinc-700 focus:outline-none focus:ring-2 focus:border-transparent rounded-md w-full"
                            >
                              {Object.values(RoundStatusEnum).map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}
                    </SettingsForm.Field>
                  </div>

                  <SettingsForm.Field name="description">
                    {(field) => (
                      <div className="space-y-2">
                        <Label className="text-xs uppercase text-zinc-500 font-mono tracking-wider">Briefing / Description</Label>
                        <Textarea
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          className="pl-10 bg-zinc-900 border-white/10 min-h-[120px] resize-none pt-3 text-zinc-100 focus-visible:ring-zinc-700"
                        />
                      </div>
                    )}
                  </SettingsForm.Field>

                  <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-green-500 text-xs font-mono">
                      <CheckCircle2 size={14} />
                      Configuration synced.
                    </div>
                    <SettingsForm.Subscribe>
                      {(state) => (
                        <Button
                          type="submit"
                          disabled={!state.canSubmit || state.isSubmitting}
                          className="bg-white text-black hover:bg-zinc-200 min-w-[140px]"
                        >
                          <Save size={16} className="mr-2" />
                          {state.isSubmitting ? 'Saving...' : 'Save Changes'}
                        </Button>
                      )}
                    </SettingsForm.Subscribe>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {/* TAB 2: QUESTIONS */}
          {activeTab === 'QUESTIONS' && (
            <motion.div
              key="questions"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Toolbar */}
              <div className="flex items-center justify-between bg-[#121214] border border-white/5 p-4 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-white">Sequence Buffer</span>
                    <span className="text-xs text-zinc-500 font-mono">{questions.length} Protocols Loaded</span>
                  </div>
                </div>
              </div>

              {/* Question List */}
              <div className="space-y-3">
                {questions.map((q, idx) => (
                  <div
                    key={q._id}
                    className={cn(
                      "group flex items-start gap-4 p-5 bg-[#121214] border rounded-xl transition-all relative",
                      editingId === q._id
                        ? "border-orange-500/50 bg-orange-500/5"
                        : "border-white/5 hover:border-white/20"
                    )}
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-zinc-900 rounded flex items-center justify-center text-xs font-mono text-zinc-500 border border-white/5 mt-1">
                      {(idx + 1).toString().padStart(2, '0')}
                    </div>

                    <div className="flex-grow space-y-3">
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-medium text-zinc-200 w-full max-w-2xl">{q.question}</p>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 top-4">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEditClick(q)}
                            className="h-8 w-8 hover:bg-white/10 text-zinc-400 hover:text-white"
                          >
                            <Edit3 size={14} />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDeleteClick(q._id)}
                            className="h-8 w-8 hover:bg-red-500/20 text-red-500"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-2 py-1 bg-zinc-900 rounded border border-white/5">
                          <span className="text-[10px] text-zinc-500 uppercase font-mono">Answer:</span>
                          <span className="text-xs text-white font-mono">{q.answer}</span>
                        </div>
                        <div className="flex items-center gap-2 px-2 py-1 bg-zinc-900 rounded border border-white/5">
                          <span className="text-[10px] text-zinc-500 uppercase font-mono">Timer:</span>
                          <span className="text-xs text-white font-mono">{q.time}s</span>
                        </div>
                        {q.fuzzy && <Badge variant="outline" className="border-blue-500/20 text-blue-500 bg-blue-500/10 text-[10px] h-6 rounded-sm">FUZZY MATCH</Badge>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Question Form (Create / Edit) */}
              <div id="question-form" className={cn(
                "p-6 border border-dashed rounded-xl transition-all",
                editingId
                  ? "border-orange-500/30 bg-orange-500/5"
                  : "border-white/10 bg-zinc-900/20 hover:bg-zinc-900/40"
              )}>
                <div className="flex items-center justify-between mb-4">
                  <h4 className={cn(
                    "text-xs font-mono uppercase flex items-center gap-2",
                    editingId ? "text-orange-500" : "text-zinc-500"
                  )}>
                    {editingId ? <Edit3 size={12} /> : <Plus size={12} />}
                    {editingId ? "Editing Sequence Entry" : "New Sequence Entry"}
                  </h4>
                  {editingId && (
                    <Button variant="ghost" size="sm" onClick={handleCancelEdit} className="h-6 text-xs text-zinc-500 hover:text-white gap-1">
                      <X size={12} /> Cancel Edit
                    </Button>
                  )}
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    QuestionForm.handleSubmit();
                  }}
                  className="grid gap-4"
                >
                  <QuestionForm.Field name="question">
                    {(field) => (
                      <Input
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Enter question text here..."
                        className="bg-transparent border-white/10 focus-visible:ring-zinc-700 text-zinc-100"
                      />
                    )}
                  </QuestionForm.Field>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-6">
                      <QuestionForm.Field name="answer">
                        {(field) => (
                          <Input
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            placeholder="Correct Answer"
                            className="bg-transparent border-white/10 focus-visible:ring-zinc-700 text-zinc-100"
                          />
                        )}
                      </QuestionForm.Field>
                    </div>

                    <div className="md:col-span-3">
                      <QuestionForm.Field name="time">
                        {(field) => (
                          <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
                            <Input
                              type="number"
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) => field.handleChange(Number(e.target.value))}
                              placeholder="60s"
                              className="pl-9 bg-transparent border-white/10 focus-visible:ring-zinc-700 text-zinc-100"
                            />
                          </div>
                        )}
                      </QuestionForm.Field>
                    </div>

                    <div className="md:col-span-3 flex items-center gap-2 border border-white/10 rounded px-3 bg-transparent h-10">
                      <QuestionForm.Field name="fuzzy">
                        {(field) => (
                          <>
                            <Switch
                              id="fuzzy-new"
                              checked={field.state.value}
                              onCheckedChange={field.handleChange}
                              className="data-[state=checked]:bg-blue-600"
                            />
                            <Label htmlFor="fuzzy-new" className="text-xs text-zinc-400 cursor-pointer">Fuzzy Match</Label>
                          </>
                        )}
                      </QuestionForm.Field>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-2">
                    {!editingId && (
                      <Button size="sm" type="button" variant="ghost" className="text-zinc-400 hover:text-white" onClick={() => QuestionForm.reset()}>
                        Clear
                      </Button>
                    )}
                    <QuestionForm.Subscribe>
                      {(state) => (
                        <Button
                          size="sm"
                          type="submit"
                          disabled={!state.canSubmit || state.isSubmitting}
                          className={cn(
                            "min-w-[140px]",
                            editingId ? "bg-orange-600 hover:bg-orange-700 text-white" : "bg-white text-black hover:bg-zinc-200"
                          )}
                        >
                          <Save size={14} className="mr-2" />
                          {editingId ? 'Update Protocol' : 'Add to Queue'}
                        </Button>
                      )}
                    </QuestionForm.Subscribe>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </motion.div>
  );
}