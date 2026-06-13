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
