import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all employees
export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("employees").order("desc").collect();
  },
});

// Get active employees only
export const getActive = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("employees")
      .filter((q) => q.eq(q.field("isActive"), true))
      .order("desc")
      .collect();
  },
});

// Get employee by internal employee ID (e.g., "E-102")
export const getByEmployeeId = query({
  args: { employeeId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("employees")
      .withIndex("by_employee_id", (q) => q.eq("employeeId", args.employeeId))
      .first();
  },
});

// Get employee by email
export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("employees")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

// Get employee by phone number
export const getByPhoneNumber = query({
  args: { phoneNumber: v.string() },
  handler: async (ctx, args) => {
    const employees = await ctx.db.query("employees").collect();
    return employees.find(emp => emp.phoneNumber === args.phoneNumber);
  },
});

// Get employee by Convex ID
export const getById = query({
  args: { id: v.id("employees") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get employee with linked user data
export const getWithUser = query({
  args: { id: v.id("employees") },
  handler: async (ctx, args) => {
    const employee = await ctx.db.get(args.id);
    if (!employee) return null;

    let user = null;
    if (employee.userId) {
      user = await ctx.db.get(employee.userId);
    }

    return {
      ...employee,
      user,
    };
  },
});

// Create new employee
export const create = mutation({
  args: {
    employeeId: v.string(),
    name: v.string(),
    email: v.string(),
    phoneNumber: v.optional(v.string()),
    position: v.optional(v.string()),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    // Check if employee ID already exists
    const existingById = await ctx.db
      .query("employees")
      .withIndex("by_employee_id", (q) => q.eq("employeeId", args.employeeId))
      .first();
    
    if (existingById) {
      throw new Error(`Employee with ID ${args.employeeId} already exists`);
    }

    // Check if email already exists
    const existingByEmail = await ctx.db
      .query("employees")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    
    if (existingByEmail) {
      throw new Error(`Employee with email ${args.email} already exists`);
    }

    const employeeDbId = await ctx.db.insert("employees", {
      employeeId: args.employeeId,
      name: args.name,
      email: args.email,
      phoneNumber: args.phoneNumber,
      position: args.position,
      userId: args.userId,
      isActive: true,
      createdAt: new Date().toISOString(),
    });

    return employeeDbId;
  },
});

// Update employee
export const update = mutation({
  args: {
    id: v.id("employees"),
    employeeId: v.optional(v.string()),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    position: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    
    // If employeeId is being updated, check it doesn't conflict
    if (updates.employeeId) {
      const existing = await ctx.db
        .query("employees")
        .withIndex("by_employee_id", (q) => q.eq("employeeId", updates.employeeId))
        .first();
      
      if (existing && existing._id !== id) {
        throw new Error(`Employee ID ${updates.employeeId} is already in use`);
      }
    }

    // If email is being updated, check it doesn't conflict
    if (updates.email) {
      const existing = await ctx.db
        .query("employees")
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

// Link employee to user account
export const linkUser = mutation({
  args: {
    employeeId: v.id("employees"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Update employee with userId
    await ctx.db.patch(args.employeeId, { userId: args.userId });
    
    // Update user with employeeId
    await ctx.db.patch(args.userId, { employeeId: args.employeeId });

    return { employeeId: args.employeeId, userId: args.userId };
  },
});

// Unlink employee from user account
export const unlinkUser = mutation({
  args: {
    employeeId: v.id("employees"),
  },
  handler: async (ctx, args) => {
    const employee = await ctx.db.get(args.employeeId);
    if (!employee) {
      throw new Error("Employee not found");
    }

    // If employee has a linked user, unlink from user side too
    if (employee.userId) {
      await ctx.db.patch(employee.userId, { employeeId: undefined });
    }

    // Remove userId from employee
    await ctx.db.patch(args.employeeId, { userId: undefined });
  },
});

// Deactivate employee (soft delete)
export const deactivate = mutation({
  args: { id: v.id("employees") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { isActive: false });
  },
});

// Reactivate employee
export const activate = mutation({
  args: { id: v.id("employees") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { isActive: true });
  },
});

// Delete employee permanently
export const remove = mutation({
  args: { id: v.id("employees") },
  handler: async (ctx, args) => {
    // Get employee to check if they have linked user
    const employee = await ctx.db.get(args.id);
    if (employee && employee.userId) {
      // Unlink from user first
      await ctx.db.patch(employee.userId, { employeeId: undefined });
    }

    await ctx.db.delete(args.id);
  },
});

