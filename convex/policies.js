import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all policies
export const get = query({
  handler: async (ctx) => {
    return await ctx.db.query("policies").order("desc").collect();
  },
});

// Get active policy
export const getActive = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("policies")
      .withIndex("by_current", (q) => q.eq("is_current", true))
      .first();
  },
});

// Get active version (same as getActive, but clearer name)
export const getActiveVersion = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("policies")
      .withIndex("by_current", (q) => q.eq("is_current", true))
      .first();
  },
});

// Get policy by version number
export const getByVersion = query({
  args: { version: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("policies")
      .withIndex("by_version", (q) => q.eq("version", args.version))
      .first();
  },
});

// Get all versions (ordered by version number)
export const getAllVersions = query({
  handler: async (ctx) => {
    const policies = await ctx.db.query("policies").collect();
    return policies.sort((a, b) => (b.version || 0) - (a.version || 0));
  },
});

// Save a new policy version
export const save = mutation({
  args: { 
    text: v.string(), 
    summary: v.string(),
    createdBy: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    
    // Get existing policies to determine version number
    const existingPolicies = await ctx.db.query("policies").collect();
    const isFirstPolicy = existingPolicies.length === 0;
    
    // Calculate next version number
    const maxVersion = existingPolicies.reduce(
      (max, policy) => Math.max(max, policy.version || 0), 
      0
    );
    const nextVersion = maxVersion + 1;

    // If this is the first policy, make it current by default
    // Otherwise, new policies are inactive until explicitly activated
    const policyId = await ctx.db.insert("policies", {
      text: args.text,
      summary: args.summary,
      version: nextVersion,
      savedAt: now,
      is_current: isFirstPolicy,
      effectiveFrom: isFirstPolicy ? now : undefined,
      createdBy: args.createdBy,
    });
    
    console.log(`✅ Created policy version ${nextVersion}${isFirstPolicy ? ' (current)' : ''}`);
    return policyId;
  },
});

// Delete a policy
export const deletePolicy = mutation({
  args: { id: v.id("policies") },
  handler: async (ctx, args) => {
    // Check if the policy being deleted is current (before deleting)
    const policyToDelete = await ctx.db.get(args.id);
    if (!policyToDelete) {
      return; // Policy doesn't exist
    }
    
    const wasCurrent = policyToDelete.is_current;
    
    // Delete the policy
    await ctx.db.delete(args.id);
    
    // If we deleted the current policy, set the most recent remaining policy as current
    if (wasCurrent) {
      const remainingPolicies = await ctx.db.query("policies").collect();
      if (remainingPolicies.length > 0) {
        // Sort by version and get the highest version
        const sortedPolicies = remainingPolicies.sort((a, b) => (b.version || 0) - (a.version || 0));
        const mostRecentPolicy = sortedPolicies[0];
        await ctx.db.patch(mostRecentPolicy._id, { 
          is_current: true,
          effectiveFrom: new Date().toISOString(),
        });
      }
    }
  },
});

// Set a specific policy version as current/active
export const setActive = mutation({
  args: { id: v.id("policies") },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    
    // First, set all policies to not current
    const allPolicies = await ctx.db.query("policies").collect();
    for (const policy of allPolicies) {
      await ctx.db.patch(policy._id, { is_current: false });
    }
    
    // Then, set the selected policy as current with effectiveFrom timestamp
    await ctx.db.patch(args.id, { 
      is_current: true,
      effectiveFrom: now,
    });
  },
});

// Update policy text (creates a new version internally if needed, or just updates the text)
export const update = mutation({
  args: {
    id: v.id("policies"),
    text: v.optional(v.string()),
    summary: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    
    // Filter out undefined values
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );

    await ctx.db.patch(id, filteredUpdates);
    return id;
  },
});

