// Utility file for generating realistic fake data for Malaysian context

// Malaysian first names (mix of Malay, Chinese, Indian)
export const firstNames = [
  // Malay names
  "Ahmad", "Siti", "Muhammad", "Nurul", "Farah", "Azman", "Aisyah", "Hafiz",
  "Zarina", "Razak", "Amirah", "Ismail", "Nadia", "Hakim", "Lina", "Rashid",
  "Mariam", "Aziz", "Sofea", "Kamal", "Aina", "Ibrahim", "Laila", "Faris",
  // Chinese names
  "Wei Ming", "Li Ying", "Jun Wei", "Xin Yi", "Zhi Xuan", "Hui Ling", "Kai Yang",
  "Mei Lin", "Cheng", "Yan", "Ming", "Jia", "Chen", "Wen", "Hao", "Yun",
  // Indian names
  "Raj", "Priya", "Kumar", "Devi", "Sanjay", "Kavitha", "Ravi", "Lakshmi",
  "Arun", "Deepa", "Vijay", "Anita", "Suresh", "Maya", "Dev", "Sharma",
];

// Malaysian last names
export const lastNames = [
  // Malay names
  "Rahman", "Abdullah", "Hassan", "Ali", "Ahmad", "Ibrahim", "Osman", "Yusof",
  "Ismail", "Hamid", "Karim", "Aziz", "Hakim", "Rahim", "Nasir", "Halim",
  // Chinese names
  "Tan", "Lim", "Lee", "Wong", "Ng", "Ong", "Chan", "Teo", "Goh", "Chong",
  "Yap", "Koh", "Chin", "Heng", "Ho", "Foo", "Toh", "Soo", "Khoo", "Low",
  // Indian names
  "Kumar", "Krishnan", "Raj", "Nair", "Menon", "Pillai", "Singh", "Sharma",
  "Murugan", "Raman", "Gopal", "Reddy", "Patel", "Das", "Rao", "Iyer",
];

// Common Malaysian merchants
export const merchants = {
  "Transportation": [
    "Grab Ride", "Grab Car", "Touch 'n Go", "PLUS Highway", "MyRapid",
    "KTM Komuter", "LRT", "MRT", "Airport Taxi", "ERL Express",
    "Petronas", "Shell", "Caltex", "BHPetrol", "Petron",
    "KL Sentral Parking", "KLCC Parking", "Mid Valley Parking", "Pavilion Parking",
    "1Utama Parking", "Suria KLCC", "The Gardens Mall", "Bangsar Village",
  ],
  "Meals & Entertainment": [
    "Madam Kwan's", "The Beef", "Nando's", "Tony Roma's", "TGI Friday's",
    "Sushi King", "Rakuzen", "Seoul Garden", "Pavilion KL", "Songket Restaurant",
    "Bijan Bar & Restaurant", "Atmosphere 360", "Contango", "Opus Bistro",
    "Starbucks", "Coffee Bean", "Zus Coffee", "The Coffee House", "Tealive",
    "Family Mart", "7-Eleven", "99 Speedmart", "KK Super Mart", "MyNews",
    "GSC Cinemas", "TGV Cinemas", "Escape Room", "Kidzania", "Sunway Lagoon",
    "Aquaria KLCC", "KL Tower", "Batu Caves", "Petrosains",
  ],
  "Accommodation & Travel": [
    "Hilton KL", "Mandarin Oriental", "Shangri-La", "Grand Hyatt", "JW Marriott",
    "The Ritz-Carlton", "Four Seasons", "InterContinental", "Concorde Hotel",
    "Traders Hotel", "Le Meridien", "Renaissance Hotel", "Sunway Resort",
    "AirAsia", "Malaysia Airlines", "Firefly", "Malindo Air",
  ],
  "Office Expenses": [
    "Popular Bookstore", "MPH", "Office Depot", "Mr. DIY", "Daiso",
    "Shopee", "Lazada", "Courts", "Harvey Norman", "Machines",
    "Celcom", "Maxis", "Digi", "Unifi", "TIME Internet",
  ],
  "Training & Development": [
    "Coursera", "Udemy", "LinkedIn Learning", "Pluralsight", "Skillshare",
    "HRDF Training", "Malaysian Training Centre", "Tech Academy KL",
    "Professional Conference Asia", "KL Convention Centre",
  ],
  "Health & Welfare": [
    "Gleneagles Hospital", "Pantai Hospital", "Prince Court", "KPJ Healthcare",
    "Guardian Pharmacy", "Watsons", "Caring Pharmacy", "Alpro Pharmacy",
    "Fitness First", "Celebrity Fitness", "Chi Fitness", "True Fitness",
  ],
};

// Job positions
export const positions = [
  "Sales Manager", "Marketing Executive", "Software Engineer", "HR Coordinator",
  "Business Analyst", "Project Manager", "Finance Officer", "Operations Manager",
  "Customer Service Rep", "Accountant", "IT Support", "Product Designer",
  "Data Analyst", "Content Writer", "Legal Advisor", "Admin Assistant",
  "QA Engineer", "Sales Executive", "Marketing Manager", "Team Lead",
];

// Receipt statuses with realistic distribution weights
export const receiptStatuses = [
  { status: "Pending Approve", weight: 30 },
  { status: "Paid", weight: 40 },
  { status: "Rejected", weight: 15 },
];

// Rejection reasons
export const rejectionReasons = [
  "Alcohol detected in line item",
  "Receipt exceeds maximum claim amount",
  "Missing required documentation",
  "Duplicate submission detected",
  "Invalid merchant category",
  "Receipt date outside claim period",
  "Personal expense detected",
  "Insufficient receipt quality",
];

// Policy templates
export const policyTemplates = [
  {
    version: 1,
    summary: "Initial Company Expense Policy 2023",
    text: `# Company Expense Policy v1.0

## General Guidelines
Employees are authorized to incur reasonable business expenses. All expenses must be properly documented with original receipts.

## Meal Allowances
- Local meals: Up to RM 50 per person
- Client entertainment: Up to RM 150 per person
- Team meals: Up to RM 30 per person

## Transportation
- Taxi/Ride-hailing: Actual cost with receipt
- Public transport: Actual cost
- Mileage: RM 0.80 per km

## Accommodation
- Within Malaysia: Up to RM 300 per night
- International: Up to RM 500 per night

## Submission Timeline
Submit expense claims within 30 days of incurring the expense.`,
  },
  {
    version: 2,
    summary: "Updated Policy - Enhanced Categories 2024",
    text: `# Company Expense Policy v2.0

## General Guidelines
All business expenses must be pre-approved by direct manager. Original receipts mandatory for claims above RM 50.

## Meal Allowances
- Local meals: Up to RM 60 per person (increased)
- Client entertainment: Up to RM 200 per person (increased)
- Team meals: Up to RM 40 per person (increased)
- **NEW** Coffee/beverages: Up to RM 20 per day

## Transportation
- Taxi/Ride-hailing: Actual cost with receipt
- Public transport: Actual cost
- Mileage: RM 0.85 per km (increased)
- **NEW** EV charging: Actual cost covered

## Accommodation
- Within Malaysia: Up to RM 350 per night (increased)
- International: Up to RM 600 per night (increased)

## Office Supplies
- **NEW** Up to RM 200 per month without pre-approval
- Above RM 200 requires manager approval

## Submission Timeline
Submit expense claims within 45 days (extended from 30).`,
  },
  {
    version: 3,
    summary: "Current Policy - Work From Home Support 2025",
    text: `# Company Expense Policy v3.0 (CURRENT)

## General Guidelines
Digital receipts accepted. Claims processed within 7 business days. Manager pre-approval required for expenses above RM 500.

## Meal Allowances
- Local meals: Up to RM 70 per person
- Client entertainment: Up to RM 250 per person
- Team meals: Up to RM 50 per person
- Coffee/beverages: Up to RM 25 per day

## Transportation
- Taxi/Ride-hailing: Actual cost with receipt
- Public transport: Actual cost
- Mileage: RM 1.00 per km
- EV charging: Actual cost covered
- **NEW** Parking: Up to RM 20 per day

## Accommodation
- Within Malaysia: Up to RM 400 per night
- International: Up to RM 700 per night

## Office Supplies & Technology
- Up to RM 300 per month without pre-approval
- **NEW** WFH equipment: Up to RM 2000 annually
- **NEW** Internet allowance: RM 100 per month

## Entertainment & Team Building
- **NEW** Team activities: Up to RM 100 per person per quarter

## Submission Timeline
Submit expense claims within 60 days. Auto-approved for amounts under RM 50.

## Payment Processing
- Approved claims paid within 7 business days
- Direct bank transfer to employee account`,
  },
];

// Utility functions
export function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomFloat(min, max, decimals = 2) {
  const value = Math.random() * (max - min) + min;
  return parseFloat(value.toFixed(decimals));
}

export function randomDate(daysBack) {
  const date = new Date();
  date.setDate(date.getDate() - randomInt(0, daysBack));
  return date.toISOString().split('T')[0]; // YYYY-MM-DD format
}

export function randomDateISO(daysBack) {
  const date = new Date();
  date.setDate(date.getDate() - randomInt(0, daysBack));
  return date.toISOString();
}

export function weightedRandom(options) {
  const totalWeight = options.reduce((sum, opt) => sum + opt.weight, 0);
  let random = Math.random() * totalWeight;

  for (const option of options) {
    if (random < option.weight) {
      return option.status;
    }
    random -= option.weight;
  }

  return options[0].status;
}

// Generate random Malaysian phone number
export function generatePhoneNumber() {
  const prefixes = ["12", "13", "14", "16", "17", "18", "19"];
  const prefix = randomItem(prefixes);
  const number = randomInt(1000000, 9999999);
  return `+60${prefix}${number}`;
}

// Generate employee
export function generateRandomEmployee(index) {
  const firstName = randomItem(firstNames);
  const lastName = randomItem(lastNames);
  const name = `${firstName} ${lastName}`;
  const employeeId = `E-${1000 + index}`;
  const email = `${firstName.toLowerCase().replace(/\s+/g, '')}.${lastName.toLowerCase()}@company.com`;
  const phoneNumber = generatePhoneNumber();
  const position = randomItem(positions);
  const now = new Date().toISOString();

  return {
    employeeId,
    name,
    email,
    phoneNumber,
    position,
    isActive: true,
    createdAt: now,
  };
}

// Generate amount based on category
export function generateAmountForCategory(category) {
  const ranges = {
    "Transportation": [8, 200],
    "Meals & Entertainment": [15, 300],
    "Accommodation & Travel": [200, 1000],
    "Office Expenses": [15, 500],
    "Training & Development": [100, 2000],
    "Health & Welfare": [50, 800],
  };

  const range = ranges[category] || [10, 100];
  return randomFloat(range[0], range[1]);
}

// Generate receipt
export function generateRandomReceipt(employeeId, displayId) {
  const category = randomItem(Object.keys(merchants));
  const merchant = randomItem(merchants[category]);
  const amount = generateAmountForCategory(category);
  const status = weightedRandom(receiptStatuses);
  const receiptDate = randomDate(180); // Last 6 months
  const submissionDate = randomDateISO(150);
  const now = new Date().toISOString();

  // Placeholder images (using picsum for variety)
  const imageId = randomInt(100, 999);
  const imageUrl = `https://picsum.photos/seed/${imageId}/800/600`;

  const receipt = {
    employeeId,
    display_id: displayId,
    submission_date: submissionDate,
    receipt_date: receiptDate,
    merchant_name: merchant,
    total_amount: amount,
    category,
    status,
    image_url: imageUrl,
    is_modified: Math.random() > 0.8, // 20% chance of being modified
    createdAt: submissionDate,
    updatedAt: now,
  };

  // Add flag_reason for rejected receipts
  if (status === "Rejected") {
    receipt.flag_reason = randomItem(rejectionReasons);
  }

  // Add payment info for paid receipts
  if (status === "Paid") {
    const paymentDate = new Date(submissionDate);
    paymentDate.setDate(paymentDate.getDate() + randomInt(3, 14));
    receipt.payment_date = paymentDate.toISOString();
    receipt.payment_reference = `PAY-${Date.now()}-${randomInt(1000, 9999)}`;
  }

  // Random notes (30% chance)
  if (Math.random() > 0.7) {
    const notes = [
      "Client meeting expense",
      "Team building activity",
      "Business trip",
      "Conference attendance",
      "Training session",
      "Project delivery celebration",
      "Quarterly review meeting",
    ];
    receipt.notes = randomItem(notes);
  }

  return receipt;
}

// Generate policy
export function generatePolicy(templateIndex, daysAgo) {
  const template = policyTemplates[templateIndex];
  const savedAt = new Date();
  savedAt.setDate(savedAt.getDate() - daysAgo);

  const effectiveFrom = new Date(savedAt);
  effectiveFrom.setDate(effectiveFrom.getDate() + 7); // Effective 7 days after save

  return {
    text: template.text,
    summary: template.summary,
    version: template.version,
    is_current: templateIndex === policyTemplates.length - 1, // Last one is current
    savedAt: savedAt.toISOString(),
    effectiveFrom: effectiveFrom.toISOString(),
  };
}

