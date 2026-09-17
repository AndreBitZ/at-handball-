import { query } from "./_generated/server";

export const latest = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("news")
      .withIndex("by_published", (q) => q.gte("publishedAt", 0))
      .order("desc")
      .collect();
  },
});
