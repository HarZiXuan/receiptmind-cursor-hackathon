import { query, mutation, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

// Get all receipts
export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("receipts").order("desc").collect();
  },
});

// Get receipts with employee and user data joined
export const getWithDetails = query({
  args: {},
  handler: async (ctx) => {
    const receipts = await ctx.db.query("receipts").order("desc").collect();
    
    const receiptsWithDetails = await Promise.all(
      receipts.map(async (receipt) => {
        let employee = null;
        let submittedByUser = null;
        let approvedByUser = null;

        if (receipt.employeeId) {
          employee = await ctx.db.get(receipt.employeeId);
        }
        if (receipt.submittedBy) {
          submittedByUser = await ctx.db.get(receipt.submittedBy);
        }
        if (receipt.approvedBy) {
          approvedByUser = await ctx.db.get(receipt.approvedBy);
        }

        return {
          ...receipt,
          employee,
          submittedByUser,
          approvedByUser,
        };
      })
    );

    return receiptsWithDetails;
  },
});

// Get receipts by employee
export const getByEmployee = query({
  args: { employeeId: v.id("employees") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("receipts")
      .withIndex("by_employee", (q) => q.eq("employeeId", args.employeeId))
      .order("desc")
      .collect();
  },
});

// Get receipts by status
export const getByStatus = query({
  args: { status: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("receipts")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .order("desc")
      .collect();
  },
});

// Seed database with initial data
export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if data already exists
    const existingReceipts = await ctx.db.query("receipts").first();
    if (existingReceipts) {
      console.log("Database already contains receipts. Skipping seed.");
      return { message: "Database already seeded", count: 0 };
    }

    const now = new Date().toISOString();

    // First, create employees
    const employeeData = [
      {
        employeeId: 'E-102',
        name: 'Aina Rahman',
        email: 'aina.rahman@company.com',
        phoneNumber: '+60123456789',
        position: 'Sales Manager',
        isActive: true,
        createdAt: now,
      },
      {
        employeeId: 'E-221',
        name: 'Zhi Xuan',
        email: 'zhi.xuan@company.com',
        phoneNumber: '+60123456790',
        position: 'Marketing Executive',
        isActive: true,
        createdAt: now,
      },
      {
        employeeId: 'E-118',
        name: 'Mei Lin',
        email: 'mei.lin@company.com',
        phoneNumber: '+60123456791',
        position: 'HR Coordinator',
        isActive: true,
        createdAt: now,
      },
      {
        employeeId: 'E-142',
        name: 'Dev Sharma',
        email: 'dev.sharma@company.com',
        phoneNumber: '+60123456792',
        position: 'Software Engineer',
        isActive: true,
        createdAt: now,
      },
    ];

    const employeeIds = {};
    for (const emp of employeeData) {
      const empId = await ctx.db.insert("employees", emp);
      employeeIds[emp.employeeId] = empId;
    }

    // Now create receipts with proper foreign keys
    const mockReceipts = [
      {
        employeeId: employeeIds['E-102'],
        display_id: 401,
        employee_id: 'E-102',
        employee_name: 'Aina Rahman',
        submission_date: '2025-12-01T08:12:00Z',
        receipt_date: '2025-11-30',
        merchant_name: "Madam Kwan's",
        total_amount: 180.4,
        category: 'Client Meal',
        status: 'Flagged',
        is_flagged: true,
        flag_reason: 'Alcohol detected in line item',
        image_url: 'https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=800&q=80',
        is_paid: false,
        physical_id_tag: '#405',
        createdAt: '2025-12-01T08:12:00Z',
        updatedAt: '2025-12-01T08:12:00Z',
      },
      {
        employeeId: employeeIds['E-221'],
        display_id: 402,
        employee_id: 'E-221',
        employee_name: 'Zhi Xuan',
        submission_date: '2025-12-02T10:45:00Z',
        receipt_date: '2025-12-01',
        merchant_name: 'Grab Ride',
        total_amount: 36.8,
        category: 'Transport',
        status: 'Paid',
        is_flagged: false,
        flag_reason: '',
        approver_id: 10,
        image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
        is_paid: true,
        payment_date: '2025-12-02T15:00:00Z',
        physical_id_tag: '#406',
        createdAt: '2025-12-02T10:45:00Z',
        updatedAt: '2025-12-02T15:00:00Z',
      },
      {
        employeeId: employeeIds['E-118'],
        display_id: 403,
        employee_id: 'E-118',
        employee_name: 'Mei Lin',
        submission_date: '2025-12-03T09:01:00Z',
        receipt_date: '2025-12-02',
        merchant_name: 'Starbucks',
        total_amount: 24.1,
        category: 'Team Snacks',
        status: 'Approved',
        is_flagged: false,
        flag_reason: '',
        approver_id: 11,
        image_url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80',
        is_paid: false,
        physical_id_tag: null,
        createdAt: '2025-12-03T09:01:00Z',
        updatedAt: '2025-12-03T09:01:00Z',
      },
      {
        employeeId: employeeIds['E-142'],
        display_id: 404,
        employee_id: 'E-142',
        employee_name: 'Dev Sharma',
        submission_date: '2025-12-03T11:18:00Z',
        receipt_date: '2025-12-03',
        merchant_name: 'Hilton KL',
        total_amount: 420.0,
        category: 'Hotel',
        status: 'Pending Approve',
        is_flagged: false,
        flag_reason: '',
        image_url: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=800&q=80',
        is_paid: false,
        physical_id_tag: '#407',
        createdAt: '2025-12-03T11:18:00Z',
        updatedAt: '2025-12-03T11:18:00Z',
      }
    ];

    let insertedCount = 0;
    for (const r of mockReceipts) {
      await ctx.db.insert("receipts", r);
      insertedCount++;
    }
    
    console.log(`✅ Seeded ${employeeData.length} employees and ${insertedCount} receipts into database`);
    return { 
      message: "Database seeded successfully", 
      employeeCount: employeeData.length,
      receiptCount: insertedCount 
    };
  },
});

// Initiate payout with 30-second processing delay (server-side)
export const initiatePayout = mutation({
  args: { 
    id: v.id("receipts"),
    approvedBy: v.optional(v.id("users")),
    paymentReference: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Build the update object conditionally
    const updates = {
      status: "Approved",
      is_flagged: false,
      updatedAt: new Date().toISOString(),
    };

    // Only add approvedBy if it's provided
    if (args.approvedBy) {
      updates.approvedBy = args.approvedBy;
    }

    // Mark as approved immediately
    await ctx.db.patch(args.id, updates);
    
    // Schedule completion after 30 seconds (happens on server, survives browser refresh!)
    await ctx.scheduler.runAfter(
      30000, // 30 seconds in milliseconds
      internal.receipts.completePayoutInternal,
      { 
        receiptId: args.id,
        paymentReference: args.paymentReference || `PAY-${Date.now()}`,
      }
    );
    
    const completionTime = new Date(Date.now() + 30000).toISOString();
    console.log(`💰 Payment approved for receipt ${args.id}, will complete payment at ${completionTime}`);
    
    return { 
      receiptId: args.id, 
      status: "Approved",
      willCompleteAt: completionTime
    };
  },
});

// Internal mutation called by scheduler after 30 seconds
export const completePayoutInternal = internalMutation({
  args: { 
    receiptId: v.id("receipts"),
    paymentReference: v.string(),
  },
  handler: async (ctx, args) => {
    // This runs automatically on the server after 30 seconds
    await ctx.db.patch(args.receiptId, {
      status: "Paid",
      is_paid: true,
      payment_date: new Date().toISOString(),
      payment_reference: args.paymentReference,
      updatedAt: new Date().toISOString(),
    });
    
    console.log(`✅ Payment completed for receipt ${args.receiptId} with reference ${args.paymentReference}`);
  },
});

// Pay/Approve a receipt (instant, no delay - for admin override)
export const pay = mutation({
  args: { 
    id: v.id("receipts"),
    approvedBy: v.optional(v.id("users")),
    paymentReference: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const updates = {
      status: "Paid",
      is_paid: true,
      is_flagged: false,
      payment_date: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (args.approvedBy) {
      updates.approvedBy = args.approvedBy;
    }
    if (args.paymentReference) {
      updates.payment_reference = args.paymentReference;
    }

    await ctx.db.patch(args.id, updates);
  },
});

// Approve a receipt (without payment)
export const approve = mutation({
  args: { 
    id: v.id("receipts"),
    approvedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: "Approved",
      approvedBy: args.approvedBy,
      is_flagged: false,
      updatedAt: new Date().toISOString(),
    });
  },
});

// Reject a receipt
export const reject = mutation({
  args: { 
    id: v.id("receipts"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const receipt = await ctx.db.get(args.id);
    
    if (!receipt) {
      throw new Error("Receipt not found");
    }
    
    // Only allow rejecting receipts with "Pending Approve" status
    if (receipt.status !== "Pending Approve") {
      throw new Error("Can only reject receipts with 'Pending Approve' status");
    }
    
    const updates = {
      status: "Flagged",
      is_flagged: true,
      is_paid: false,
      updatedAt: new Date().toISOString(),
    };

    // Store rejection reason in flag_reason field
    if (args.reason) {
      updates.flag_reason = args.reason;
    }

    await ctx.db.patch(args.id, updates);
    
    console.log(`✅ Rejected receipt ${args.id}${args.reason ? ` with reason: ${args.reason}` : ''}`);
  },
});

// Reopen a flagged claim - change back to pending review
export const reopenClaim = mutation({
  args: { 
    id: v.id("receipts"),
  },
  handler: async (ctx, args) => {
    const receipt = await ctx.db.get(args.id);
    
    if (!receipt) {
      throw new Error("Receipt not found");
    }
    
    // Only allow reopening if receipt is flagged
    if (receipt.status !== "Flagged" && !receipt.is_flagged) {
      throw new Error("Can only reopen flagged receipts");
    }
    
    // Reset to pending approval state
    await ctx.db.patch(args.id, {
      status: "Pending Approve",
      is_flagged: false,
      flag_reason: undefined, // Clear the flag reason
      updatedAt: new Date().toISOString(),
    });
    
    console.log(`✅ Reopened claim for receipt ${args.id}`);
  },
});

// Create a new receipt
export const create = mutation({
  args: {
    employeeId: v.id("employees"),
    display_id: v.number(),
    receipt_date: v.string(),
    merchant_name: v.string(),
    total_amount: v.number(),
    category: v.string(),
    image_url: v.string(),
    submittedBy: v.optional(v.id("users")),
    physical_id_tag: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get employee details
    const employee = await ctx.db.get(args.employeeId);
    if (!employee) {
      throw new Error("Employee not found");
    }

    const now = new Date().toISOString();

    const receiptId = await ctx.db.insert("receipts", {
      employeeId: args.employeeId,
      submittedBy: args.submittedBy,
      display_id: args.display_id,
      employee_id: employee.employeeId,
      employee_name: employee.name,
      submission_date: now,
      receipt_date: args.receipt_date,
      merchant_name: args.merchant_name,
      total_amount: args.total_amount,
      category: args.category,
      status: "Pending Approve",
      is_flagged: false,
      image_url: args.image_url,
      is_paid: false,
      physical_id_tag: args.physical_id_tag,
      notes: args.notes,
      createdAt: now,
      updatedAt: now,
    });

    return receiptId;
  },
});

// Update receipt
export const update = mutation({
  args: {
    id: v.id("receipts"),
    receipt_date: v.optional(v.string()),
    merchant_name: v.optional(v.string()),
    total_amount: v.optional(v.number()),
    category: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    
    // Filter out undefined values
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );

    filteredUpdates.updatedAt = new Date().toISOString();

    await ctx.db.patch(id, filteredUpdates);
    return id;
  },
});
