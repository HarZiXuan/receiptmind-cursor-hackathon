# Convex Backend Documentation

## Overview

This Convex backend implements a production-ready receipt management system with proper relational database structure, user management, employee tracking, and policy versioning.

## Database Schema

### Tables

#### 1. **users** - System Users & Authentication
Users who can log into the system and perform actions.

**Fields:**
- `name` - Full name
- `email` - Email address (indexed)
- `phoneNumber` - Optional phone number
- `role` - User role: "admin", "manager", "employee", "accountant"
- `employeeId` - Optional link to employee record
- `isActive` - Whether user account is active
- `createdAt` - Account creation timestamp
- `avatarUrl` - Optional profile picture URL

#### 2. **employees** - Staff Members
Employees who submit receipts (may or may not have user accounts).

**Fields:**
- `userId` - Optional link to user account
- `employeeId` - Internal employee ID (e.g., "E-102")
- `name` - Full name
- `email` - Email address (indexed)
- `phoneNumber` - Optional phone number
- `position` - Job title/position
- `isActive` - Employment status
- `createdAt` - Record creation timestamp

#### 3. **receipts** - Expense Receipts
Receipt submissions with full tracking and approval workflow.

**Foreign Keys:**
- `employeeId` - Reference to employees table
- `submittedBy` - User who submitted (optional)
- `approvedBy` - User who approved (optional)

**Legacy Fields (backwards compatible):**
- `display_id` - Display number
- `employee_id` - String employee ID
- `employee_name` - Employee name (denormalized)

**Receipt Data:**
- `submission_date` - When submitted
- `receipt_date` - Transaction date
- `merchant_name` - Vendor/merchant
- `total_amount` - Amount
- `category` - Expense category
- `status` - Approval status
- `image_url` - Receipt image URL

**Flags & Tracking:**
- `is_flagged` - Policy violation flag
- `flag_reason` - Reason for flagging
- `is_paid` - Payment status
- `payment_date` - When paid
- `payment_reference` - Payment reference number
- `is_modified` - Boolean indicating if user modified AI-analyzed values
- `notes` - Additional notes
- `createdAt` / `updatedAt` - Timestamps

#### 4. **policies** - Company Policies
Policy documents with version tracking.

**Fields:**
- `text` - Full policy text
- `summary` - Brief summary
- `version` - Version number (indexed)
- `isActive` - Whether this is the active version
- `createdBy` - User who created this version
- `savedAt` - When saved
- `effectiveFrom` - When this version became active

## API Modules

### users.js - User Management

**Queries:**
- `get()` - Get all users
- `getActive()` - Get active users only
- `getByEmail(email)` - Find user by email
- `getById(id)` - Get user by ID

**Mutations:**
- `create({ name, email, phoneNumber, role, employeeId, avatarUrl })` - Create user
- `update(id, { ... })` - Update user
- `deactivate(id)` - Deactivate user
- `activate(id)` - Reactivate user
- `remove(id)` - Delete permanently

### employees.js - Employee Management

**Queries:**
- `get()` - Get all employees
- `getActive()` - Get active employees only
- `getByEmployeeId(employeeId)` - Find by internal ID
- `getByEmail(email)` - Find by email
- `getById(id)` - Get by Convex ID
- `getWithUser(id)` - Get employee with linked user data

**Mutations:**
- `create({ employeeId, name, email, phoneNumber, position, userId })` - Create employee
- `update(id, { ... })` - Update employee
- `linkUser(employeeId, userId)` - Link employee to user account
- `unlinkUser(employeeId)` - Unlink from user account
- `deactivate(id)` - Deactivate employee
- `activate(id)` - Reactivate employee
- `remove(id)` - Delete permanently

### receipts.js - Receipt Management

**Queries:**
- `get()` - Get all receipts
- `getWithDetails()` - Get receipts with employee/user data joined
- `getByEmployee(employeeId)` - Get receipts for specific employee
- `getByStatus(status)` - Get receipts by status

**Mutations:**
- `seed()` - Seed database with sample data (creates employees + receipts)
- `create({ employeeId, display_id, receipt_date, merchant_name, total_amount, category, image_url, ... })` - Create receipt
- `update(id, { ... })` - Update receipt
- `pay(id, { approvedBy, paymentReference })` - Mark as paid
- `approve(id, approvedBy)` - Approve receipt
- `reject(id, { reason })` - Reject receipt

### policies.js - Policy Management

**Queries:**
- `get()` - Get all policies
- `getActive()` - Get active policy
- `getActiveVersion()` - Get active version (alias)
- `getByVersion(version)` - Get specific version
- `getAllVersions()` - Get all versions sorted

**Mutations:**
- `save({ text, summary, createdBy })` - Create new policy version
- `deletePolicy(id)` - Delete policy
- `setActive(id)` - Set specific version as active
- `update(id, { text, summary })` - Update policy

### migrations.js - Data Migration

**One-time migrations:**
- `createEmployeesFromReceipts()` - Extract employees from existing receipts
- `linkReceiptsToEmployees()` - Link receipts to employee records
- `addTimestamps()` - Add missing timestamps
- `initializePolicyVersions()` - Set version numbers on policies
- `runAllMigrations()` - Run all migrations in sequence
- `resetDatabase({ confirm: "DELETE_ALL_DATA" })` - Reset database (DANGER!)

## Getting Started

### 1. Initialize Database

Run the seed function to populate with sample data:

```javascript
// In Convex dashboard or via mutation call
await receipts.seed()
```

This creates:
- 4 sample employees
- 4 sample receipts with proper foreign key relationships

### 2. Migrate Existing Data (if applicable)

If you have existing data, run migrations:

```javascript
// Run all migrations at once
await migrations.runAllMigrations()

// Or run individually:
await migrations.createEmployeesFromReceipts()
await migrations.linkReceiptsToEmployees()
await migrations.addTimestamps()
await migrations.initializePolicyVersions()
```

### 3. Usage Examples

**Create a new user:**
```javascript
const userId = await users.create({
  name: "John Doe",
  email: "john@company.com",
  phoneNumber: "+1234567890",
  role: "manager"
})
```

**Create an employee and link to user:**
```javascript
const employeeId = await employees.create({
  employeeId: "E-500",
  name: "John Doe",
  email: "john@company.com",
  position: "Finance Manager"
})

await employees.linkUser(employeeId, userId)
```

**Submit a receipt:**
```javascript
const receiptId = await receipts.create({
  employeeId: employeeDbId,
  display_id: 405,
  receipt_date: "2025-12-06",
  merchant_name: "Office Supply Store",
  total_amount: 45.99,
  category: "Office Supplies",
  image_url: "https://...",
  submittedBy: userId
})
```

**Approve and pay a receipt:**
```javascript
await receipts.approve(receiptId, approverId)
await receipts.pay(receiptId, { 
  approvedBy: approverId,
  paymentReference: "PAY-2025-001" 
})
```

**Create a new policy version:**
```javascript
await policies.save({
  text: "Full policy text here...",
  summary: "Updated expense policy for 2025",
  createdBy: userId
})
```

## Benefits of New Schema

✅ **Proper Relationships** - Foreign keys maintain data integrity  
✅ **User Management** - Separate authentication from employee records  
✅ **Audit Trail** - Track who submitted, approved, and paid receipts  
✅ **Policy Versioning** - Track policy changes over time  
✅ **Backwards Compatible** - Keeps legacy string IDs for migration  
✅ **Scalable** - Ready for adding companies, departments, etc.  
✅ **Type Safe** - Full TypeScript support via generated types  

## Next Steps

To extend this system, you can:

1. Add **authentication** (Clerk, Convex Auth, etc.)
2. Implement **file storage** for receipt images (Convex Storage)
3. Add **departments** table for cost center tracking
4. Add **companies** table for multi-tenancy
5. Implement **audit logs** for compliance
6. Add **notifications** for approval workflows
7. Create **budget tracking** per department/employee
8. Integrate with **accounting software** (QuickBooks, Xero, etc.)

## Notes

- All monetary amounts are stored as numbers (not strings)
- Timestamps are ISO 8601 strings
- Soft deletes via `isActive` flags where appropriate
- Version numbers start at 1 and increment
- First policy version is automatically set as active

