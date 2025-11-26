import { v } from "convex/values";
import { internalQuery, mutation, query } from "./_generated/server";
export const getQuestionByRoundID = query({
  args: {
    roundId: v.id("rounds"),
  },
  handler: async (ctx, args) => {
    const questions = await ctx.db.query("questions").filter((q) => q.eq(q.field("roundId"), args.roundId)).order("asc").collect();
    return questions;
  },
});
export const allQuestions = query({
  handler: async (ctx) => {
    return await ctx.db.query("questions").order("asc").collect();
  },
});

export const createQuestions = mutation({
  args: {
    question: v.string(),
    answer: v.string(),
    time: v.number(),
    fuzzy: v.boolean(),
    roundId: v.id("rounds"),
  },
  handler: async (ctx, args) => {
    const newQuestionId = await ctx.db.insert("questions", {
      status: "WAITING",
      ...args
    });
    return await ctx.db.get(newQuestionId);
  },
});

export const updateQuestions = mutation({
  args: {
    _id: v.id("questions"),
    question: v.optional(v.string()),
    answer: v.optional(v.string()),
    time: v.optional(v.number()),
    fuzzy: v.optional(v.boolean()),
    roundId: v.optional(v.id("rounds")),
    status: v.optional(
      v.union(
        v.literal("WAITING"),
        v.literal("ACTIVE"),
        v.literal("INTERMISSION"),
        v.literal("ENDED")
      )
    ),
  },
  handler: async (ctx, args) => {
    const { _id, ...updates } = args;
    await ctx.db.patch(_id, updates);
    return { success: true };
  },
});

export const deleteQuestions = mutation({
  args: {
    _id: v.id("questions"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args._id);
    return { success: true };
  },
})


export const internalGetQuestionById = internalQuery({
  args: {
    id: v.id("questions"),
  },
  handler: async (ctx, args) => {
    const question = await ctx.db.query("questions").filter((q) => q.eq(q.field("_id"), args.id)).first();
    return question;
  },
})