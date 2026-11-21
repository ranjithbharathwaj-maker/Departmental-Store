-- Products, inventory, stock movements, price history, sales (all tenant-scoped by store_id)
create table products (
  id uuid primary key default gen_random_uuid(), store_id uuid not null references stores(id) on delete cascade,
  name text not null, barcode text, sku text, category text, brand text, unit text not null default 'piece',
  purchase_price numeric(12,2) not null check (purchase_price >= 0), selling_price numeric(12,2) not null check (selling_price >= 0),
  mrp numeric(12,2), gst numeric(5,2) not null default 0 check (gst between 0 and 28), min_stock numeric(12,3) not null default 0,
  is_active boolean not null default true, created_at timestamptz default now(), updated_at timestamptz default now());
create unique index products_barcode_uq on products(store_id, barcode) where barcode is not null;
create index products_name_ix on products(store_id, lower(name));
create table inventory (
  product_id uuid primary key references products(id), store_id uuid not null references stores(id),
  qty numeric(12,3) not null default 0 check (qty >= 0), updated_at timestamptz default now());
create table stock_movements (
  id bigserial primary key, store_id uuid not null references stores(id), product_id uuid not null references products(id),
  movement_type text not null, qty_before numeric(12,3) not null, qty_change numeric(12,3) not null, qty_after numeric(12,3) not null,
  reason text, ref text, user_name text, created_at timestamptz default now());
create index on stock_movements(store_id, product_id, created_at desc);
create table price_history (
  id bigserial primary key, store_id uuid not null references stores(id), product_id uuid not null references products(id),
  old_purchase numeric(12,2), new_purchase numeric(12,2), old_selling numeric(12,2), new_selling numeric(12,2),
  changed_by text, created_at timestamptz default now());
create table invoice_counters (store_id uuid primary key references stores(id), last_no bigint not null default 0);
create table sales (
  id uuid primary key default gen_random_uuid(), store_id uuid not null references stores(id), invoice_no text not null,
  cashier text, customer_name text, customer_mobile text, subtotal numeric(12,2) not null, discount numeric(12,2) not null,
  taxable numeric(12,2) not null, cgst numeric(12,2) not null, sgst numeric(12,2) not null, igst numeric(12,2) not null,
  round_off numeric(12,2) not null, total numeric(12,2) not null, status text not null default 'completed',
  created_at timestamptz default now(), unique (store_id, invoice_no));
create index on sales(store_id, created_at desc);
create table sale_items (
  id bigserial primary key, sale_id uuid not null references sales(id) on delete cascade, store_id uuid not null references stores(id),
  product_id uuid not null references products(id), name text not null, qty numeric(12,3) not null check (qty > 0),
  unit_price numeric(12,2) not null, discount numeric(12,2) not null, taxable numeric(12,2) not null,
  cgst numeric(12,2) not null, sgst numeric(12,2) not null, igst numeric(12,2) not null, total numeric(12,2) not null,
  cost_price numeric(12,2) not null);
create table sale_payments (
  id bigserial primary key, sale_id uuid not null references sales(id) on delete cascade, store_id uuid not null references stores(id),
  method text not null check (method in ('cash','upi','debit','credit')), amount numeric(12,2) not null check (amount > 0));
do $$ declare t text; begin
  foreach t in array array['products','inventory','stock_movements','price_history','sales','sale_items','sale_payments'] loop
    execute format('alter table %I enable row level security', t);
    execute format('create policy tenant_%s on %I for select using (store_id = current_store_id())', t, t);
  end loop; end $$;
-- Writes go through FastAPI (which verifies the user's store). Direct client access is read-only and tenant-scoped.
