-- Stores, roles, profiles, invitations + Row Level Security (multi-store ready)
create type app_role as enum ('owner','manager','cashier','inventory','accountant');
create table stores (
  id uuid primary key default gen_random_uuid(), name text not null, store_type text, address text,
  gstin text, phone text, email text, logo_url text, owner_id uuid, created_at timestamptz default now());
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  store_id uuid not null references stores(id) on delete cascade,
  full_name text not null, mobile text, role app_role not null,
  permissions text[] default '{}', is_active boolean not null default true,
  last_login_at timestamptz, created_at timestamptz default now());
create index on profiles(store_id);
create table employee_invites (
  id uuid primary key default gen_random_uuid(), store_id uuid not null references stores(id) on delete cascade,
  email text not null, full_name text, mobile text, role app_role not null check (role <> 'owner'),
  token_hash text not null unique, expires_at timestamptz not null, accepted_at timestamptz,
  invited_by uuid references profiles(id), created_at timestamptz default now(),
  unique (store_id, email));
create table audit_logs (
  id bigserial primary key, store_id uuid references stores(id), user_id uuid, action text not null,
  entity text, entity_id text, detail jsonb, created_at timestamptz default now());
create index on audit_logs(store_id, created_at desc);

create function current_store_id() returns uuid language sql stable security definer set search_path=public as
$$ select store_id from profiles where id = auth.uid() and is_active $$;
create function current_role_name() returns app_role language sql stable security definer set search_path=public as
$$ select role from profiles where id = auth.uid() and is_active $$;

alter table stores enable row level security; alter table profiles enable row level security;
alter table employee_invites enable row level security; alter table audit_logs enable row level security;
create policy store_read on stores for select using (id = current_store_id());
create policy store_owner_update on stores for update using (id = current_store_id() and current_role_name()='owner');
create policy profile_read on profiles for select using (store_id = current_store_id());
create policy profile_owner_write on profiles for update using (store_id = current_store_id() and current_role_name()='owner');
create policy invite_owner on employee_invites for all using (store_id = current_store_id() and current_role_name()='owner');
create policy audit_read on audit_logs for select using (store_id = current_store_id() and current_role_name() in ('owner','accountant'));
-- Registration and invite acceptance run in FastAPI with the service-role key (never exposed to the browser).
