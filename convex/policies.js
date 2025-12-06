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
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .first();
  },
});

// Get active version (same as getActive, but clearer name)
export const getActiveVersion = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("policies")
      .withIndex("by_active", (q) => q.eq("isActive", true))
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
    return policies.sort((a, b) => b.version - a.version);
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

    // If this is the first policy, make it active by default
    // Otherwise, new policies are inactive until explicitly activated
    const policyId = await ctx.db.insert("policies", {
      text: args.text,
      summary: args.summary,
      version: nextVersion,
      savedAt: now,
      isActive: isFirstPolicy,
      effectiveFrom: isFirstPolicy ? now : undefined,
      createdBy: args.createdBy,
    });
    
    console.log(`✅ Created policy version ${nextVersion}${isFirstPolicy ? ' (active)' : ''}`);
    return policyId;
  },
});

// Delete a policy
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
    
    // If we deleted the active policy, set the most recent remaining policy as active
    if (wasActive) {
      const remainingPolicies = await ctx.db.query("policies").collect();
      if (remainingPolicies.length > 0) {
        // Sort by version and get the highest version
        const sortedPolicies = remainingPolicies.sort((a, b) => b.version - a.version);
        const mostRecentPolicy = sortedPolicies[0];
        await ctx.db.patch(mostRecentPolicy._id, { 
          isActive: true,
          effectiveFrom: new Date().toISOString(),
        });
      }
    }
  },
});

// Set a specific policy version as active
export const setActive = mutation({
  args: { id: v.id("policies") },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    
    // First, set all policies to inactive
    const allPolicies = await ctx.db.query("policies").collect();
    for (const policy of allPolicies) {
      await ctx.db.patch(policy._id, { isActive: false });
    }
    
    // Then, set the selected policy as active with effectiveFrom timestamp
    await ctx.db.patch(args.id, { 
      isActive: true,
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

