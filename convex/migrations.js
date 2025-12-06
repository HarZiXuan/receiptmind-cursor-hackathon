import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Migration Functions
 * 
 * These are one-time functions to migrate existing data to the new schema.
 * Run these after deploying the new schema but before the old data is deleted.
 */

// Create employees from existing receipt data
export const createEmployeesFromReceipts = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("🔄 Starting employee migration...");
    
    // Get all receipts
    const receipts = await ctx.db.query("receipts").collect();
    
    if (receipts.length === 0) {
      console.log("⚠️ No receipts found. Nothing to migrate.");
      return { message: "No receipts to migrate", created: 0 };
    }

    // Extract unique employees from receipts
    const employeeMap = new Map();
    
    for (const receipt of receipts) {
      const empId = receipt.employee_id;
      if (empId && !employeeMap.has(empId)) {
        employeeMap.set(empId, {
          employeeId: empId,
          name: receipt.employee_name || "Unknown",
          email: `${empId.toLowerCase()}@company.com`,
          isActive: true,
          createdAt: receipt.submission_date || new Date().toISOString(),
        });
      }
    }

    // Create employee records
    const createdEmployees = {};
    let createdCount = 0;

    for (const [empId, empData] of employeeMap) {
      // Check if employee already exists
      const existing = await ctx.db
        .query("employees")
        .withIndex("by_employee_id", (q) => q.eq("employeeId", empId))
        .first();
      
      if (existing) {
        createdEmployees[empId] = existing._id;
        console.log(`✓ Employee ${empId} already exists`);
      } else {
        const employeeDbId = await ctx.db.insert("employees", empData);
        createdEmployees[empId] = employeeDbId;
        createdCount++;
        console.log(`✓ Created employee ${empId} (${empData.name})`);
      }
    }

    console.log(`✅ Migration complete: ${createdCount} employees created`);
    return {
      message: "Employees created from receipts",
      created: createdCount,
      total: employeeMap.size,
      employeeIds: createdEmployees,
    };
  },
});

// Link existing receipts to employee records
export const linkReceiptsToEmployees = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("🔄 Starting receipt-employee linking...");
    
    // Get all receipts without employeeId foreign key
    const receipts = await ctx.db.query("receipts").collect();
    const receiptsToUpdate = receipts.filter(r => !r.employeeId);
    
    if (receiptsToUpdate.length === 0) {
      console.log("✓ All receipts already linked to employees");
      return { message: "All receipts already linked", updated: 0 };
    }

    let updatedCount = 0;
    let errorCount = 0;

    for (const receipt of receiptsToUpdate) {
      // Find the corresponding employee by employee_id string
      const employee = await ctx.db
        .query("employees")
        .withIndex("by_employee_id", (q) => q.eq("employeeId", receipt.employee_id))
        .first();
      
      if (employee) {
        await ctx.db.patch(receipt._id, {
          employeeId: employee._id,
        });
        updatedCount++;
        console.log(`✓ Linked receipt ${receipt.display_id} to employee ${receipt.employee_id}`);
      } else {
        console.log(`✗ Employee not found for receipt ${receipt.display_id} (${receipt.employee_id})`);
        errorCount++;
      }
    }

    console.log(`✅ Linking complete: ${updatedCount} receipts updated, ${errorCount} errors`);
    return {
      message: "Receipts linked to employees",
      updated: updatedCount,
      errors: errorCount,
      total: receiptsToUpdate.length,
    };
  },
});

// Add timestamps to existing records
export const addTimestamps = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("🔄 Adding timestamps to existing records...");
    
    // Update receipts
    const receipts = await ctx.db.query("receipts").collect();
    let receiptCount = 0;

    for (const receipt of receipts) {
      if (!receipt.createdAt || !receipt.updatedAt) {
        await ctx.db.patch(receipt._id, {
          createdAt: receipt.submission_date || new Date().toISOString(),
          updatedAt: receipt.submission_date || new Date().toISOString(),
        });
        receiptCount++;
      }
    }

    // Update employees
    const employees = await ctx.db.query("employees").collect();
    let employeeCount = 0;

    for (const employee of employees) {
      if (!employee.createdAt) {
        await ctx.db.patch(employee._id, {
          createdAt: new Date().toISOString(),
        });
        employeeCount++;
      }
    }

    console.log(`✅ Timestamps added: ${receiptCount} receipts, ${employeeCount} employees`);
    return {
      message: "Timestamps added to existing records",
      receipts: receiptCount,
      employees: employeeCount,
    };
  },
});

// Initialize policy versions
export const initializePolicyVersions = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("🔄 Initializing policy versions...");
    
    const policies = await ctx.db.query("policies").collect();
    
    if (policies.length === 0) {
      console.log("✓ No policies to update");
      return { message: "No policies found", updated: 0 };
    }

    let updatedCount = 0;
    let version = 1;

    // Sort policies by savedAt date (oldest first)
    const sortedPolicies = policies.sort((a, b) => {
      const dateA = new Date(a.savedAt);
      const dateB = new Date(b.savedAt);
      return dateA - dateB;
    });

    for (const policy of sortedPolicies) {
      if (policy.version === undefined || policy.version === null) {
        await ctx.db.patch(policy._id, {
          version: version,
          effectiveFrom: policy.isActive ? policy.savedAt : undefined,
        });
        console.log(`✓ Set policy version ${version} (${policy.isActive ? 'active' : 'inactive'})`);
        version++;
        updatedCount++;
      }
    }

    console.log(`✅ Policy versions initialized: ${updatedCount} policies updated`);
    return {
      message: "Policy versions initialized",
      updated: updatedCount,
      total: policies.length,
    };
  },
});

// Run all migrations in sequence
export const runAllMigrations = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("🚀 Starting full migration process...");
    console.log("================================================");
    
    const results = {};

    // Step 1: Create employees from receipts
    try {
      console.log("\n1️⃣ Creating employees from receipts...");
      const employeeResult = await createEmployeesFromReceipts(ctx, {});
      results.employees = employeeResult;
    } catch (error) {
      console.error("❌ Error creating employees:", error);
      results.employees = { error: error.message };
    }

    // Step 2: Link receipts to employees
    try {
      console.log("\n2️⃣ Linking receipts to employees...");
      const linkResult = await linkReceiptsToEmployees(ctx, {});
      results.receipts = linkResult;
    } catch (error) {
      console.error("❌ Error linking receipts:", error);
      results.receipts = { error: error.message };
    }

    // Step 3: Add timestamps
    try {
      console.log("\n3️⃣ Adding timestamps...");
      const timestampResult = await addTimestamps(ctx, {});
      results.timestamps = timestampResult;
    } catch (error) {
      console.error("❌ Error adding timestamps:", error);
      results.timestamps = { error: error.message };
    }

    // Step 4: Initialize policy versions
    try {
      console.log("\n4️⃣ Initializing policy versions...");
      const policyResult = await initializePolicyVersions(ctx, {});
      results.policies = policyResult;
    } catch (error) {
      console.error("❌ Error initializing policy versions:", error);
      results.policies = { error: error.message };
    }

    console.log("\n================================================");
    console.log("✅ Full migration complete!");
    
    return {
      message: "All migrations completed",
      results,
    };
  },
});

// Reset database (DANGER: Deletes all data!)
export const resetDatabase = mutation({
  args: { confirm: v.string() },
  handler: async (ctx, args) => {
    if (args.confirm !== "DELETE_ALL_DATA") {
      throw new Error("Invalid confirmation. Pass 'DELETE_ALL_DATA' to confirm.");
    }

    console.log("⚠️ RESETTING DATABASE - DELETING ALL DATA...");
    
    // Delete all receipts
    const receipts = await ctx.db.query("receipts").collect();
    for (const receipt of receipts) {
      await ctx.db.delete(receipt._id);
    }

    // Delete all employees
    const employees = await ctx.db.query("employees").collect();
    for (const employee of employees) {
      await ctx.db.delete(employee._id);
    }

    // Delete all users
    const users = await ctx.db.query("users").collect();
    for (const user of users) {
      await ctx.db.delete(user._id);
    }

    // Delete all policies
    const policies = await ctx.db.query("policies").collect();
    for (const policy of policies) {
      await ctx.db.delete(policy._id);
    }

    console.log("✅ Database reset complete");
    return {
      message: "Database reset successfully",
      deleted: {
        receipts: receipts.length,
        employees: employees.length,
        users: users.length,
        policies: policies.length,
      },
    };
  },
});

