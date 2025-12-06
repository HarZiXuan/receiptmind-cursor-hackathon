# HTTP Endpoints - Testing Guide

## Setup Instructions

### 1. Configure Bearer Token

You need to set up the `API_BEARER_TOKEN` environment variable in your Convex deployment.

**Option A: Via Convex Dashboard**
1. Go to your Convex dashboard: https://dashboard.convex.dev
2. Select your project
3. Navigate to **Settings** → **Environment Variables**
4. Add a new variable:
   - Name: `API_BEARER_TOKEN`
   - Value: Generate a secure token (e.g., use: `openssl rand -hex 32`)
   - Example: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6`

**Option B: Via CLI**
```bash
# Generate a secure token
BEARER_TOKEN=$(openssl rand -hex 32)

# Set it in Convex
npx convex env set API_BEARER_TOKEN "$BEARER_TOKEN"

# Save it for your n8n configuration
echo "Your bearer token: $BEARER_TOKEN"
```

### 2. Deploy the HTTP Routes

Make sure your Convex deployment is running and has deployed the http.js file:

```bash
npx convex dev
```

### 3. Get Your Deployment URL

Your HTTP endpoints will be available at:
```
https://YOUR_DEPLOYMENT_NAME.convex.site/
```

You can find your deployment URL in:
- The Convex dashboard
- The output of `npx convex dev`
- Your `.env` file (VITE_CONVEX_URL, replace `.cloud` with `.site`)

---

## API Endpoints

### 1. GET /policy - Get Active Policy

Retrieves the currently active company policy.

**Request:**
```bash
curl -X GET "https://YOUR_DEPLOYMENT_NAME.convex.site/policy" \
  -H "Authorization: Bearer YOUR_BEARER_TOKEN"
```

**Response (200 OK):**
```json
{
  "success": true,
  "policy": {
    "text": "Full policy text here...",
    "summary": "Company expense policy for 2025",
    "version": 1,
    "effectiveFrom": "2025-12-06T10:30:00.000Z"
  }
}
```

**Error Responses:**
- **401 Unauthorized:** Invalid or missing bearer token
  ```json
  { "error": "Missing or invalid Authorization header" }
  ```
- **404 Not Found:** No active policy exists
  ```json
  { "error": "No active policy found" }
  ```

---

### 2. POST /receipt - Submit Receipt

Submits a new receipt for an employee via phone number.

**Request:**
```bash
curl -X POST "https://YOUR_DEPLOYMENT_NAME.convex.site/receipt" \
  -H "Authorization: Bearer YOUR_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+60123456789",
    "receipt_date": "2025-12-06",
    "merchant_name": "Coffee Bean",
    "total_amount": 45.50,
    "category": "Meals",
    "image_url": "https://example.com/receipt.jpg",
    "physical_id_tag": "#408",
    "notes": "Team lunch meeting"
  }'
```

**Required Fields:**
- `phoneNumber` - Employee's phone number (must match employee record)
- `receipt_date` - Date of the transaction (YYYY-MM-DD)
- `merchant_name` - Name of the merchant/vendor
- `total_amount` - Receipt amount (number)
- `category` - Expense category (string)
- `image_url` - URL to receipt image

**Optional Fields:**
- `physical_id_tag` - Physical receipt tag/ID
- `notes` - Additional notes

**Response (201 Created):**
```json
{
  "success": true,
  "receiptId": "jd7h2k3m5n6p8q9r",
  "display_id": 405,
  "employee": {
    "id": "k2j3h4g5f6d7s8a9",
    "name": "Aina Rahman",
    "employeeId": "E-102"
  }
}
```

**Error Responses:**
- **400 Bad Request:** Missing required fields
  ```json
  {
    "error": "Missing required fields",
    "required": ["phoneNumber", "receipt_date", "merchant_name", "total_amount", "category", "image_url"]
  }
  ```
- **404 Not Found:** Employee not found
  ```json
  { "error": "Employee not found with provided phone number" }
  ```
- **401 Unauthorized:** Invalid bearer token

---

### 3. GET /employee - Get Employee Details

Retrieves employee information by phone number.

**Request:**
```bash
curl -X GET "https://YOUR_DEPLOYMENT_NAME.convex.site/employee?phoneNumber=%2B60123456789" \
  -H "Authorization: Bearer YOUR_BEARER_TOKEN"
```

**Note:** URL encode the phone number (+ becomes %2B)

**Response (200 OK):**
```json
{
  "success": true,
  "employee": {
    "id": "k2j3h4g5f6d7s8a9",
    "employeeId": "E-102",
    "name": "Aina Rahman",
    "email": "aina.rahman@company.com",
    "phoneNumber": "+60123456789",
    "position": "Sales Manager",
    "isActive": true
  }
}
```

**Error Responses:**
- **400 Bad Request:** Missing phone number parameter
  ```json
  { "error": "Missing phoneNumber query parameter" }
  ```
- **404 Not Found:** Employee not found
  ```json
  { "error": "Employee not found with provided phone number" }
  ```
- **401 Unauthorized:** Invalid bearer token