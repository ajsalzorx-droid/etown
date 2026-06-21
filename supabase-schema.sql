-- Run this in the Supabase SQL editor before using the live dashboard.
-- These policies are open because this is a static website using an anon key.
-- For production, protect admin actions with Supabase Auth before going live.

create table if not exists public.bookings (
  id text primary key,
  name text not null,
  phone text,
  booking_date date,
  booking_time time,
  guests integer default 1,
  notes text,
  status text default 'New',
  created_at timestamptz default now()
);

alter table public.bookings enable row level security;

drop policy if exists "Allow booking inserts" on public.bookings;
drop policy if exists "Allow booking reads" on public.bookings;
drop policy if exists "Allow booking updates" on public.bookings;
drop policy if exists "Allow booking deletes" on public.bookings;

create policy "Allow booking inserts"
on public.bookings for insert
with check (true);

create policy "Allow booking reads"
on public.bookings for select
using (true);

create policy "Allow booking updates"
on public.bookings for update
using (true)
with check (true);

create policy "Allow booking deletes"
on public.bookings for delete
using (true);
