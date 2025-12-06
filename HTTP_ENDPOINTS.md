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

Submits a new receipt for an employee via employee ID. Accepts base64-encoded images and automatically uploads them to UploadThing.

**Request:**
```bash
curl -X POST "$convexBaseURL/receipt" \
  -H "Authorization: Bearer YOUR_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "jd72awjnbr49zzwjy4qky8xjk57wrjsj",
    "receipt_date": "2025-12-06",
    "merchant_name": "Coffee Bean",
    "total_amount": 45.50,
    "category": "Meals",
    "image_base64": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
    "is_modified": false,
    "notes": "Team lunch meeting"
  }'
```

**Required Fields:**
- `employeeId` - Employee's Convex database ID (_id, the primary key)
- `receipt_date` - Date of the transaction (YYYY-MM-DD)
- `merchant_name` - Name of the merchant/vendor
- `total_amount` - Receipt amount (number)
- `category` - Expense category (string)
- `image_base64` - Base64-encoded image string (with or without data URL prefix)

**Optional Fields:**
- `is_modified` - Boolean indicating if user modified AI-analyzed values (defaults to false)
- `notes` - Additional notes
- `invoice_number` - Unique invoice/receipt number for duplicate detection (string)

**Image Format:**
The `image_base64` field accepts base64-encoded images in two formats:
- With data URL prefix: `data:image/jpeg;base64,/9j/4AAQ...` (recommended)
- Raw base64 string: `/9j/4AAQ...`

Supported image types: JPEG, PNG, GIF, WebP, BMP

Images are uploaded to imgbb and the URL is stored in the database.

**Response (201 Created):**
```json
{
  "success": true,
  "receiptId": "jd7h2k3m5n6p8q9r",
  "display_id": 405,
  "image_url": "https://i.ibb.co/abc123/receipt.jpg",
  "invoice_number": "INV-12345",
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
    "required": ["employeeId", "receipt_date", "merchant_name", "total_amount", "category", "image_base64"]
  }
  ```
- **404 Not Found:** Employee not found
  ```json
  { "error": "Employee not found with provided employee ID" }
  ```
- **500 Internal Server Error:** Image upload failed
  ```json
  {
    "error": "Image upload failed",
    "details": "Error message from UploadThing"
  }
  ```
- **401 Unauthorized:** Invalid bearer token

---

### 3. GET /receipt/check - Check for Duplicate Invoice Number

Checks if an invoice number has already been submitted. Returns full receipt details if found.

**Request:**
```bash
curl -X GET "$convexBaseURL/receipt/check?invoiceNumber=INV-12345" \
  -H "Authorization: Bearer YOUR_BEARER_TOKEN"
```

**Response (200 OK) - Invoice Number Not Found:**
```json
{
  "success": true,
  "exists": false,
  "message": "Invoice number is available - no duplicate found"
}
```

**Response (200 OK) - Invoice Number Already Exists:**
```json
{
  "success": true,
  "exists": true,
  "message": "Invoice number already exists",
  "receipt": {
    "id": "jd7h2k3m5n6p8q9r",
    "display_id": 405,
    "invoice_number": "INV-12345",
    "submission_date": "2025-12-06T10:30:45.123Z",
    "receipt_date": "2025-12-06",
    "merchant_name": "Coffee Bean",
    "total_amount": 45.50,
    "category": "Meals",
    "status": "Pending Approve",
    "image_url": "https://i.ibb.co/abc123/receipt.jpg",
    "employee": {
      "id": "k2j3h4g5f6d7s8a9",
      "employeeId": "E-102",
      "name": "Aina Rahman",
      "email": "aina.rahman@company.com"
    }
  }
}
```

**Error Responses:**
- **400 Bad Request:** Missing invoiceNumber parameter
  ```json
  { "error": "Missing invoiceNumber query parameter" }
  ```
- **401 Unauthorized:** Invalid bearer token

---

### 4. GET /employee - Get Employee Details

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