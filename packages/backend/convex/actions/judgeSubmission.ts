'use node'
import { v } from "convex/values";
import { internal } from "../_generated/api";
import { Id } from "../_generated/dataModel";
import { internalAction } from "../_generated/server";

function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) {
    for (let j = 0; j <= n; j++) {
      if (i === 0) dp[i][j] = j;
      else if (j === 0) dp[i][j] = i;
      else if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1];
      else dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function RankedFuzzySearch(query: string, candidates: string[], maxDistance: number): string[] {
  const results = candidates
    .map(item => ({
      item,
      distance: levenshteinDistance(query.toLowerCase(), item.toLowerCase())
    }))
    .filter(r => r.distance <= maxDistance);

  results.sort((a, b) => a.distance - b.distance);
  return results.map(r => r.item);
}
// ──────────────────────────────────────────────────────────────

export default internalAction({
  args: { submissionId: v.id("submissions") },
  handler: async (ctx, { submissionId }) => {
    try {
      console.log("Action Started")
      const submission = await ctx.runQuery(internal.submission.internalGetSubmissionById, { id: submissionId });
      if (!submission || submission.correct !== undefined) {
        console.log("Already judged or missing:", submissionId);
        return;
      }
      if (!submission.questionId) {
        console.log("Question not found:", submissionId);
        return;
      }

      const question = await ctx.runQuery(internal.questions.internalGetQuestionById, { id: submission.questionId });
      if (!question?.answer) return;

      const userAnswer = submission.answer.trim();
      const correctAnswer = question.answer.trim();
      console.log("Action fetched ")
      let correct = false;
      let fuzzy = question.fuzzy;
      let score = 0;

      // 1. Exact match → full points
      if (userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
        correct = true;
        score = Math.max(100, 1000 - Math.floor(submission.timeTakenMs / 10));
      }
      // 2. Fuzzy match → partial points
      if (fuzzy) {
        const possibleAnswers = question.alternativeAnswers
          ? [correctAnswer, ...question.alternativeAnswers]
          : [correctAnswer];

        const matches = RankedFuzzySearch(userAnswer, possibleAnswers, 3); // maxDistance = 3

        if (matches.length > 0) {
          correct = true;
          fuzzy = true;
          // Penalty based on distance
          const bestDistance = levenshteinDistance(userAnswer.toLowerCase(), matches[0].toLowerCase());
          score = Math.max(50, 800 - bestDistance * 50 - Math.floor(submission.timeTakenMs / 15));
        }
      }
      // After calculating `scorenull` and before the batch mutation

      let rank: number = 0;
      console.log("user id is ", submission.userId)
      //TODO:FIX this shit
      // Batch update submission + leaderboard
      const leaderboard = await ctx.runMutation(internal.internals.updateSubmissionAndLeaderboard, {
        submissionId,
        correct,
        fuzzy,
        score,
        roundId: submission.roundId,
        userId: submission.userId,
        newTimeTakenMs: correct ? submission.timeTakenMs : 0,
        submittedAt: submission.submittedAt,
      });

      if (correct && submission.roundId) {
        const leaderboardEntries = await ctx.runQuery(internal.leaderboard.getLeaderBoardByRoundInternal, {
          roundId: submission.roundId,
        });

        const myScore = leaderboardEntries.find(e => e.userId === submission.userId)?.totalScore ?? 0;
        const myTime = leaderboardEntries.find(e => e.userId === submission.userId)?.totalTimeTakenMs ?? Infinity;

        let currentRank = 1;
        for (const entry of leaderboardEntries) {
          if (entry.userId === submission.userId) continue;

          const score = entry.totalScore ?? 0;
          const time = entry.totalTimeTakenMs ?? Infinity;

          if (score > myScore || (score === myScore && time < myTime)) {
            currentRank++;
          }
        }

        rank = currentRank;
        await ctx.runMutation(internal.internals.updateRank, {
          id: leaderboard.id as Id<"leaderboard">,
          rank,
        });
        console.log(`Judged ${submissionId} → ${correct ? "CORRECT" : "WRONG"} (score: ${score}) and rank ${rank}`);
      }
    } catch (err) {
      console.error("judgeSubmission failed:", err);
      // Optional: retry once
      // await ctx.scheduler.runAfter(5000, internal.actions.judgeSubmission, { submissionId });
    }
  },
});