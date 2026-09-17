import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const add = mutation({
  args: {
    date: v.string(),
    title: v.string(),
    focus: v.string(),
    durationMin: v.number(),
    intensity: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Sessão inválida");
    if (args.title.trim().length === 0) throw new Error("Título obrigatório");
    return await ctx.db.insert("trainings", {
      userId,
      date: args.date,
      title: args.title.trim(),
      focus: args.focus,
      durationMin: args.durationMin,
      intensity: Math.max(1, Math.min(5, args.intensity)),
      notes: args.notes,
      createdAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("trainings") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Sessão inválida");
    const t = await ctx.db.get(args.id);
    if (!t || t.userId !== userId) throw new Error("Não encontrado");
    await ctx.db.delete(args.id);
  },
});

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("trainings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});
