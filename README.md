# Our Weddings — Premium Wedding Invitation Platform

A luxury digital wedding experience built with Next.js 15, featuring bilingual support (English/Amharic), QR check-in, RSVP, guestbook, and admin dashboard.

## Tech Stack

- **Frontend:** Next.js 15, TypeScript, Tailwind CSS, Framer Motion, Swiper.js, next-intl
- **Backend:** Next.js API Routes, Prisma ORM, PostgreSQL, JWT Auth, QR Generator
- **Hosting:** Vercel + Render PostgreSQL + Cloudinary

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` (already configured for local Docker Postgres).

### 3. Start local database

```bash
docker compose up -d
```

This starts PostgreSQL on **localhost:5435** with:
- User: `wedding`
- Password: `wedding123`
- Database: `weddings`

### 4. Set up database schema & seed data

```bash
npm run db:push
npm run db:seed
```

### 5. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel

Vercel cannot use `localhost:5435`. You need a **cloud PostgreSQL** database (Render, Neon, Supabase, etc.).

### 1. Create a production database

Create a **new** Postgres database for this wedding app. Do not reuse unrelated databases.

For **Render Postgres**, copy the **External** connection string and add SSL:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
```

### 2. Set Vercel environment variables

In Vercel → Project → Settings → Environment Variables, add:

| Variable | Example |
|----------|---------|
| `DATABASE_URL` | Your cloud Postgres URL with `?sslmode=require` |
| `JWT_SECRET` | A long random secret |
| `ADMIN_PASSWORD` | Your admin password |
| `INVITE_SLUG` | `TADESSE-HANA` |
| `INVITE_PASSWORD` | `love2026` |
| `NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL` | Optional. Leave unset to auto-embed from venue name/address. Do not use placeholder `pb` URLs from docs. |

Apply to **Production**, **Preview**, and **Development** on Vercel.

### 3. Push schema and seed production data

Run once from your machine (replace with your production URL):

```bash
DATABASE_URL="postgresql://..." npm run db:push
DATABASE_URL="postgresql://..." npm run db:seed
```

### 4. Redeploy

After saving env vars, redeploy the project on Vercel.

### 5. Verify deployment

```bash
curl https://your-app.vercel.app/api/health
```

You should see:

```json
{ "ok": true, "database": "connected", "couple": "TADESSE-HANA" }
```

If RSVP still fails, check `/api/health` first — it usually means `DATABASE_URL` is missing, still pointing to localhost, or the database was not seeded.

## Routes

| Route | Description |
|-------|-------------|
| `/en` or `/am` | Main wedding invitation (English/Amharic) |
| `/invite/TADESSE-HANA` | Digital invitation link |
| `/invite/TADESSE-HANA?guest=ID` | Personal guest invitation with QR |
| `/admin` | Admin login |
| `/admin/dashboard` | Guest management, QR scanner, analytics |

## Default Credentials

- **Invitation password:** `love2026`
- **Admin password:** `admin123`
# digital_wedding_invitation
