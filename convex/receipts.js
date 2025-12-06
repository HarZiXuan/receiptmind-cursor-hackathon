import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("receipts").order("desc").collect();
  },
});

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if data already exists
    const existing = await ctx.db.query("receipts").first();
    if (existing) {
      console.log("Database already contains receipts. Skipping seed.");
      return { message: "Database already seeded", count: 0 };
    }

    const mockReceipts = [
      {
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
        physical_id_tag: '#405'
      },
      {
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
        physical_id_tag: '#406'
      },
      {
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
        physical_id_tag: null
      },
      {
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
        physical_id_tag: '#407'
      }
    ];

    let insertedCount = 0;
    for (const r of mockReceipts) {
      await ctx.db.insert("receipts", r);
      insertedCount++;
    }
    
    console.log(`✅ Seeded ${insertedCount} receipts into database`);
    return { message: "Database seeded successfully", count: insertedCount };
  },
});

export const pay = mutation({
  args: { id: v.id("receipts") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: "Paid",
      is_paid: true,
      is_flagged: false,
    });
  },
});

export const reject = mutation({
  args: { id: v.id("receipts") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: "Pending Approve",
      is_paid: false,
    });
  },
});

