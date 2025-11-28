import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const addEmails = mutation({
  args: {
    emails: v.array(v.string()),
    roundId: v.id("rounds"),
  },
  async handler(ctx, { emails, roundId }) {
    await ctx.db.insert("allowedUsers", { emails, roundId });
  },
});


export const getAllowedUsers = query({
  args: {
    roundId: v.id("rounds"),
  },
  async handler(ctx, args) {
    return await ctx.db.query("allowedUsers").withIndex("by_round", (q) => q.eq("roundId", args.roundId)).first();
  },
});

export const updateEmails = mutation({
  args: {
    id: v.id("allowedUsers"),
    emails: v.array(v.string()),
  },
  async handler(ctx, { id, emails }) {
    await ctx.db.patch(id, { emails });
  },
});
