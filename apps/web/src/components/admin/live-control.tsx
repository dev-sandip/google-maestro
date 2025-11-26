import { Button } from '@/components/ui/button';
import { convexQuery } from '@convex-dev/react-query';
import { api } from '@google-maestro-new/backend/convex/_generated/api';
import type { Id } from '@google-maestro-new/backend/convex/_generated/dataModel';

import { useSuspenseQuery } from '@tanstack/react-query';
import { useMutation } from 'convex/react';
import { AlertCircle, CheckCircle2, ChevronRight, Lock, Play, StopCircle, Terminal } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

interface LiveControlViewProps {
  roundId: string;
  onExit: () => void;
}

export function LiveControlView({ roundId, onExit }: LiveControlViewProps) {
  const [status, setStatus] = useState<'WAITING' | 'ACTIVE' | 'INTERMISSION' | 'ENDED'>('WAITING');

  // 'currentQ' tracks the index of the *next* question to be activated.
  // e.g. if currentQ is 0, we are waiting to start the 1st question (index 0).
  // if currentQ is 1, we are currently playing index 0, waiting for index 1.
  const [currentQ, setCurrentQ] = useState(0);
  const [timer, setTimer] = useState(0);

  // --- DATA FETCHING ---
  const questionQuery = useSuspenseQuery(convexQuery(api.questions.getQuestionByRoundID, {
    roundId: roundId as Id<"rounds">
  }));

  // Fetch Submissions
  const submissionsQuery = useSuspenseQuery(convexQuery(api.submission.getSubmissionsByRound, {
    roundId: roundId as Id<"rounds">
  }));

  const submissions = submissionsQuery.data || [];
  const questions = questionQuery.data || [];

  const updateQuestion = useMutation(api.questions.updateQuestions);

  // --- TIMER LOGIC ---
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (status === 'ACTIVE' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (status === 'ACTIVE' && timer === 0) {
      // AUTOMATIC END: Time ran out
      handleTimeExpired();
    }

    return () => clearInterval(interval);
  }, [status, timer]); // Dependencies are crucial here

  // Helper to handle DB updates when time runs out
  const handleTimeExpired = () => {
    // The currently active question is at index (currentQ - 1)
    const activeIndex = currentQ - 1;
    const activeQuestion = questions[activeIndex];

    if (activeQuestion) {
      // 1. Update Backend: Set Status to ENDED so users can't submit
      updateQuestion({
        _id: activeQuestion._id,
        status: "ENDED",
      });
    }

    // 2. Update Local Admin UI to Intermission
    setStatus('INTERMISSION');
  };

  // --- HANDLERS ---
  const activateNext = () => {
    if (currentQ < questions.length) {
      const nextQuestion = questions[currentQ];

      // 1. Set Timer locally
      setTimer(nextQuestion.time);

      // 2. Update Backend: Set Status to ACTIVE
      updateQuestion({
        _id: nextQuestion._id,
        status: 'ACTIVE',
      });

      // 3. Advance local state
      setCurrentQ(prev => prev + 1);
      setStatus('ACTIVE');
    } else {
      setStatus('ENDED');
    }
  };

  const stopQuestion = () => {
    // MANUAL STOP
    handleTimeExpired(); // Reuse the logic to close the question in DB
  };

  // --- DERIVED STATE ---
  // The question currently being played (or just finished) is at index currentQ - 1
  const activeQuestionIndex = currentQ - 1;
  const activeQuestionData = questions[activeQuestionIndex];

  const maxTime = activeQuestionData?.time || 60;
  const progressPercentage = (timer / maxTime) * 100;

  // Filter submissions for the active question
  const activeSubmissions = submissions.filter(s =>
    activeQuestionData && s.questionId === activeQuestionData._id
  );

  // Sort by most recent
  const sortedSubmissions = [...(status === 'ACTIVE' ? activeSubmissions : submissions)]
    .sort((a, b) => b.submittedAt - a.submittedAt);

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-140px)]">
      {/* Top Bar: Round Status */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onExit} className="border-white/10 text-zinc-400">
            Exit Control
          </Button>
          <div>
            <h1 className="text-xl font-display text-white">Live Control</h1>
            <span className="text-xs font-mono text-zinc-500 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${status === 'ACTIVE' ? 'bg-red-500 animate-pulse' : 'bg-zinc-500'}`} />
              STATUS: {status}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-3xl font-mono font-bold tabular-nums ${timer <= 10 && status === 'ACTIVE' ? 'text-red-500 animate-pulse' : 'text-white'}`}>
            00:{timer.toString().padStart(2, '0')}
          </p>
          <p className="text-[10px] uppercase text-zinc-500 tracking-widest">Global Timer</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow">

        {/* LEFT: Main Stage */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="flex-grow bg-[#121214] border border-white/5 rounded-xl p-8 relative overflow-hidden flex flex-col justify-center items-center text-center min-h-[300px]">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px)] bg-[size:20px_20px] opacity-20 pointer-events-none" />

            {status === 'WAITING' && (
              <div className="text-zinc-500">
                <AlertCircle size={48} className="mx-auto mb-4 opacity-50" />
                <h2 className="text-2xl font-display">Lobby Active</h2>
                <p>Waiting for admin trigger...</p>
              </div>
            )}

            {status === 'ACTIVE' && activeQuestionData && (
              <div className="relative z-10 w-full">
                <span className="inline-block px-3 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full text-[10px] font-mono uppercase mb-6 animate-pulse">
                  Live Broadcast
                </span>
                <h2 className="text-3xl md:text-4xl font-display font-medium text-white mb-8">
                  {activeQuestionData.question}
                </h2>

                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden max-w-lg mx-auto relative">
                  <div className="absolute inset-0 bg-white/5" />
                  <motion.div
                    className="h-full bg-red-500"
                    initial={{ width: '100%' }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ ease: "linear", duration: 1 }}
                  />
                </div>
                <div className="mt-2 text-xs font-mono text-zinc-500">
                  {timer}s remaining of {maxTime}s
                </div>
              </div>
            )}

            {status === 'INTERMISSION' && (
              <div className="text-zinc-500">
                <Lock size={48} className="mx-auto mb-4 opacity-50" />
                <h2 className="text-2xl font-display">Intermission</h2>
                <p>Question ended. Submissions closed.</p>
              </div>
            )}

            {status === 'ENDED' && (
              <div className="text-green-500">
                <CheckCircle2 size={48} className="mx-auto mb-4" />
                <h2 className="text-2xl font-display text-white">Operation Complete</h2>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="bg-[#121214] border border-white/5 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col justify-center text-center md:text-left">
              <span className="text-xs font-mono text-zinc-500 uppercase">Up Next:</span>
              <span className="text-sm text-white truncate max-w-[200px]">
                {questions[currentQ] ? `Q${currentQ + 1}: ${questions[currentQ].question}` : 'END OF QUEUE'}
              </span>
              {questions[currentQ] && (
                <span className="text-[10px] font-mono text-zinc-500">
                  Duration: {questions[currentQ].time}s
                </span>
              )}
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              {status === 'ACTIVE' ? (
                <Button
                  size="lg"
                  onClick={stopQuestion}
                  className="w-full md:w-auto bg-zinc-800 hover:bg-zinc-700 text-white border border-white/10 font-mono"
                >
                  <StopCircle size={18} className="mr-2" /> STOP QUESTION
                </Button>
              ) : (
                <Button
                  size="lg"
                  onClick={activateNext}
                  disabled={status === 'ENDED' || currentQ >= questions.length}
                  className={`w-full md:w-auto font-mono text-sm tracking-wide ${status === 'ENDED' || currentQ >= questions.length ? 'bg-zinc-800 text-zinc-500' : 'bg-orange-600 hover:bg-orange-700 text-white shadow-[0_0_20px_rgba(234,88,12,0.3)]'
                    }`}
                >
                  {currentQ === 0 ? <Play size={18} className="mr-2" /> : <ChevronRight size={18} className="mr-2" />}
                  {currentQ === 0 ? 'START MATCH' : 'ACTIVATE NEXT'}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Live Feed / Stats */}
        <div className="bg-[#121214] border border-white/5 rounded-xl flex flex-col overflow-hidden h-[300px] lg:h-auto">
          <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
            <span className="text-xs font-mono uppercase text-zinc-400 flex items-center gap-2">
              <Terminal size={12} /> Live Feed
            </span>
            <div className="flex gap-2 text-[10px] font-mono">
              <span className="text-green-500">{submissions.length} Total</span>
            </div>
          </div>

          <div className="flex-grow p-4 space-y-2 overflow-y-auto custom-scrollbar">
            {sortedSubmissions.length === 0 ? (
              <div className="text-center py-10 text-zinc-600 text-xs font-mono">
                Waiting for incoming packets...
              </div>
            ) : (
              sortedSubmissions.map((submission) => (
                <motion.div
                  key={submission._id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between text-xs p-2 rounded bg-zinc-900/50 border border-white/5"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    {/* Status Indicator */}
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${submission.correct ? 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]' : 'bg-zinc-600'}`} />

                    <div className="flex flex-col truncate">
                      <span className="text-zinc-300 truncate w-24 md:w-32 font-medium">
                        {/* In real app, replace with user Name */}
                        {submission.userId.slice(0, 12)}...
                      </span>
                      <span className="text-[10px] text-zinc-600 truncate max-w-[120px]">
                        Ans: {submission.answer}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="font-mono text-zinc-400">{submission.timeTakenMs}s</span>
                    <span className="text-[8px] text-zinc-600 font-mono">
                      {new Date(submission.submittedAt).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}