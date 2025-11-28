import { GenericQueryCtx } from "convex/server";
import { v } from "convex/values";
import { DataModel } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
let roomCode: string;
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
    const round = await ctx.db
      .query("rounds")
      .filter((q) => q.eq(q.field("_id"), args.roundId))
      .order("asc")
      .first();
    return round;
  },
});
export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    startAt: v.string(),
    status: v.union(
      v.literal("LIVE"),
      v.literal("UPCOMING"),
      v.literal("COMPLETED")
    ),
  },
  handler: async (ctx, args) => {
    roomCode = await generateUniqueRoomCode(ctx);
    if (!roomCode) throw new Error("Failed to generate unique room code");
    const roundId = await ctx.db.insert("rounds", { ...args, roomCode });
    return roundId; // This is what we'll get back on the client
  },
});

export const update = mutation({
  args: {
    _id: v.id("rounds"),
    title: v.string(),
    description: v.string(),
    startAt: v.string(),
    status: v.union(
      v.literal("LIVE"),
      v.literal("UPCOMING"),
      v.literal("COMPLETED")
    ),
  },
  handler: async (ctx, args) => {
    const { _id, ...updates } = args;
    await ctx.db.patch(_id, updates);
    return { success: true };
  },
});
export const addParticipant = mutation({
  args: {
    roomCode: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    let { roomCode, userId } = args;
    roomCode = roomCode.toUpperCase();
    // 1. Fetch user (validate existence + get email)
    const user = await ctx.db.get(userId);
    if (!user) {
      return { success: false, message: "User not found" };
    }

    if (!user.email) {
      return { success: false, message: "User has no email" };
    }

    const round = await ctx.db
      .query("rounds")
      .filter((q) => q.eq(q.field("roomCode"), roomCode))
      .first();
    console.log(round);
    if (!round) {
      return { success: false, message: "Invalid or expired room code" };
    }

    if (round.participants?.includes(userId)) {
      return { success: false, message: "Already joined" };
    }
    const allowedList = await ctx.db
      .query("allowedUsers")
      .withIndex("by_round", (q) => q.eq("roundId", round._id))
      .first();
    const doesEmailExist = allowedList?.emails.includes(user.email);
    if (!allowedList) {
      return { success: false, message: "Currently no guest list is set for this round" }
    }
    if (!allowedList.emails.includes(user.email)) {
      return { success: false, message: "You're not on the guest list. Ask the host to invite you." };
    }

    await ctx.db.patch(round._id, {
      participants: [...(round.participants || []), userId],
    });

    return { success: true, message: "Successfully joined!" };
  },
});

export const deleteRound = mutation({
  args: { id: v.id("rounds") },
  handler: async (ctx, { id }) => {
    await Promise.all([
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
    ctx.db
      .query("allowedUsers")
      .withIndex("by_round", (q) => q.eq("roundId", id))
      .collect()
      .then((docs) => Promise.all(docs.map((d) => ctx.db.delete(d._id))));

    // Step 2: Finally delete the round itself
    await ctx.db.delete(id);

    return { success: true, deletedRoundId: id };
  },
});

//send the round data if the participant is in the round

export const getRoundByParticipant = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const data = await ctx.db.query("rounds").collect();
    const rounds = data.filter((round) =>
      round.participants?.includes(args.userId)
    );
    return rounds;
  },
});

export async function generateUniqueRoomCode(
  ctx: GenericQueryCtx<DataModel>
): Promise<string> {
  const prefix = [
    "Turing",
    "VonNeumann",
    "Shannon",
    "Dijkstra",
    "Knuth",
    "Ritchie",
    "Torvalds",
    "Thompson",
    "Hopper",
    "Lovelace",
    "Babbage",
    "Berners",
    "Backus",
    "Wilkes",
    "Zuse",
    "Atanasoff",
    "Woz",
    "Moore",
    "Gates",
    "Jobs",
  ];

  const suffix = [
    "Core",
    "Bit",
    "Byte",
    "Gate",
    "Flip",
    "Flop",
    "ALU",
    "MUX",
    "Cache",
    "RAM",
    "ROM",
    "Bus",
    "Clock",
    "Pulse",
    "Shift",
    "Reg",
    "Stack",
    "Heap",
    "NAND",
    "NOR",
    "XOR",
    "Latch",
    "Zero",
    "One",
    "Quantum",
    "Silicon",
    "Transistor",
  ];
  let code: string;
  let attempts = 0;

  while (true) {
    if (attempts++ > 50) throw new Error("Failed to generate unique room code");

    const p = prefix[Math.floor(Math.random() * prefix.length)];
    const s = suffix[Math.floor(Math.random() * suffix.length)];
    code = (p + s).toUpperCase();

    const exists = await ctx.db
      .query("rounds")
      .withIndex("by_roomCode", (q) => q.eq("roomCode", code))
      .first();

    if (!exists) return code;
  }
}
