import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  handler: async (ctx) => {
    return await ctx.db.query("policies").order("desc").collect();
  },
});

export const save = mutation({
  args: { text: v.string(), summary: v.string() },
  handler: async (ctx, args) => {
    // If this is the first policy, make it active by default
    const existingPolicies = await ctx.db.query("policies").collect();
    const isFirstPolicy = existingPolicies.length === 0;
    
    await ctx.db.insert("policies", {
      text: args.text,
      summary: args.summary,
      savedAt: new Date().toISOString(),
      isActive: isFirstPolicy, // First policy is active by default
    });
    
    // If this is the first policy, ensure no other policies are active
    if (isFirstPolicy) {
      // No other policies exist, so nothing to do
    }
  },
});

export const deletePolicy = mutation({
  args: { id: v.id("policies") },
  handler: async (ctx, args) => {
    // Check if the policy being deleted is active (before deleting)
    const policyToDelete = await ctx.db.get(args.id);
    if (!policyToDelete) {
      return; // Policy doesn't exist
    }
    
    const wasActive = policyToDelete.isActive;
    
    // Delete the policy
    await ctx.db.delete(args.id);
    
    // If we deleted the active policy, set the first remaining policy as active
    if (wasActive) {
      const remainingPolicies = await ctx.db.query("policies").order("desc").collect();
      if (remainingPolicies.length > 0) {
        // Set the first (most recent) remaining policy as active
        await ctx.db.patch(remainingPolicies[0]._id, { isActive: true });
      }
    }
  },
});

export const setActive = mutation({
  args: { id: v.id("policies") },
  handler: async (ctx, args) => {
    // First, set all policies to inactive
    const allPolicies = await ctx.db.query("policies").collect();
    for (const policy of allPolicies) {
      await ctx.db.patch(policy._id, { isActive: false });
    }
    
    // Then, set the selected policy as active
    await ctx.db.patch(args.id, { isActive: true });
  },
});

