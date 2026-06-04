# InternFlow

A personal CRM for managing your internship job search. Track applications, contacts, interactions, and reminders — all in one place.

## Features

- **Applications** — track every role with status, applied date, job posting URL, and notes
- **Pipeline** — visualize your search across Wishlist → Applied → Phone Screen → Interview → Offer
- **Contacts** — log the people you meet with relationship strength (Cold / Warm / Hot) and link them to applications
- **Interactions** — record every email, call, coffee chat, or LinkedIn message in context
- **Reminders** — set due-date tasks tied to applications or contacts, with overdue highlighting
- **Dashboard** — at-a-glance stats, pipeline breakdown, upcoming reminders, and recent interactions

## Stack

- [Next.js 15](https://nextjs.org/) (App Router, Server Actions)
- [Supabase](https://supabase.com/) (Postgres + Auth)
- [Tailwind CSS](https://tailwindcss.com/)
- TypeScript

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/leejonathan22/internflow
cd internflow
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase/schema.sql`
3. Go to **Authentication → Users** and create your account

### 3. Configure environment variables

Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in.
