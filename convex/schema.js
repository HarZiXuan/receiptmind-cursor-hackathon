import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  receipts: defineTable({
    display_id: v.number(), // Original numeric ID
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
  }),
  policies: defineTable({
    text: v.string(),
    summary: v.string(),
    savedAt: v.string(),
    isActive: v.optional(v.boolean()),
  }),
});

