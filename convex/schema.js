import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table - for authentication and system access
  users: defineTable({
    name: v.string(),
    email: v.string(),
    phoneNumber: v.optional(v.string()),
    role: v.string(), // "admin", "manager", "employee", "accountant"
    employeeId: v.optional(v.id("employees")), // Link to employee record
    isActive: v.boolean(),
    createdAt: v.string(),
    avatarUrl: v.optional(v.string()),
  }).index("by_email", ["email"]),

  // Employees table - staff members who submit receipts
  employees: defineTable({
    userId: v.optional(v.id("users")), // Link to user account if they can login
    employeeId: v.string(), // Internal ID like "E-102"
    name: v.string(),
    email: v.string(),
    phoneNumber: v.optional(v.string()),
    position: v.optional(v.string()),
    isActive: v.boolean(),
    createdAt: v.string(),
  })
    .index("by_employee_id", ["employeeId"])
    .index("by_email", ["email"]),

  // Receipts table - expense receipts with enhanced tracking
  receipts: defineTable({
    // NEW foreign keys
    employeeId: v.id("employees"), // Reference to employees table
    submittedBy: v.optional(v.id("users")), // Who submitted (if via user account)
    approvedBy: v.optional(v.id("users")), // Who approved
    
    // EXISTING fields (keep all for backwards compatibility)
    display_id: v.number(),
    employee_id: v.string(),
    employee_name: v.string(),
    submission_date: v.string(),
    receipt_date: v.string(),
    merchant_name: v.string(),
    total_amount: v.number(),
    category: v.string(),
    status: v.string(),
    is_flagged: v.boolean(),
    flag_reason: v.optional(v.string()),
    approver_id: v.optional(v.number()),
    image_url: v.string(),
    is_paid: v.boolean(),
    physical_id_tag: v.optional(v.string()),
    
    // NEW tracking fields
    payment_date: v.optional(v.string()),
    payment_reference: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_employee", ["employeeId"])
    .index("by_status", ["status"])
    .index("by_date", ["receipt_date"]),

  // Policies table - company policies with versioning
  policies: defineTable({
    text: v.string(),
    summary: v.string(),
    version: v.number(), // Track policy versions
    isActive: v.boolean(),
    createdBy: v.optional(v.id("users")), // Who created this version
    savedAt: v.string(),
    effectiveFrom: v.optional(v.string()),
  })
    .index("by_active", ["isActive"])
    .index("by_version", ["version"]),
});

