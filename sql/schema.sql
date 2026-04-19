create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  company_name text,
  role text default 'member',
  plan text default 'free',
  created_at timestamptz default now()
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  invoice_number text not null,
  company_name text not null,
  company_email text not null,
  client_name text not null,
  client_email text not null,
  issue_date date not null,
  due_date date not null,
  status text not null default 'draft',
  currency text not null default 'USD',
  notes text,
  subtotal numeric(12,2) not null default 0,
  tax numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  public_token text not null unique,
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
alter table public.invoices enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id);

drop policy if exists "Users can read own invoices" on public.invoices;
create policy "Users can read own invoices"
on public.invoices
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own invoices" on public.invoices;
create policy "Users can insert own invoices"
on public.invoices
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own invoices" on public.invoices;
create policy "Users can update own invoices"
on public.invoices
for update
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can delete own invoices" on public.invoices;
create policy "Users can delete own invoices"
on public.invoices
for delete
to authenticated
using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, full_name, company_name, role, plan)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'company_name',
    'member',
    'free'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
