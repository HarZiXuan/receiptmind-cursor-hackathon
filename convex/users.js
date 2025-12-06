import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all users
export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").order("desc").collect();
  },
});

// Get active users only
export const getActive = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("isActive"), true))
      .order("desc")
      .collect();
  },
});

// Get user by email
export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

// Get user by ID
export const getById = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Create new user
export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phoneNumber: v.optional(v.string()),
    role: v.string(),
    employeeId: v.optional(v.id("employees")),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if email already exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    
    if (existing) {
      throw new Error(`User with email ${args.email} already exists`);
    }

    const userId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      phoneNumber: args.phoneNumber,
      role: args.role,
      employeeId: args.employeeId,
      isActive: true,
      createdAt: new Date().toISOString(),
      avatarUrl: args.avatarUrl,
    });

    return userId;
  },
});

// Update user
export const update = mutation({
  args: {
    id: v.id("users"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    role: v.optional(v.string()),
    employeeId: v.optional(v.id("employees")),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    
    // If email is being updated, check it doesn't conflict
    if (updates.email) {
      const existing = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", updates.email))
        .first();
      
      if (existing && existing._id !== id) {
        throw new Error(`Email ${updates.email} is already in use`);
      }
    }

    // Filter out undefined values
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );

    await ctx.db.patch(id, filteredUpdates);
    return id;
  },
});

// Deactivate user (soft delete)
export const deactivate = mutation({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { isActive: false });
  },
});

// Reactivate user
export const activate = mutation({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { isActive: true });
  },
});

// Delete user permanently
export const remove = mutation({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

