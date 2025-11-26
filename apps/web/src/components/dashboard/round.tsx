
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@google-maestro-new/backend/convex/_generated/api";
import type { Doc } from "@google-maestro-new/backend/convex/_generated/dataModel";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery } from "convex/react";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  Lock,
  Search,
  Send,
  Wifi,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import z from "zod";
import { GameHeader } from "./game-header";

interface RoundPageProps {
  questions: Question[];
}
type Question = Doc<"questions">;

export default function RoundPage({ questions = [] }: RoundPageProps) {
  // --- DERIVED STATE FROM BACKEND ---
  // Find the question that is currently live, or the one that just finished (Intermission)
  // If nothing is active/intermission, we default to the first waiting one or the last one.
  const activeQuestion = questions.find((q) => q.status === "ACTIVE");
  const intermissionQuestion = questions.find((q) => q.status === "INTERMISSION");

  // The question we should currently display
  const currentQuestion = activeQuestion || intermissionQuestion || questions.find(q => q.status === "WAITING") || questions[0];
  const currentQIndex = questions.findIndex(q => q._id === currentQuestion?._id);

  // --- LOCAL STATE ---
  const [timeLeft, setTimeLeft] = useState(currentQuestion?.time || 60);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionTime, setSubmissionTime] = useState<number | null>(null);

  const createSubmission = useMutation(api.submission.createSubmissions);
  const user = useQuery(api.users.current);
  console.log(user)

  // --- SYNC STATE WHEN QUESTION CHANGES ---
  useEffect(() => {
    if (currentQuestion) {
      // If a new question becomes active, reset local state
      // We track this by checking if the timeLeft matches the new question's max time (roughly)
      // Or better, we just reset if the ID changes.
      // Note: We don't reset time if it's the SAME question just updating status.
    }
  }, [currentQuestion?._id]);

  // Reset mechanism when moving to a NEW question
  const [lastQuestionId, setLastQuestionId] = useState<string>("");
  if (currentQuestion && currentQuestion._id !== lastQuestionId) {
    setLastQuestionId(currentQuestion._id);
    setTimeLeft(currentQuestion.time);
    setIsSubmitted(false);
    setSubmissionTime(null);
  }

  // --- TIMER LOGIC ---
  useEffect(() => {
    let interval: NodeJS.Timeout;

    // Run timer if status is ACTIVE and time remains.
    // Note: We removed !isSubmitted, so timer continues even after submission.
    if (currentQuestion?.status === "ACTIVE" && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [currentQuestion?.status, timeLeft]);

  // --- FORM SETUP ---
  const form = useForm({
    defaultValues: {
      answer: "",
    },
    onSubmit: async ({ value }) => {
      if (!user || !currentQuestion) return;
      if (currentQuestion.status !== "ACTIVE") {
        toast.error("Question is not active");
        return;
      }
      if (timeLeft <= 0) {
        toast.error("Time has expired");
        return;
      }

      try {
        const timeTaken = currentQuestion.time - timeLeft;
        setSubmissionTime(timeTaken);

        await createSubmission({
          roundId: currentQuestion.roundId,
          questionId: currentQuestion._id,
          answer: value.answer,
          submittedAt: Date.now(),
          timeTakenMs: timeTaken,
        });

        setIsSubmitted(true);
        toast.success("Answer submitted!");
      } catch (error) {
        console.error(error);
        toast.error("Failed to submit answer");
      }
    },
    validators: {
      onChange: z.object({
        answer: z.string().min(1, "Answer is required"),
      }),
    },
  });

  // Safety Loading State
  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090B] text-zinc-500 font-mono">
        Loading mission parameters...
      </div>
    );
  }

  const isTimeUp = timeLeft === 0;
  const isInputDisabled = isSubmitted || isTimeUp || currentQuestion.status !== "ACTIVE";

  return (
    <div className="min-h-screen bg-[#09090B] text-white font-sans selection:bg-orange-500/30 flex flex-col">
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <GameHeader
        roundTitle="Protocol: Obsidian"
        questionNumber={currentQIndex + 1}
        totalQuestions={questions.length}
      />

      <main className="flex-grow flex flex-col items-center justify-center relative z-10 p-4 pb-32">
        <AnimatePresence mode="wait">

          {/* STATE: WAITING */}
          {currentQuestion.status === "WAITING" && (
            <motion.div
              key="waiting"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="text-center max-w-md w-full"
            >
              <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-6 relative flex items-center justify-center">
                <div className="absolute inset-0 border border-dashed border-zinc-700 rounded-full animate-spin-slow" />
                <Wifi size={32} className="text-zinc-500 relative z-10" />
              </div>
              <h2 className="text-xl md:text-2xl font-display font-medium mb-2">
                Syncing with Host...
              </h2>
              <p className="text-zinc-500 font-mono text-sm px-4">
                Waiting for admin to activate Question {currentQIndex + 1}.
              </p>
            </motion.div>
          )}

          {/* STATE: ACTIVE (Game is ON) */}
          {currentQuestion.status === "ACTIVE" && (
            <motion.div
              key={`q-${currentQuestion._id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-3xl"
            >
              {/* Timer Header */}
              <div className="sticky top-16 md:static z-20 bg-[#09090B]/95 md:bg-transparent backdrop-blur md:backdrop-blur-none py-4 mb-4 md:mb-8 flex items-center justify-between w-full border-b border-white/5 md:border-none">
                <div
                  className={`flex items-center gap-2 font-mono text-base md:text-lg font-bold tabular-nums shrink-0 ${timeLeft < 10 ? "text-red-500 animate-pulse" : "text-white"
                    }`}
                >
                  <Clock size={18} className="md:w-5 md:h-5" />
                  00:{timeLeft.toString().padStart(2, "0")}s
                </div>
                <div className="h-2 flex-grow mx-3 md:mx-4 bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: "100%" }}
                    animate={{
                      width: `${(timeLeft / currentQuestion.time) * 100}%`,
                    }}
                    transition={{ ease: "linear", duration: 1 }}
                    className={`h-full ${timeLeft < 10 ? "bg-red-500" : "bg-orange-500"
                      }`}
                  />
                </div>
              </div>

              {/* Question Card */}
              <div className="bg-[#121214] border border-white/10 rounded-xl md:rounded-2xl p-6 md:p-12 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-32 bg-blue-500/5 blur-[80px] pointer-events-none" />

                <div className="flex justify-between items-start mb-6">
                  <span className="inline-block px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                    Query_ID: #{currentQuestion._id.slice(-4)}
                  </span>
                  {isSubmitted && (
                    <span className="flex items-center gap-2 text-green-500 text-xs font-mono uppercase border border-green-500/20 bg-green-500/10 px-3 py-1 rounded-full">
                      <CheckCircle2 size={12} /> Submitted
                    </span>
                  )}
                </div>

                <h1 className="text-xl md:text-3xl font-display font-medium leading-snug md:leading-tight mb-8">
                  {currentQuestion.question}
                </h1>

                <div className="flex items-center gap-2 text-zinc-500 text-[10px] md:text-xs font-mono border-t border-white/5 pt-6">
                  <AlertCircle size={14} />
                  <span>
                    {isSubmitted
                      ? `Response locked. Time remaining: ${timeLeft}s`
                      : "Timer active. Input disabled when counter hits zero."}
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* STATE: INTERMISSION */}
          {currentQuestion.status === "INTERMISSION" && (
            <motion.div
              key="intermission"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="text-center max-w-md w-full"
            >
              <div className="w-16 h-16 mx-auto mb-6 bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800">
                <Lock size={24} className="text-zinc-500" />
              </div>
              <h2 className="text-xl md:text-2xl font-display font-medium mb-2">
                Question {currentQIndex + 1} Ended
              </h2>
              <p className="text-zinc-500 font-mono text-sm px-4 mb-8">
                Submissions are closed. Waiting for admin to activate the next protocol.
              </p>
            </motion.div>
          )}

          {/* STATE: COMPLETED (Using specific status or if no questions left) */}
          {currentQuestion.status === "ENDED" && (
            <motion.div
              key="completed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <h2 className="text-3xl font-display font-bold text-white mb-4">
                Round Complete
              </h2>
              <p className="text-zinc-500 mb-8">
                Calculated scores are available on the leaderboard.
              </p>
              <Button className="bg-white text-black hover:bg-zinc-200">
                View Leaderboard
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* INPUT AREA - Visible only during ACTIVE */}
      <AnimatePresence>
        {currentQuestion.status === "ACTIVE" && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 p-4 bg-[#09090B] border-t border-white/10 z-20 pb-6 md:pb-4"
          >
            <div className="max-w-3xl mx-auto w-full">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!isInputDisabled) form.handleSubmit();
                }}
                className="relative group"
              >
                {isSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full h-12 md:h-14 bg-zinc-900/50 border border-zinc-800 rounded-lg flex items-center justify-between px-4 text-zinc-400 font-mono text-xs md:text-sm"
                  >
                    <span className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-green-500" />
                      Answer recorded in {submissionTime}s
                    </span>
                    <span className="text-zinc-600 flex items-center gap-2">
                      <Loader2 size={12} className="animate-spin" />
                      {timeLeft > 0 ? `Round active (${timeLeft}s)` : "Waiting for next Q..."}
                    </span>
                  </motion.div>
                ) : (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-blue-500/20 rounded-lg blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />

                    <div className={`relative flex items-center bg-[#121214] border border-white/10 rounded-lg shadow-lg ${isTimeUp ? 'opacity-50' : ''}`}>
                      <form.Field name="answer">
                        {(field) => (
                          <>
                            <div className="pl-4 text-zinc-500">
                              <Search size={18} className="md:w-5 md:h-5" />
                            </div>
                            <Input
                              autoFocus
                              disabled={isInputDisabled}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) => field.handleChange(e.target.value)}
                              placeholder={isTimeUp ? "Time expired." : "Input answer here..."}
                              className="h-12 md:h-14 border-none bg-transparent shadow-none focus-visible:ring-0 text-base md:text-lg font-mono text-white placeholder:text-zinc-700"
                            />
                          </>
                        )}
                      </form.Field>
                      <div className="pr-2">
                        <form.Subscribe>
                          {(state) => (
                            <Button
                              type="submit"
                              size="sm"
                              disabled={!state.canSubmit || state.isSubmitting || isInputDisabled}
                              className="bg-white text-black hover:bg-zinc-200 font-mono text-[10px] md:text-xs h-8 md:h-9"
                            >
                              {state.isSubmitting ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : (
                                <>
                                  ENTER <Send size={12} className="ml-2" />
                                </>
                              )}
                            </Button>
                          )}
                        </form.Subscribe>
                      </div>
                    </div>
                  </>
                )}
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}