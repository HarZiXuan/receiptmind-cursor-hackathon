import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// Send notification to employee
export const sendEmployeeNotification = action({
  args: {
    employeeId: v.id("employees"),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const endpointUrl = process.env.NOTIFICATION_ENDPOINT_URL;

    if (!endpointUrl) {
      console.log("⚠️ Notification endpoint URL not set. Skipping notification.");
      return;
    }

    try {
      // Get employee by ID using a query
      const employee = await ctx.runQuery(api.employees.getById, { id: args.employeeId });
      
      if (!employee) {
        console.error(`❌ Employee with ID ${args.employeeId} not found.`);
        return;
      }

      if (!employee.phoneNumber) {
        console.error(`❌ Employee ${employee.name} (ID: ${args.employeeId}) has no phone number.`);
        return;
      }

      const response = await fetch(endpointUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: employee.phoneNumber + "@c.us",
          message: args.message,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error(`❌ Failed to send notification to ${employee.name}: ${response.status} ${text}`);
      } else {
        console.log(`✅ Notification sent to ${employee.name} (ID: ${args.employeeId}) with message: "${args.message}"`);
      }
    } catch (error) {
      console.error("❌ Error sending notification:", error);
    }
  },
});

