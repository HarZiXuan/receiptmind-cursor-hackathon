# Seed Data Generation - Usage Guide

This guide explains how to use the fake data generation system to populate your database with realistic test data.

## Overview

The seeding system generates realistic Malaysian-context data for:
- **Employees** (200 by default) - Mix of Malaysian names (Malay, Chinese, Indian)
- **Receipts** (300 by default) - Various categories, statuses, and Malaysian merchants
- **Policies** (3-10 versions) - Company expense policy evolution

## Quick Start

### Method 1: Using Convex Dashboard (Recommended)

1. Open your [Convex Dashboard](https://dashboard.convex.dev/)
2. Navigate to your project
3. Go to the "Functions" tab
4. Find and run the `seed:seedDatabase` mutation
5. Optionally provide parameters:
   ```json
   {
     "employeeCount": 200,
     "receiptCount": 300,
     "policyCount": 3,
     "clearExisting": false
   }
   ```

### Method 2: Using npx convex run

```bash
# Seed with default values (200 employees, 300 receipts, 3 policies)
npx convex run seed:seedDatabase

# Seed with custom values
npx convex run seed:seedDatabase \
  --arg '{"employeeCount": 100, "receiptCount": 200, "policyCount": 5, "clearExisting": false}'

# Quick seed (20 employees, 50 receipts - for testing)
npx convex run seed:seedQuick
```

### Method 3: Using HTTP API

```bash
# Assuming you have your Convex URL and API bearer token
curl -X POST "https://your-deployment.convex.site/api/mutations/seed/seedDatabase" \
  -H "Authorization: Bearer YOUR_CONVEX_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "employeeCount": 150,
    "receiptCount": 250,
    "policyCount": 3,
    "clearExisting": false
  }'
```

## Available Mutations

### 1. `seedDatabase` - Main Seeding Function

**Parameters:**
- `employeeCount` (optional, default: 200) - Number of employees to create
- `receiptCount` (optional, default: 300) - Number of receipts to create
- `policyCount` (optional, default: 3) - Number of policy versions (max 3)
- `clearExisting` (optional, default: false) - Whether to clear existing data first

**Example:**
```bash
npx convex run seed:seedDatabase --arg '{"employeeCount": 50, "receiptCount": 100}'
```

**Returns:**
```json
{
  "success": true,
  "duration": "12.45s",
  "employeesCreated": 200,
  "receiptsCreated": 300,
  "policiesCreated": 3,
  "employeesCleared": 0,
  "receiptsCleared": 0,
  "policiesCleared": 0
}
```

### 2. `seedQuick` - Quick Test Data

Generates a small dataset for quick testing (20 employees, 50 receipts, 3 policies).

```bash
npx convex run seed:seedQuick
```

### 3. `clearAllData` - Clear All Seeded Data

⚠️ **Warning:** This will delete all data from employees, receipts, and policies tables.

```bash
npx convex run seed:clearAllData
```

### 4. `getSeedStats` - View Database Statistics

View current database statistics including counts by status and category.

```bash
npx convex run seed:getSeedStats
```

**Returns:**
```json
{
  "employees": {
    "total": 200,
    "active": 200
  },
  "receipts": {
    "total": 300,
    "byStatus": {
      "Pending Approve": 90,
      "Approved": 75,
      "Paid": 90,
      "Rejected": 45
    },
    "byCategory": {
      "Client Meal": 45,
      "Team Snacks": 38,
      "Transport": 52,
      "Hotel": 35,
      "Office Supplies": 40,
      "Parking": 32,
      "Petrol": 30,
      "Entertainment": 28
    }
  },
  "policies": {
    "total": 3,
    "current": 1
  }
}
```

## Generated Data Characteristics

### Employees
- **Names:** Mix of Malaysian names (Malay, Chinese, Indian)
- **Employee IDs:** E-1001, E-1002, E-1003, etc.
- **Positions:** Sales Manager, Software Engineer, HR Coordinator, etc.
- **Emails:** firstname.lastname@company.com
- **Phone Numbers:** +60xx-xxxxxxx (Malaysian format)

### Receipts
- **Merchants:** Malaysian businesses (Grab, Madam Kwan's, Starbucks, Petronas, etc.)
- **Categories:** Client Meal, Team Snacks, Transport, Hotel, Office Supplies, Parking, Petrol, Entertainment
- **Amounts:** Realistic ranges based on category (RM 5 - RM 2000)
- **Statuses:** 
  - 30% Pending Approve
  - 25% Approved
  - 30% Paid (with payment reference)
  - 15% Rejected (with rejection reason)
- **Dates:** Spanning last 6 months
- **Images:** Placeholder images from picsum.photos
- **Notes:** 30% have random notes

### Policies
- **Version 1:** Initial policy (oldest)
- **Version 2:** Updated with enhanced categories
- **Version 3:** Current policy with WFH support
- Realistic Malaysian expense guidelines
- Progressive effective dates

## Use Cases

### 1. Demo Preparation
```bash
# Clear existing demo data and create fresh dataset
npx convex run seed:clearAllData
npx convex run seed:seedDatabase --arg '{"employeeCount": 100, "receiptCount": 200}'
```

### 2. Load Testing
```bash
# Generate large dataset for performance testing
npx convex run seed:seedDatabase --arg '{"employeeCount": 500, "receiptCount": 1000}'
```

### 3. Development Testing
```bash
# Quick small dataset for development
npx convex run seed:seedQuick
```

### 4. Feature Testing
```bash
# Generate specific data and check stats
npx convex run seed:seedDatabase --arg '{"employeeCount": 50, "receiptCount": 100}'
npx convex run seed:getSeedStats
```

## Tips

1. **Start Small:** Test with `seedQuick` first to ensure everything works
2. **Clear Before Large Seeds:** Use `clearExisting: true` when generating large datasets
3. **Check Stats:** Use `getSeedStats` to verify data distribution
4. **Image URLs:** Generated receipts use placeholder images - replace with real uploaded images for production demos

## Troubleshooting

### "Employee not found" errors
- Make sure employees are created before receipts
- The seed function automatically handles this ordering

### Slow seeding
- Large datasets (>500 records) may take 30-60 seconds
- Consider using smaller batches for development

### Convex limits
- Free tier has limits on database size
- Monitor your usage in the Convex dashboard

## Integration with Existing Data

The seeding functions are safe to run multiple times:
- New employees get sequential IDs (E-1001, E-1002, etc.)
- Receipts get incremental display_ids based on existing max
- Set `clearExisting: false` (default) to add to existing data
- Set `clearExisting: true` to start fresh

## Next Steps

After seeding:
1. Visit your application dashboard to see the generated data
2. Test filtering and sorting with diverse data
3. Verify receipt status workflows
4. Check policy versions display correctly

