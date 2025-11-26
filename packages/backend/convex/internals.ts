import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

export const updateSubmissionAndLeaderboard = internalMutation({
  args: {
    submissionId: v.id("submissions"),
    correct: v.boolean(),
    fuzzy: v.optional(v.boolean()),
    score: v.number(),
    roundId: v.id("rounds"),
    userId: v.id("users"),
    newTimeTakenMs: v.number(),     // timeTakenMs only if correct, otherwise 0
    submittedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const {
      submissionId,
      correct,
      fuzzy,
      score,
      roundId,
      userId,
      newTimeTakenMs,
      submittedAt,
    } = args;
    await ctx.db.patch(submissionId, {
      correct,
      fuzzy: fuzzy ?? false,
      score: correct ? score : 0,
    });
    if (!correct) {
      return { status: "incorrect", leaderboardUpdated: false };
    }

    const existing = await ctx.db
      .query("leaderboard")
      .withIndex("by_user_round", (q) =>
        q.eq("userId", userId).eq("roundId", roundId)
      )
      .unique();

    if (existing) {
      const id = await ctx.db.patch(existing._id, {
        totalScore: (existing.totalScore ?? 0) + score,
        totalTimeTakenMs: (existing.totalTimeTakenMs ?? 0) + newTimeTakenMs,
        correctCount: (existing.correctCount ?? 0) + 1,
        lastSubmissionAt: Math.max(existing.lastSubmissionAt ?? 0, submittedAt),
      });
      return { id, status: "correct", leaderboardUpdated: true };
    } else {
      // First correct answer → create leaderboard entry
      const id = await ctx.db.insert("leaderboard", {
        roundId,
        userId,
        totalScore: score,
        totalTimeTakenMs: newTimeTakenMs,
        correctCount: 1,
        lastSubmissionAt: submittedAt,
      });
      return { id, status: "correct", leaderboardUpdated: true };

    }

  },
});

export const updateRank = internalMutation({
  args: {
    id: v.id("leaderboard"),
    rank: v.number(),
  },
  handler: async (ctx, args) => {
    const { id, rank } = args;
    await ctx.db.patch(id, { _id: id, rank });
  },
})
