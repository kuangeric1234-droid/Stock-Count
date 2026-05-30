-- =====================================================================
--  Stock Count — Supabase one-shot setup
--  Run this ONCE in your Supabase project:
--    Supabase dashboard → SQL Editor → New query → paste all of this → Run
-- =====================================================================

-- UUID generator
create extension if not exists "pgcrypto";

-- ---------- Products table ----------
create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  qty         numeric not null default 0,
  unit        text default 'pcs',
  category    text default 'Other',
  price       numeric default 0,
  barcode     text,
  note        text,
  photo       text,              -- public URL of the uploaded photo
  updated_by  text,              -- name of the person who last counted
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ---------- Row Level Security ----------
-- NOTE: this is an OPEN policy — anyone with the app link + anon key can
-- read/write. That's intentional for a small private family tool shared by
-- link. If you ever want real logins, replace these with auth-based policies.
alter table public.products enable row level security;

drop policy if exists "stockcount_anon_all" on public.products;
create policy "stockcount_anon_all"
  on public.products
  for all
  to anon, authenticated
  using (true)
  with check (true);

-- ---------- Realtime (live multi-user updates) ----------
do $$
begin
  begin
    alter publication supabase_realtime add table public.products;
  exception when duplicate_object then
    null; -- already added
  end;
end $$;

-- ---------- Photo storage bucket ----------
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

drop policy if exists "stockcount_photos_read" on storage.objects;
create policy "stockcount_photos_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'photos');

drop policy if exists "stockcount_photos_write" on storage.objects;
create policy "stockcount_photos_write"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'photos');

drop policy if exists "stockcount_photos_update" on storage.objects;
create policy "stockcount_photos_update"
  on storage.objects for update
  to anon, authenticated
  using (bucket_id = 'photos')
  with check (bucket_id = 'photos');

-- Done. Now copy your Project URL + anon key into StockCount.html.
