import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	users: defineTable({
		name: v.string(),
		// this the Clerk ID, stored in the subject JWT field
		externalId: v.string(),
	}).index("byExternalId", ["externalId"]),
	todos: defineTable({
		text: v.string(),
		completed: v.boolean(),
	}),
	rounds: defineTable({
		title: v.string(),
		description: v.string(),
		startAt: v.string(),
		status: v.union(
			v.literal("LIVE"),
			v.literal("UPCOMING"),
			v.literal("COMPLETED")
		),
		participants: v.optional(v.array(v.id("user"))),
	}),
	questions: defineTable({
		question: v.string(),
		answer: v.string(),
		time: v.number(),
		fuzzy: v.boolean(),
		status: v.optional(
			v.union(
				v.literal("WAITING"),
				v.literal("ACTIVE"),
				v.literal("INTERMISSION"),
				v.literal("ENDED")
			)
		),
		alternativeAnswers: v.optional(v.array(v.string())),
		roundId: v.id("rounds"),
	}).index("by_round", ["roundId"]),
	submissions: defineTable({
		roundId: v.id("rounds"),
		questionId: v.id("questions"),
		userId: v.id("users"),//takes only alphanumeric characters
		answer: v.string(),
		submittedAt: v.number(), // Date.now() — crucial for tiebreakers
		timeTakenMs: v.number(), // milliseconds from question reveal → submit

		// Judged fields (written later by a background function)
		correct: v.optional(v.boolean()),
		fuzzy: v.optional(v.boolean()),
		score: v.optional(v.number()), // e.g., 1000 - timeTakenMs/10

		// Optional: store normalized answer for fuzzy matching
		normalizedAnswer: v.optional(v.string()),
	})
		.index("by_round", ["roundId"])
		.index("by_user_round", ["userId", "roundId"])
		.index("by_question", ["questionId"])
		.index("by_round_submitted", ["roundId", "submittedAt"]), // for live leaderboard
	leaderboard: defineTable({
		roundId: v.id("rounds"),
		userId: v.id("users"),
		totalScore: v.optional(v.number()),
		totalTimeTakenMs: v.optional(v.number()),
		correctCount: v.optional(v.number()),
		lastSubmissionAt: v.optional(v.number()),
		rank: v.optional(v.number()),
	})
		.index("by_round", ["roundId"])
		.index("by_round_score", [
			"roundId",
			"totalScore",
			"totalTimeTakenMs",
			"lastSubmissionAt",
		])
		.index("by_user_round", ["userId", "roundId"])
		.searchIndex("search_user_round", {
			searchField: "userId",
			filterFields: ["roundId"],
		}),

});
