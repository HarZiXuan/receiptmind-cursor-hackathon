import { action } from "./_generated/server";
import { v } from "convex/values";

// Send notification to employee
export const sendEmployeeNotification = action({
  args: {
    phoneNumber: v.string(),
    status: v.string(),
    receiptId: v.string(),
    amount: v.number(),
    date: v.string(),
    merchantName: v.string(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const endpointUrl = process.env.NOTIFICATION_ENDPOINT_URL;

    if (!endpointUrl) {
      console.log("⚠️ Notification endpoint URL not set. Skipping notification.");
      return;
    }

    try {
      const payload = {
        phoneNumber: args.phoneNumber + "@c.us",
        status: args.status,
        amount: args.amount,
        date: args.date,
        merchantName: args.merchantName,
        receiptId: args.receiptId,
        ...(args.reason ? { reason: args.reason } : {}),
      };

      const response = await fetch(endpointUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: payload.phoneNumber,
          message: JSON.stringify(payload),
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error(`❌ Failed to send notification: ${response.status} ${text}`);
      } else {
        console.log(`✅ Notification sent for receipt ${args.receiptId} (${args.status})`);
      }
    } catch (error) {
      console.error("❌ Error sending notification:", error);
    }
  },
});

