# AetherPOS Webmaster Dashboard

## Webmaster panel untuk mengelola platform AetherPOS.

### Fitur
- **Dashboard** - KPI overview, revenue chart, multi outlet pipeline
- **Transaksi** - Daftar transaksi dengan filter hari/bulan/tahun/custom
- **Owner** - Manajemen owner (add, detail, reset password, ganti plan & durasi)
- **Outlet** - CRUD outlet dengan filter status
- **Branch** - CRUD branch
- **Crew** - CRUD crew dengan reset password
- **Plan & Pricing** - Edit tabel plan & pricing (card view)

### Tech Stack
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS 4 + shadcn/ui
- Prisma ORM (SQLite untuk dev, ganti ke PostgreSQL/MySQL untuk production)
- Recharts untuk chart
- Sonner untuk toast notification

### Deploy ke Vercel

1. **Setup Database**
   - Vercel tidak support SQLite (no persistent filesystem)
   - Gunakan **Neon PostgreSQL**, **PlanetScale**, **Supabase**, atau **Turso**
   - Update `DATABASE_URL` di Vercel Environment Variables
   - Update `prisma/schema.prisma`: ganti `provider = "sqlite"` ke `provider = "postgresql"` (atau mysql)

2. **Environment Variables** (set di Vercel Dashboard > Settings > Environment Variables)
   ```
   DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
   ```

3. **Deploy**
   - Push ke GitHub, connect ke Vercel, auto-deploy
   - Atau: `vercel --prod`

4. **Run Prisma Migrate** (setelah deploy pertama kali)
   ```bash
   vercel env pull .env.local
   npx prisma db push
   # atau untuk production:
   npx prisma migrate deploy
   ```

5. **Seed Data** (opsional, untuk testing)
   ```bash
   npx tsx prisma/seed.ts
   ```

### Local Development
```bash
npm install
cp .env.example .env
npx prisma db push
npx tsx prisma/seed.ts
npm run dev
```