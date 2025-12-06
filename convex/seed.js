import { mutation } from "./_generated/server";
import { v } from "convex/values";
import {
  generateRandomEmployee,
  generateRandomReceipt,
  generatePolicy,
  policyTemplates,
} from "./seedData";

// Main seed mutation to populate the database with fake data
export const seedDatabase = mutation({
  args: {
    employeeCount: v.optional(v.number()),
    receiptCount: v.optional(v.number()),
    policyCount: v.optional(v.number()),
    clearExisting: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const employeeCount = args.employeeCount || 200;
    const receiptCount = args.receiptCount || 300;
    const policyCount = Math.min(args.policyCount || policyTemplates.length, policyTemplates.length);
    const clearExisting = args.clearExisting || false;

    const startTime = Date.now();
    const results = {
      employeesCreated: 0,
      receiptsCreated: 0,
      policiesCreated: 0,
      employeesCleared: 0,
      receiptsCleared: 0,
      policiesCleared: 0,
    };

    // Clear existing data if requested
    if (clearExisting) {
      console.log("🗑️ Clearing existing data...");
      
      // Clear receipts first (has foreign keys)
      const existingReceipts = await ctx.db.query("receipts").collect();
      for (const receipt of existingReceipts) {
        await ctx.db.delete(receipt._id);
        results.receiptsCleared++;
      }
      
      // Clear employees
      const existingEmployees = await ctx.db.query("employees").collect();
      for (const employee of existingEmployees) {
        await ctx.db.delete(employee._id);
        results.employeesCleared++;
      }
      
      // Clear policies
      const existingPolicies = await ctx.db.query("policies").collect();
      for (const policy of existingPolicies) {
        await ctx.db.delete(policy._id);
        results.policiesCleared++;
      }
      
      console.log(`✅ Cleared ${results.receiptsCleared} receipts, ${results.employeesCleared} employees, ${results.policiesCleared} policies`);
    }

    // Generate employees
    console.log(`👥 Generating ${employeeCount} employees...`);
    const employeeIds = [];
    
    for (let i = 0; i < employeeCount; i++) {
      const employee = generateRandomEmployee(i + 1);
      const employeeId = await ctx.db.insert("employees", employee);
      employeeIds.push(employeeId);
      results.employeesCreated++;
      
      // Log progress every 50 employees
      if ((i + 1) % 50 === 0) {
        console.log(`  Created ${i + 1}/${employeeCount} employees...`);
      }
    }
    
    console.log(`✅ Created ${results.employeesCreated} employees`);

    // Generate receipts
    console.log(`🧾 Generating ${receiptCount} receipts...`);
    
    // Get max existing display_id
    const allReceipts = await ctx.db.query("receipts").collect();
    let maxDisplayId = allReceipts.reduce((max, r) => Math.max(max, r.display_id || 0), 400);
    
    for (let i = 0; i < receiptCount; i++) {
      // Randomly select an employee
      const randomEmployeeId = employeeIds[Math.floor(Math.random() * employeeIds.length)];
      const displayId = maxDisplayId + i + 1;
      
      const receipt = generateRandomReceipt(randomEmployeeId, displayId);
      await ctx.db.insert("receipts", receipt);
      results.receiptsCreated++;
      
      // Log progress every 100 receipts
      if ((i + 1) % 100 === 0) {
        console.log(`  Created ${i + 1}/${receiptCount} receipts...`);
      }
    }
    
    console.log(`✅ Created ${results.receiptsCreated} receipts`);

    // Generate policies
    console.log(`📋 Generating ${policyCount} policy versions...`);
    
    // Generate policies with increasing age (oldest first)
    const daysPerVersion = 180; // ~6 months between versions
    
    for (let i = 0; i < policyCount; i++) {
      const daysAgo = (policyCount - i - 1) * daysPerVersion;
      const policy = generatePolicy(i, daysAgo);
      await ctx.db.insert("policies", policy);
      results.policiesCreated++;
    }
    
    console.log(`✅ Created ${results.policiesCreated} policy versions`);

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log(`\n🎉 Seeding completed in ${duration} seconds!`);
    console.log(`Summary:`);
    console.log(`  - Employees: ${results.employeesCreated} created`);
    console.log(`  - Receipts: ${results.receiptsCreated} created`);
    console.log(`  - Policies: ${results.policiesCreated} created`);
    
    if (clearExisting) {
      console.log(`  - Cleared: ${results.receiptsCleared} receipts, ${results.employeesCleared} employees, ${results.policiesCleared} policies`);
    }

    return {
      success: true,
      duration: `${duration}s`,
      ...results,
    };
  },
});

// Quick seed mutation for small datasets (for quick testing)
export const seedQuick = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.runMutation(
      (await import("./_generated/api")).api.seed.seedDatabase,
      {
        employeeCount: 20,
        receiptCount: 50,
        policyCount: 3,
        clearExisting: false,
      }
    );
  },
});

// Clear all seeded data
export const clearAllData = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("🗑️ Clearing all data from database...");
    
    const results = {
      receiptsCleared: 0,
      employeesCleared: 0,
      policiesCleared: 0,
      usersCleared: 0,
    };

    // Clear receipts first (has foreign keys)
    const receipts = await ctx.db.query("receipts").collect();
    for (const receipt of receipts) {
      await ctx.db.delete(receipt._id);
      results.receiptsCleared++;
    }
    
    // Clear employees
    const employees = await ctx.db.query("employees").collect();
    for (const employee of employees) {
      await ctx.db.delete(employee._id);
      results.employeesCleared++;
    }
    
    // Clear policies
    const policies = await ctx.db.query("policies").collect();
    for (const policy of policies) {
      await ctx.db.delete(policy._id);
      results.policiesCleared++;
    }
    
    // Clear users (optional - uncomment if needed)
    // const users = await ctx.db.query("users").collect();
    // for (const user of users) {
    //   await ctx.db.delete(user._id);
    //   results.usersCleared++;
    // }

    console.log(`✅ Cleared all data:`);
    console.log(`  - Receipts: ${results.receiptsCleared}`);
    console.log(`  - Employees: ${results.employeesCleared}`);
    console.log(`  - Policies: ${results.policiesCleared}`);

    return {
      success: true,
      ...results,
    };
  },
});

// Get seeding statistics
export const getSeedStats = mutation({
  args: {},
  handler: async (ctx) => {
    const employees = await ctx.db.query("employees").collect();
    const receipts = await ctx.db.query("receipts").collect();
    const policies = await ctx.db.query("policies").collect();
    
    // Receipt status breakdown
    const statusCounts = {};
    receipts.forEach(r => {
      statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
    });
    
    // Category breakdown
    const categoryCounts = {};
    receipts.forEach(r => {
      categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
    });

    return {
      employees: {
        total: employees.length,
        active: employees.filter(e => e.isActive).length,
      },
      receipts: {
        total: receipts.length,
        byStatus: statusCounts,
        byCategory: categoryCounts,
      },
      policies: {
        total: policies.length,
        current: policies.filter(p => p.is_current).length,
      },
    };
  },
});

