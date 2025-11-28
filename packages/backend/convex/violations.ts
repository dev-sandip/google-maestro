import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createViolation = mutation({
  args: {
    type: v.string(),
    timestamp: v.string(),
    userAgent: v.string(),
    url: v.string(),
    userId: v.id("users"),
    roundId: v.id("rounds"),
  },
  handler: async (ctx, args) => {
    const violationId = await ctx.db.insert("violations", {
      type: args.type,
      timestamp: args.timestamp,
      userAgent: args.userAgent,
      url: args.url,
      userId: args.userId,
      roundId: args.roundId,
    });
    return violationId;
  },
});

// Query to get all violations
export const getAllViolations = query({
  handler: async (ctx) => {
    const data = await ctx.db.query("violations").order("desc").collect();
    const userIds = [...new Set(data.map(e => e.userId))];
    const users = await Promise.all(
      userIds.map(id => ctx.db.get(id))
    );
    const userMap = new Map(
      users
        .filter((u): u is NonNullable<typeof u> => u !== null)
        .map(user => [user._id, user])
    );
    return data.map(violation => ({
      ...violation,
      user: userMap.get(violation.userId)
    }));
  },
});

// Query to get violations by user
export const getViolationsByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const data = await ctx.db
      .query("violations")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
    const roundIds = [...new Set(data.map(e => e.roundId))];
    const rounds = await Promise.all(
      roundIds.map(id => ctx.db.get(id))
    );
    const roundMap = new Map(
      rounds
        .filter((r): r is NonNullable<typeof r> => r !== null)
        .map(round => [round._id, round])
    );
    return data.map(violation => ({
      ...violation,
      round: roundMap.get(violation.roundId)
    }));
  },
});
export const getViolationsByRound = query({
  args: { roundId: v.id("rounds") },
  handler: async (ctx, args) => {
    const data = await ctx.db
      .query("violations")
      .withIndex("by_round", (q) => q.eq("roundId", args.roundId))
      .order("desc")
      .collect();
    const userIds = [...new Set(data.map(e => e.userId))];
    const users = await Promise.all(
      userIds.map(id => ctx.db.get(id))
    );
    const userMap = new Map(
      users
        .filter((u): u is NonNullable<typeof u> => u !== null)
        .map(user => [user._id, user])
    );
    return data.map(violation => ({
      ...violation,
      user: userMap.get(violation.userId)
    }));
  },
});
// Mutation to delete all violations (admin only)
export const deleteAllViolations = mutation({
  handler: async (ctx) => {
    const violations = await ctx.db.query("violations").collect();
    for (const violation of violations) {
      await ctx.db.delete(violation._id);
    }
    return { deleted: violations.length };
  },
});
