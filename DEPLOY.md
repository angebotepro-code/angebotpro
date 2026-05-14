# Deploy to Vercel

## What was already fixed

- ✅ `postinstall` script added — Prisma client auto-generates on Vercel
- ✅ `build` script runs `prisma generate` before `next build`
- ✅ Prisma schema updated for Supabase connection pooling (`DATABASE_URL` + `DIRECT_URL`)
- ✅ `.env.example` created with all required variables

---

## 1. Prepare Supabase

1. Go to [supabase.com](https://supabase.com) → your project
2. **Project Settings → API**
   - Copy `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - Copy `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Copy `service_role secret` → `SUPABASE_SERVICE_ROLE_KEY`
3. **Project Settings → Database → Connection String**
   - **Transaction pooler (port 6543)** → `DATABASE_URL` (add `?pgbouncer=true` to the end)
   - **Session pooler (port 5432)** → `DIRECT_URL`
4. Run migrations locally (or use Supabase SQL Editor):
   ```bash
   npx prisma migrate dev
   # or if you want to push directly:
   npx prisma db push
   ```

---

## 2. Link to Vercel

Install Vercel CLI (if you haven't):
```bash
npm i -g vercel
```

Link project:
```bash
cd /Users/anas/Projects/angebotpro
vercel
```
- Choose "Link to existing project" if you already created one on Vercel dashboard
- Or "Create new project"
- It will detect Next.js automatically

---

## 3. Add Environment Variables to Vercel

**Option A: CLI (fastest)**
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add DATABASE_URL
vercel env add DIRECT_URL
vercel env add OPENAI_API_KEY
vercel env add DEEPSEEK_API_KEY
vercel env add RESEND_API_KEY
# optional:
# vercel env add STRIPE_SECRET_KEY
# vercel env add STRIPE_WEBHOOK_SECRET
```

**Option B: Dashboard**
Go to [vercel.com](https://vercel.com) → your project → **Settings → Environment Variables**

| Variable | Type | Example |
|----------|------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Plain | `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Plain | `eyJ...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Plain | `eyJ...` |
| `DATABASE_URL` | Plain | `postgresql://...:6543/...?pgbouncer=true` |
| `DIRECT_URL` | Plain | `postgresql://...:5432/...` |
| `OPENAI_API_KEY` | Plain | `sk-...` |
| `DEEPSEEK_API_KEY` | Plain | `sk-...` |
| `RESEND_API_KEY` | Plain | `re_...` |

> ⚠️ Make sure `DATABASE_URL` uses port **6543** (Transaction Pooler) with `?pgbouncer=true`
> and `DIRECT_URL` uses port **5432** (Session Pooler).

---

## 4. Deploy

```bash
vercel --prod
```

Or just push to your connected Git branch — Vercel auto-deploys.

---

## 5. Verify

Check the production URL:
- Landing page loads
- `/login` works
- `/app/dashboard` redirects to login (auth working)

Check Vercel logs if anything fails:
```bash
vercel logs --all
```

---

## Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `Cannot find module '@/lib/generated/prisma'` | Prisma client not generated | ✅ Already fixed with `postinstall` |
| `Can't reach database server` / connection timeout | Wrong DATABASE_URL on Vercel | Use port **6543** + `?pgbouncer=true` |
| `Prisma Migrate: database error` | Migration needs direct connection | `DIRECT_URL` must use port **5432** |
| `Missing env var` | Forgot to add to Vercel dashboard | Add all vars from `.env.example` |
| `Module not found: @heroicons/...` or similar | Dependency issue | Run `npm install` locally, commit `package-lock.json` |
