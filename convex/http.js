import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

// Middleware for bearer token authentication
async function validateBearerToken(request) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { valid: false, error: "Missing or invalid Authorization header" };
  }
  
  const token = authHeader.substring(7); // Remove "Bearer " prefix
  const expectedToken = process.env.API_BEARER_TOKEN;
  
  if (!expectedToken) {
    return { valid: false, error: "API token not configured" };
  }
  
  if (token !== expectedToken) {
    return { valid: false, error: "Invalid token" };
  }
  
  return { valid: true };
}

// Helper function to upload base64 image to imgbb
async function uploadBase64ToImgbb(base64String) {
  const imgbbApiKey = process.env.IMGBB_API_KEY;
  
  if (!imgbbApiKey) {
    throw new Error("IMGBB_API_KEY environment variable not configured");
  }
  
  // Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
  let base64Data = base64String;
  if (base64String.includes(',')) {
    base64Data = base64String.split(',')[1];
  }
  
  // Create form data for imgbb API
  const formData = new FormData();
  formData.append('key', imgbbApiKey);
  formData.append('image', base64Data);
  
  // Upload to imgbb
  const response = await fetch("https://api.imgbb.com/1/upload", {
    method: "POST",
    body: formData,
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`imgbb upload failed: ${errorText}`);
  }
  
  const result = await response.json();
  
  if (!result.success || !result.data || !result.data.url) {
    throw new Error("No file URL returned from imgbb");
  }
  
  // Return the file URL
  return result.data.url;
}

// 1. GET /policy - Get current active policy
http.route({
  path: "/policy",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    // Validate bearer token
    const auth = await validateBearerToken(request);
    if (!auth.valid) {
      return new Response(JSON.stringify({ error: auth.error }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get active policy
    const policy = await ctx.runQuery(api.policies.getActive);
    
    if (!policy) {
      return new Response(JSON.stringify({ error: "No active policy found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ 
      success: true,
      policy: {
        text: policy.text,
        summary: policy.summary,
        version: policy.version,
        effectiveFrom: policy.effectiveFrom,
      }
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

// 2. POST /receipt - Submit a new receipt
http.route({
  path: "/receipt",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    // Validate bearer token
    const auth = await validateBearerToken(request);
    if (!auth.valid) {
      return new Response(JSON.stringify({ error: auth.error }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Parse request body
    const body = await request.json();
    
    // Validate required fields
    const { employeeId, receipt_date, merchant_name, total_amount, category, image_base64 } = body;
    
    if (!employeeId || !receipt_date || !merchant_name || !total_amount || !category || !image_base64) {
      return new Response(JSON.stringify({ 
        error: "Missing required fields",
        required: ["employeeId", "receipt_date", "merchant_name", "total_amount", "category", "image_base64"]
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get employee by Convex _id
    const employee = await ctx.runQuery(api.employees.getById, { id: employeeId });
    
    if (!employee) {
      return new Response(JSON.stringify({ 
        error: "Employee not found with provided employee ID" 
      }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Upload base64 image to imgbb
    let image_url;
    try {
      image_url = await uploadBase64ToImgbb(image_base64);
    } catch (error) {
      return new Response(JSON.stringify({ 
        error: "Image upload failed",
        details: error.message
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Generate display_id (get max + 1)
    const allReceipts = await ctx.runQuery(api.receipts.get);
    const maxDisplayId = allReceipts.reduce((max, r) => Math.max(max, r.display_id || 0), 400);
    const display_id = maxDisplayId + 1;

    // Create receipt
    const receiptId = await ctx.runMutation(api.receipts.create, {
      employeeId: employee._id,
      display_id,
      receipt_date,
      merchant_name,
      total_amount: parseFloat(total_amount),
      category,
      image_url,
      is_modified: body.is_modified || false,
      notes: body.notes,
    });

    return new Response(JSON.stringify({ 
      success: true,
      receiptId,
      display_id,
      image_url,
      employee: {
        id: employee._id,
        name: employee.name,
        employeeId: employee.employeeId,
      }
    }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

// 3. GET /employee?phoneNumber=... - Get employee by phone number
http.route({
  path: "/employee",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    // Validate bearer token
    const auth = await validateBearerToken(request);
    if (!auth.valid) {
      return new Response(JSON.stringify({ error: auth.error }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get phone number from query params
    const url = new URL(request.url);
    const phoneNumber = url.searchParams.get("phoneNumber");
    
    if (!phoneNumber) {
      return new Response(JSON.stringify({ 
        error: "Missing phoneNumber query parameter" 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get employee by phone number
    const employee = await ctx.runQuery(api.employees.getByPhoneNumber, { phoneNumber });
    
    if (!employee) {
      return new Response(JSON.stringify({ 
        error: "Employee not found with provided phone number" 
      }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ 
      success: true,
      employee: {
        id: employee._id,
        employeeId: employee.employeeId,
        name: employee.name,
        email: employee.email,
        phoneNumber: employee.phoneNumber,
        position: employee.position,
        isActive: employee.isActive,
      }
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

export default http;

