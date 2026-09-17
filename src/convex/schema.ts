import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  teams: defineTable({
    name: v.string(),
    short: v.string(),
    city: v.string(),
    color: v.string(),
    rating: v.number(),
    played: v.number(),
    won: v.number(),
    drawn: v.number(),
    lost: v.number(),
    goalsFor: v.number(),
    goalsAgainst: v.number(),
    points: v.number(),
  }),
  matches: defineTable({
    round: v.number(),
    kickoff: v.number(),
    status: v.union(
      v.literal("scheduled"),
      v.literal("live"),
      v.literal("finished"),
    ),
    minute: v.number(),
    lastTickAt: v.number(),
    homeIdx: v.number(),
    awayIdx: v.number(),
    homeTeamId: v.id("teams"),
    awayTeamId: v.id("teams"),
    homeScore: v.number(),
    awayScore: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_round", ["round"])
    .index("by_kickoff", ["kickoff"]),
  trainings: defineTable({
    userId: v.id("users"),
    date: v.string(), // YYYY-MM-DD
    title: v.string(),
    focus: v.string(),
    durationMin: v.number(),
    intensity: v.number(), // 1..5
    notes: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_date", ["userId", "date"]),
  news: defineTable({
    title: v.string(),
    summary: v.string(),
    body: v.string(),
    tag: v.string(),
    publishedAt: v.number(),
  }).index("by_published", ["publishedAt"]),
});
