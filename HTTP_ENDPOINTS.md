# HTTP Endpoints - Testing Guide

## API Endpoints

### 1. GET /policy - Get Active Policy

Retrieves the currently active company policy.

**Request:**
```bash
curl -X GET "$convexBaseURL/policy" \
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
curl -X POST "$convexBaseURL/receipt" \
  -H "Authorization: Bearer YOUR_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+60123456789",
    "receipt_date": "2025-12-06",
    "merchant_name": "Coffee Bean",
    "total_amount": 45.50,
    "category": "Meals",
    "image_url": "https://example.com/receipt.jpg",
    "is_modified": false,
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
- `is_modified` - Boolean indicating if user modified AI-analyzed values (defaults to false)
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
curl -X GET "$convexBaseURL/employee?phoneNumber=012345678" \
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