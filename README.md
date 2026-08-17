# 🧾 SmartClaim &middot; [![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite)](https://vite.dev) [![React](https://img.shields.io/badge/React-18.3-087EA4?logo=react)](https://react.dev) [![Convex](https://img.shields.io/badge/Convex-1.30-EE342F?logo=convex)](https://convex.dev) [![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38BDF8?logo=tailwindcss)](https://tailwindcss.com) [![n8n](https://img.shields.io/badge/n8n-automation-EA4B71?logo=n8n)](https://n8n.io) [![Claude](https://img.shields.io/badge/Claude-Opus%204.5-D97757?logo=anthropic)](https://anthropic.com)

> **Easy snap, easy claim.** Making the receipt claiming process snappy and efficient.

SmartClaim lets employees submit expense claims as easily as sending a WhatsApp message: snap a photo of a receipt, send it to an AI bot, and it lands on an admin dashboard in real time — where it can be approved and paid out, or rejected with a reason. No more claims disappearing into the void.

> **Context:** Employees get frustrated when expense claims take forever to process — receipts get submitted, then nothing happens for weeks, requiring multiple follow-ups and creating unnecessary tension between employees and management. SmartClaim collapses that whole loop into a photo and a tap.

Submitted to the **Cursor × Anthropic Hackathon Malaysia**. Built in a single day.

- 📦 **Devpost** — https://devpost.com/software/simpleclaim
- 🐙 **GitHub** — https://github.com/HarZiXuan/receiptmind-cursor-hackathon

## ✨ Features

- **📸 Snap-to-Claim** — Employees photograph a receipt and send it to an AI bot via WhatsApp. The bot extracts the merchant, amount, date, and category and pushes it straight to the dashboard.
- **⚡ Real-Time Dashboard** — Backed by Convex, submissions appear on the admin dashboard instantly — no refresh, no polling.
- **✅ Full Approval Workflow** — Receipts move through `Pending Approve → Approved → Paid`, with server-side scheduled payout (survives browser refresh) via **Ryt Bank**. Rejections carry a reason and notify the employee.
- **📊 Analytics & Charts** — Line, bar, and pie charts (Recharts) for spend trends, status breakdown, and rejection tracking, with date-range and preset filters.
- **🔍 Search, Filter & Sort** — Search by merchant/employee/amount, filter by status and date range, sortable columns, and row-limit pagination.
- **👥 Employee Management** — Create, edit, activate/deactivate, and remove employees; phone numbers are auto-normalised to the `60` format for WhatsApp.
- **📜 Policy Versioning** — Track company expense policy versions with an active-version system.
- **🔔 WhatsApp Notifications** — Approvals, payments, and rejections notify the employee on WhatsApp automatically.
- **🛡️ Bearer-Token HTTP API** — Authenticated endpoints power the WhatsApp bot (`/policy`, `/receipt`, `/employee`, `/employee/claims`, `/receipt/check`).
- **🌙 Dark Mode** — Full light/dark theme, persisted to `localStorage`.
- **🌱 Seeding** — One-command realistic Malaysian-context sample data (employees, receipts, policies) for demos and testing.

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React 18 |
| **Build** | Vite 5 |
| **Styling** | Tailwind CSS 3 (utility-first, dark mode via `class` strategy) |
| **Backend** | Convex 1.30 — real-time reactive DB, serverless mutations/actions, HTTP router, cron scheduler |
| **Charts** | Recharts 3 |
| **Icons** | Lucide React |
| **Image hosting** | imgbb (receipt photos uploaded as base64 → hosted URL) |
| **Automation** | n8n (6 workflows — AI agent + receipt scanning, powered by **Claude Opus 4.5** & **Sonnet 4.5**) |
| **AI / OCR** | Anthropic Claude (extracts merchant, amount, date, category from receipt photos) |
| **Payments** | Ryt Bank API (payout on approval) |
| **Notifications** | WhatsApp Web (`@c.us` endpoint) |

## 🔄 How It Works

```
Employee                 WhatsApp Bot (n8n)            Convex Backend            Admin Dashboard
   │  📸 snap receipt          │                            │                          │
   ├──────────────────────────►│  extracts merchant/amount  │                          │
   │                           ├── POST /receipt (Bearer) ──►│  stores receipt          │
   │                           │                            ├── real-time sync ───────►│  sees claim instantly
   │                           │                            │                          │
   │                           │                            │◄── approve / reject ─────┤
   │                           │                            │                          │
   │                           │   schedule payout (30s)    │                          │
   │                           │                            ├── Ryt Bank transfer ────►│  status → "Paid"
   │◄── WhatsApp notification ─┤◄── sendEmployeeNotification┘                          │
```

1. An employee snaps a photo and messages the WhatsApp bot.
2. The bot (an n8n workflow) calls the authenticated Convex HTTP API (`POST /receipt`), which uploads the image to imgbb and stores the claim.
3. Convex pushes the new claim to the admin dashboard in real time.
4. The admin approves (scheduling a 30-second **Ryt Bank** payout) or rejects with a reason.
5. The employee is notified on WhatsApp at every status change.

## 🤖 n8n AI Workflows

The WhatsApp/Telegram bot is built entirely in **n8n** — six workflows (packaged in `n8n-nodes.zip`) that turn a receipt photo into a structured claim, using **Claude** to do the reading:

| Workflow | Role |
|---|---|
| `ReceiptMind.json` | Main workflow — bot trigger, AI agent (Claude Opus 4.5) with HTTP/Redis tools, orchestration, Redis state |
| `Scan Receipt.json` | AI receipt extraction — calls Anthropic (Claude Sonnet 4.5) to read merchant, amount, date, category from the photo |
| `VerifyEmployee.json` | Looks the sender up by phone number via `GET /employee` |
| `Policy Guard.json` | Checks the claim against the active policy via `GET /policy` and flags violations |
| `JSON brother (2).json` | Structures the AI output into the receipt payload |
| `FORMAT brother (To Whatsapp).json` | Formats the response as WhatsApp-style text (markdown → `*bold*`) for the reply |

The agent is wired to SmartClaim's Convex HTTP API, so the moment Claude finishes extracting a receipt, the claim is live on the dashboard — no human in the loop until approval.

## 🗂️ Project Structure

```
receiptmind-cursor-hackathon/
├── index.html                    # SPA entry point (title: "SmartClaims AI")
├── package.json
├── vite.config.js                # Vite + React (dev server on :5173)
├── tailwind.config.cjs           # Tailwind theme + brand tokens
├── postcss.config.cjs
├── .env                          # VITE_CONVEX_URL + CONVEX_DEPLOYMENT
├── n8n-nodes.zip                 # 6 n8n workflows (ReceiptMind, Scan Receipt, Verify Employee, Policy Guard, JSON/format brothers)
├── HTTP_ENDPOINTS.md             # HTTP API reference (bot integration)
├── IMGBB_SETUP.md                # imgbb API key configuration
├── SEED_DATA_USAGE.md            # Sample-data seeding guide
├── public/
│   └── index.html
├── convex/                       # Convex backend
│   ├── schema.js                 # users / employees / receipts / policies tables
│   ├── receipts.js               # CRUD + approval/payout workflow + scheduler
│   ├── employees.js              # Employee queries & mutations
│   ├── users.js                  # User management
│   ├── policies.js               # Policy versioning
│   ├── http.js                   # Authenticated HTTP router (WhatsApp bot API)
│   ├── notifications.js          # WhatsApp notification dispatch
│   ├── migrations.js             # One-time data migrations
│   ├── seed.js / seedData.js     # Sample-data generators
│   └── README.md                 # Full backend documentation
└── src/
    ├── main.jsx                  # React root + ConvexProvider
    ├── App.jsx                   # Layout, dark mode, tab routing
    ├── styles.css
    ├── pages/
    │   ├── Dashboard.jsx         # Analytics, charts, transactions table
    │   ├── LiveClaims.jsx        # Real-time claims feed
    │   ├── ManageEmployee.jsx    # Employee CRUD
    │   └── Policy.jsx            # Policy management
    ├── components/
    │   ├── charts/               # LineChart, BarChart, PieChart (Recharts)
    │   ├── navigation/           # Sidebar, Header, NavItem
    │   ├── filters/              # DateFilter
    │   ├── modals/               # ReceiptDetailModal (approve/pay/reject)
    │   └── ui/                   # ActionButton, StatusBadge, Toast, etc.
    ├── data/mockReceipts.js
    └── utils/                    # cn(), formatAmount()
```

## 🚀 Local Development

### Prerequisites

- **Node.js** 18+ and **npm** 9+
- A **Convex** account ([convex.dev](https://convex.dev))
- An **imgbb** API key ([api.imgbb.com](https://api.imgbb.com/))

### Setup

```bash
# Clone the repo
git clone https://github.com/HarZiXuan/receiptmind-cursor-hackathon.git
cd receiptmind-cursor-hackathon

# Install dependencies
npm install

# Start the Convex backend (separate terminal)
npx convex dev

# Start the frontend dev server
npm run dev
```

Open `http://localhost:5173` in your browser. `npx convex dev` writes `VITE_CONVEX_URL` to your `.env` automatically.

### Environment Variables

Set these in your Convex deployment (see `IMGBB_SETUP.md`):

| Variable | Purpose |
|---|---|
| `IMGBB_API_KEY` | Receipt image uploads (required for `POST /receipt`) |
| `API_BEARER_TOKEN` | Bearer token guarding the HTTP endpoints |
| `NOTIFICATION_ENDPOINT_URL` | WhatsApp webhook target for employee notifications |

```bash
npx convex env set IMGBB_API_KEY "your-imgbb-api-key"
npx convex env set API_BEARER_TOKEN "your-secret-token"
npx convex env set NOTIFICATION_ENDPOINT_URL "https://your-whatsapp-webhook.example"
```

### Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Serve the production build locally |
| `npx convex dev` | Run the Convex backend locally |

## 🔌 HTTP API

The WhatsApp bot talks to SmartClaim through authenticated HTTP endpoints (all require `Authorization: Bearer <API_BEARER_TOKEN>`). Full reference in `HTTP_ENDPOINTS.md`.

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/receipt` | Submit a receipt (base64 image → imgbb → DB) |
| `GET` | `/receipt/check?invoiceNumber=` | Duplicate invoice detection |
| `GET` | `/employee?phoneNumber=` | Look up an employee by phone number |
| `GET` | `/employee/claims?employeeId=` | Monthly claims aggregated by category |
| `GET` | `/policy` | Current active expense policy |

## 🌱 Seeding Sample Data

Populate the database with realistic Malaysian-context data for demos and testing (see `SEED_DATA_USAGE.md`):

```bash
# Quick test set (20 employees, 50 receipts, 3 policies)
npx convex run seed:seedQuick

# Full set (200 employees, 300 receipts, 3 policies)
npx convex run seed:seedDatabase

# Custom
npx convex run seed:seedDatabase \
  --arg '{"employeeCount": 100, "receiptCount": 200, "policyCount": 5, "clearExisting": true}'

# View current stats
npx convex run seed:getSeedStats

# Wipe everything
npx convex run seed:clearAllData
```

## 📚 Documentation

- **`HTTP_ENDPOINTS.md`** — Full API reference with request/response examples for the WhatsApp bot integration.
- **`IMGBB_SETUP.md`** — Step-by-step imgbb API key configuration.
- **`SEED_DATA_USAGE.md`** — Sample-data generation and usage guide.
- **`convex/README.md`** — In-depth backend schema and API module documentation.

---

## 👥 Team

- **ZIXUAN HAR** — [devpost.com/harzixuan](https://devpost.com/harzixuan)
- **REN YI GAN** — [devpost.com/rygan1220](https://devpost.com/rygan1220)
- **Lim Xuan** — [devpost.com/limxuan](https://devpost.com/limxuan)

---

**Built in one day for the Cursor × Anthropic Hackathon — because expense claims shouldn't take a week.**
