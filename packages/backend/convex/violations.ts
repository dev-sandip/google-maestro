import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createViolation = mutation({
  args: {
    type: v.string(),
    timestamp: v.string(),
    userAgent: v.string(),
    url: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const violationId = await ctx.db.insert("violations", {
      type: args.type,
      timestamp: args.timestamp,
      userAgent: args.userAgent,
      url: args.url,
      userId: args.userId,
    });
    return violationId;
  },
});

// Query to get all violations
export const getAllViolations = query({
  handler: async (ctx) => {
    return await ctx.db.query("violations").order("desc").collect();
  },
});

// Query to get violations by user
export const getViolationsByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("violations")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
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
