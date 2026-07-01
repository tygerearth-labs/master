# AetherPOS Command Center

Web Master Admin Panel for managing AetherPOS outlets, users, plans, and billing.

## 🚀 Deploy to Vercel + Neon

### Prerequisites
1. [Vercel Account](https://vercel.com)
2. [Neon Database](https://neon.tech) — free tier works
3. [Vercel CLI](https://vercel.com/docs/cli) (optional)

### Step 1: Create Neon Database
1. Go to [neon.tech](https://console.neon.tech) and create a new project
2. Copy the **Connection string** (pooled) → this is your `DATABASE_URL`
3. Copy the **Connection string** (direct) → this is your `DIRECT_URL`

### Step 2: Deploy to Vercel

#### Option A: One-click deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=YOUR_REPO_URL)

#### Option B: Manual deploy
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Set environment variables
vercel env add DATABASE_URL
vercel env add DIRECT_URL

# Redeploy with env vars
vercel --prod
```

### Step 3: Set Environment Variables in Vercel

In your Vercel project dashboard → Settings → Environment Variables:

| Variable | Value | Notes |
|---|---|---|
| `DATABASE_URL` | `postgresql://user:pass@ep-xxx.neon.tech/db?sslmode=require&pgbouncer=true` | Pooled connection (for app) |
| `DIRECT_URL` | `postgresql://user:pass@ep-xxx.neon.tech/db?sslmode=require` | Direct connection (for migrations) |

### Step 4: Run Migrations
```bash
# Set DATABASE_URL and DIRECT_URL in your local .env, then:
npx prisma migrate deploy
```

Or use the seed endpoint after deploy:
```
POST https://your-app.vercel.app/api/admin/seed
```

## 📋 Features

- **Dashboard** — Stats, revenue (MRR/ARR), plan distribution
- **Outlets** — CRUD, plan changes, duration management, group operations
- **Users** — Password reset, owner suspension
- **Plans & Pricing** — Editable feature comparison table, inline editing
- **Audit Log** — Full action history

## 🛠 Tech Stack

- Next.js 16 (App Router)
- TypeScript 5
- Tailwind CSS 4 + shadcn/ui
- Prisma ORM (PostgreSQL/Neon)
- bcryptjs (password hashing)

## 🔐 Security Notes for Production

Before going live:
1. Add authentication (NextAuth.js is included as a dependency)
2. Remove or protect the `/api/admin/seed` endpoint
3. Add rate limiting to API routes
4. Set `NEXTAUTH_SECRET` and `NEXTAUTH_URL` environment variables
5. Add CSRF protection
