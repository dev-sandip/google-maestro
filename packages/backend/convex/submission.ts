import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalQuery, mutation, query } from "./_generated/server";
import { getCurrentUserOrThrow } from "./users";

export const getSubmissionsByUser = query({
  args: {
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      return {
        message: "Not authenticated",
      };
    }
    const submissions = await ctx.db.query("submissions").filter((q) => q.eq(q.field("userId"), identity.subject)).first();
    return submissions;
  },
})

export const getSubmissionsByQuestions = query({
  args: {
    questionId: v.id("questions"),
  },
  handler: async (ctx, args) => {
    const submissions = await ctx.db.query("submissions").filter((q) => q.eq(q.field("questionId"), args.questionId)).first();
    return submissions;
  },
})

export const getSubmissionsByRound = query({
  args: {
    roundId: v.id("rounds"),
  },
  handler: async (ctx, args) => {
    const submissions = await ctx.db.query("submissions").filter((q) => q.eq(q.field("roundId"), args.roundId)).collect();
    return submissions;
  },
})
export const getSubmissionById = query({
  args: {
    id: v.id("submissions"),
  },
  handler: async (ctx, args) => {
    const submission = await ctx.db.query("submissions").filter((q) => q.eq(q.field("_id"), args.id)).first();
    return submission;
  },
})
export const internalGetSubmissionById = internalQuery({
  args: {
    id: v.id("submissions"),
  },
  handler: async (ctx, args) => {
    const submission = await ctx.db.query("submissions").filter((q) => q.eq(q.field("_id"), args.id)).first();
    return submission;
  },
})
export const createSubmissions = mutation({
  args: {
    questionId: v.id("questions"),
    roundId: v.id("rounds"),
    answer: v.string(),
    submittedAt: v.number(),
    timeTakenMs: v.number(),
    correct: v.optional(v.boolean()),
    fuzzy: v.optional(v.boolean()),
    score: v.optional(v.number()),
    normalizedAnswer: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUserOrThrow(ctx)
    //TODO:Yesma chaie loggin user fetch garera userId display hanne hai.
    const submissionId = await ctx.db.insert("submissions", {
      userId: currentUser._id,
      questionId: args.questionId,
      roundId: args.roundId,
      answer: args.answer,
      submittedAt: args.submittedAt,
      timeTakenMs: args.timeTakenMs,
      correct: args.correct,
      fuzzy: args.fuzzy,
      score: args.score,
      normalizedAnswer: args.normalizedAnswer,
    });
    await ctx.scheduler.runAfter(0, internal.actions.judgeSubmission.default, {
      submissionId,
    });
    return submissionId;
  },
})

export const deleteSubmissions = mutation({
  args: {
    id: v.id("submissions"),
  },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
    return { success: true };
  },
})
