# AetherPOS Command Center

Web-based master admin panel for managing AetherPOS outlets, users, plans, and audit logs. Built with Next.js 16, Prisma ORM, and PostgreSQL (Neon).

## Prerequisites

- **Node.js** 18+
- **Vercel** account (for deployment)
- **Neon** database (PostgreSQL serverless)

## Quick Start

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd aetherpos-command-center
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set environment variables

Copy the example env file and fill in your Neon connection string:

```bash
cp .env.example .env
```

Edit `.env`:

```
DATABASE_URL=postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/aetherpos?sslmode=require
```

> **Note:** `DATABASE_URL` is the pooled Neon connection string. No `DIRECT_URL` is needed — the app uses only `DATABASE_URL` for both queries and migrations.

### 4. Generate Prisma Client

```bash
npx prisma generate
```

### 5. Push schema to database

```bash
npx prisma db push
```

### 6. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the Command Center.

### 7. Seed demo data (optional)

Use the built-in seed endpoint to populate demo data:

```bash
curl -X POST http://localhost:3000/api/admin/seed
```

This creates 8 outlets, 12 users, 1 group, 3 plans (Free/Pro/Enterprise), outlet settings, and crew permissions.

## Deploy to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Import in Vercel

1. Go to [vercel.com](https://vercel.com) and click **New Project**
2. Import your GitHub repository
3. Vercel will auto-detect Next.js

### 3. Set environment variable

In Vercel project settings → Environment Variables, add:

| Key          | Value                                                              |
| ------------ | ------------------------------------------------------------------ |
| DATABASE_URL | `postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/aetherpos?sslmode=require` |

> **Important:** Only `DATABASE_URL` is required. Do **not** set `DIRECT_URL`.

### 4. Deploy

Click **Deploy**. Vercel will run `prisma generate` automatically (via the `postinstall` script in `package.json`).

### 5. Push schema to Neon (first deploy only)

After the first successful deploy, push the Prisma schema to your Neon database:

```bash
npx prisma db push
```

Or run it as a Vercel build command by adding to your `vercel.json` build settings.

## Features

- **Dashboard** — Stats overview, plan distribution, revenue (MRR/ARR), recent outlets
- **Outlets** — CRUD, plan changes, duration/expiry, owner transfer, outlet settings
- **Users** — CRUD, password reset, suspend/unsuspend (OWNER via accountType prefix, CREW via permissions)
- **Plans & Pricing** — Editable plan cards, feature comparison table with inline editing
- **Audit Log** — All admin actions logged with filtering and pagination
- **Groups** — Multi-outlet group management

## Architecture

- **Framework**: Next.js 16 with App Router
- **Database**: PostgreSQL (Neon serverless)
- **ORM**: Prisma
- **UI**: Tailwind CSS + shadcn/ui (dark theme)
- **State**: React hooks with server-side data fetching

## Database Schema

The schema matches the original AetherPOS PostgreSQL schema with 16 models:

- OutletGroup, Outlet, User, Category, Product, ProductVariant
- Customer, Transaction, TransactionItem, LoyaltyLog
- AuditLog, OutletSetting, Promo, CrewPermission, Plan
- OutletTransfer, TransferItem

## License

Private — All rights reserved.
