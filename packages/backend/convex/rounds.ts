import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db.query("rounds").collect();
  },
});
export const getRoundById = query({
  args: {
    roundId: v.id("rounds"),
  },
  handler: async (ctx, args) => {
    const round = await ctx.db.query("rounds").filter((q) => q.eq(q.field("_id"), args.roundId)).order("asc").first();
    return round;
  },
});
export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    startAt: v.string(),
    status: v.union(v.literal("LIVE"), v.literal("UPCOMING"), v.literal("COMPLETED")),
  },
  handler: async (ctx, args) => {
    const roundId = await ctx.db.insert("rounds", args);
    return roundId; // This is what we'll get back on the client
  },
});

export const update = mutation({
  args: {
    _id: v.id("rounds"),
    title: v.string(),
    description: v.string(),
    startAt: v.string(),
    status: v.union(v.literal("LIVE"), v.literal("UPCOMING"), v.literal("COMPLETED")),
  },
  handler: async (ctx, args) => {
    const { _id, ...updates } = args;
    await ctx.db.patch(_id, updates);
    return { success: true };
  },
});


export const deleteRound = mutation({
  args: { id: v.id("rounds") },
  handler: async (ctx, { id }) => {
    await Promise.all([
      // Delete all submissions for this round
      ctx.db
        .query("submissions")
        .withIndex("by_round", (q) => q.eq("roundId", id))
        .collect()
        .then((docs) => Promise.all(docs.map((d) => ctx.db.delete(d._id)))),

      ctx.db
        .query("leaderboard")
        .withIndex("by_round", (q) => q.eq("roundId", id))
        .collect()
        .then((docs) => Promise.all(docs.map((d) => ctx.db.delete(d._id)))),

      ctx.db
        .query("questions")
        .withIndex("by_round", (q) => q.eq("roundId", id))
        .collect()
        .then((docs) => Promise.all(docs.map((d) => ctx.db.delete(d._id)))),
    ]);

    // Step 2: Finally delete the round itself
    await ctx.db.delete(id);

    return { success: true, deletedRoundId: id };
  },
});