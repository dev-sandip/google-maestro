import { v } from "convex/values";
import { internalMutation, internalQuery, query } from "./_generated/server";

export const getLeaderboardById = query({
  args: {
    id: v.id("leaderboard"),
  },
  handler: async (ctx, args) => {
    const leaderboard = await ctx.db.query("leaderboard").filter((q) => q.eq(q.field("_id"), args.id)).first();
    return leaderboard;
  },
})

export const getLeaderboardByRound = query({
  args: {
    roundId: v.id("rounds"),
  },
  handler: async (ctx, args) => {
    const leaderboard = await ctx.db.query("leaderboard").filter((q) => q.eq(q.field("roundId"), args.roundId)).collect();
    return { leaderboard };
  },
})
export const getLeaderBoardByRoundInternal = internalQuery({
  args: {
    roundId: v.id("rounds"),
  },
  handler: async (ctx, args) => {
    const leaderboard = await ctx.db.query("leaderboard").filter((q) => q.eq(q.field("roundId"), args.roundId)).collect();
    return leaderboard;
  },
})


export const createLeaderboard = internalMutation({
  args: {
    roundId: v.id("rounds"),
    userId: v.id("users"),
    totalScore: v.number(),
    totalTimeTakenMs: v.number(),
    correctCount: v.number(),
    lastSubmissionAt: v.number(),
    rank: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const leaderboardId = await ctx.db.insert("leaderboard", args);
    return leaderboardId;
  },
})

export const deleteLeaderboard = internalMutation({
  args: {
    id: v.id("leaderboard"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id)
  },
})