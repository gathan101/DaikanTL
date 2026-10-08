-- Jalankan di Supabase SQL Editor
create table profiles (
  id uuid references auth.users primary key,
  name text,
  premium boolean default false
);

create table translations (
  id bigint primary key generated always as identity,
  user_id uuid references auth.users,
  mode text,
  font text,
  result jsonb,
  created_at timestamp default now()
);

-- Izinkan user membaca/menulis barisnya sendiri
alter table profiles enable row level security;
alter table translations enable row level security;

create policy "profiles_self" on profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "translations_self" on translations for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
