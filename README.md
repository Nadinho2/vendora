# Vendora

BUY BETTER WITH VENDORA

## Stack

- Next.js 15 (App Router, Server Actions)
- TypeScript
- Tailwind CSS + shadcn/ui-style components
- Supabase (Postgres + Auth)
- Resend (order confirmation emails)
- Vercel-ready deployment

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Environment variables

- `NEXT_PUBLIC_SITE_URL` (e.g. `http://localhost:3000`)
- Supabase:
  - `NEXT_PUBLIC_SUPABASE_URL` (or `SUPABASE_URL`)
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (or `SUPABASE_ANON_KEY`)
- Resend (optional):
  - `RESEND_API_KEY`
  - `RESEND_FROM` (verified sender email)
- AliExpress (placeholders only; integration added after confirmation):
  - `ALIEXPRESS_APP_KEY`
  - `ALIEXPRESS_APP_SECRET`
  - `ALIEXPRESS_TRACKING_ID`

## Supabase schema (minimal)

Create these tables in your Supabase project (SQL editor). Adjust RLS/policies to your needs.

```sql
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  price numeric not null,
  original_price numeric,
  images text[] not null default '{}'::text[],
  category text,
  rating numeric,
  description text,
  affiliate_url text,
  shipping_info jsonb,
  variants jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  variant_id text,
  quantity int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending',
  total numeric not null,
  currency text not null default 'USD',
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  title text not null,
  unit_price numeric not null,
  quantity int not null default 1,
  created_at timestamptz not null default now()
);
```

## Supabase Auth

- Enable Email (magic link) and Google provider (optional).
- Add redirect URLs:
  - `http://localhost:3000/auth/callback`
  - Your production domain, e.g. `https://your-domain.com/auth/callback`

## Deploy (Vercel)

- Import the repo into Vercel.
- Add the same environment variables in Vercel Project Settings.
- Deploy.
