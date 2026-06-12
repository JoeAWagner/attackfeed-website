# AttackFeed v2 — Setup Guide

## Overview

This is a Next.js 16 cybersecurity news aggregator with:
- **28 RSS feeds** across 5 categories (news, gov-alerts, vulnerabilities, privacy, fraud)
- **Hourly updates** via GitHub Actions cron
- **6 months** of searchable article history in Postgres (Neon free tier)
- **Full-text search** powered by Postgres tsvector
- **Dark + cyan theme**, fully responsive

---

## Step 1: Create a Neon Postgres database (free)

1. Go to [neon.tech](https://neon.tech) and sign up (free)
2. Create a new project named `attackfeed`
3. Copy the **connection string** — it looks like:
   ```
   postgres://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

---

## Step 2: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: AttackFeed v2"
gh repo create attackfeed-website --private --push
```

---

## Step 3: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project** → import your GitHub repo
2. Set these **Environment Variables** in Vercel:

   | Variable | Value |
   |----------|-------|
   | `DATABASE_URL` | Your Neon connection string |
   | `CRON_SECRET` | Run `openssl rand -hex 32` to generate one |
   | `NEXT_PUBLIC_SITE_URL` | `https://www.attackfeed.com` |

3. Deploy — Vercel will build and serve the site

---

## Step 4: Set up the database schema

After deploying, run the schema setup once:

```bash
# Option A: via the API (easiest)
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://www.attackfeed.com/api/cron/fetch-feeds

# Option B: locally (requires DATABASE_URL in .env)
cp .env.example .env
# Edit .env with your DATABASE_URL
npm run db:setup
```

This creates the `articles` table and indexes automatically.

---

## Step 5: Configure GitHub Actions for hourly cron

Add these **Repository Secrets** in GitHub → Settings → Secrets and variables → Actions:

| Secret | Value |
|--------|-------|
| `CRON_SECRET` | Same value as your Vercel `CRON_SECRET` |
| `SITE_URL` | `https://www.attackfeed.com` |

The workflow in `.github/workflows/fetch-feeds.yml` will call your `/api/cron/fetch-feeds` endpoint every hour at :05 past.

You can also trigger it manually from the **Actions** tab → **Fetch RSS Feeds** → **Run workflow**.

---

## Step 6: Point your domain

In Vercel → your project → **Settings → Domains**, add `www.attackfeed.com`.

Update your DNS to point to Vercel (they'll show you the CNAME/A record values).

---

## Local development

```bash
cp .env.example .env
# Fill in DATABASE_URL and CRON_SECRET in .env

npm install
npm run dev
```

The dev server runs at http://localhost:3000.

To populate the database locally:
```bash
curl -H "Authorization: Bearer your-cron-secret" \
  http://localhost:3000/api/cron/fetch-feeds
```

---

## Removing an article

Use the moderation CLI (requires `DATABASE_URL` in `.env`):

```bash
# Find the article (title words or exact URL)
npx tsx --env-file=.env scripts/moderate.ts "some title words"

# Hide it by id (disappears from the site immediately)
npx tsx --env-file=.env scripts/moderate.ts --hide 12345

# See everything hidden / restore one
npx tsx --env-file=.env scripts/moderate.ts --hidden
npx tsx --env-file=.env scripts/moderate.ts --unhide 12345
```

Hidden articles stay in the database so the hourly cron can't re-import
them — they just never render.

## Adding or removing feeds

Edit [`lib/feeds.ts`](lib/feeds.ts) — add or remove entries from the `FEEDS` array.

Each feed needs:
- `url` — RSS/Atom feed URL
- `source` — Display name
- `category` — One of: `news`, `gov-alerts`, `vulnerabilities`, `privacy`, `fraud`

---

## Adding categories

Edit [`lib/categories.ts`](lib/categories.ts) — add a new entry to `CATEGORIES`.

Then add feeds with the new category slug in `lib/feeds.ts`.
