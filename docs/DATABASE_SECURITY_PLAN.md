# Database Security Plan

This repository currently persists demo data to JSON files under `frontend/data`; it does not contain a Supabase, Prisma, Drizzle, or SQL database schema to migrate.

Before production launch, replace the JSON store with a managed Postgres database and apply the controls below through migrations only.

## Required Tables

- `invoices`
- `transactions`
- `visitors`

## Required Ownership Columns

- `invoices.seller_user_id`
- `invoices.funder_user_id`
- `transactions.actor_user_id`
- `visitors.user_id`

## Supabase RLS Baseline

```sql
alter table invoices enable row level security;
alter table transactions enable row level security;
alter table visitors enable row level security;

create policy invoices_owner_read on invoices
  for select using (
    seller_user_id = auth.jwt()->>'sub'
    or funder_user_id = auth.jwt()->>'sub'
  );

create policy invoices_seller_insert on invoices
  for insert with check (seller_user_id = auth.jwt()->>'sub');

create policy invoices_owner_update on invoices
  for update using (
    seller_user_id = auth.jwt()->>'sub'
    or funder_user_id = auth.jwt()->>'sub'
  );

create policy transactions_owner_read on transactions
  for select using (actor_user_id = auth.jwt()->>'sub');

create policy transactions_owner_insert on transactions
  for insert with check (actor_user_id = auth.jwt()->>'sub');

create policy visitors_owner_read on visitors
  for select using (user_id = auth.jwt()->>'sub');

create policy visitors_owner_insert on visitors
  for insert with check (user_id = auth.jwt()->>'sub');

create index invoices_seller_user_id_idx on invoices (seller_user_id);
create index invoices_funder_user_id_idx on invoices (funder_user_id);
create index invoices_status_idx on invoices (status);
create index invoices_due_idx on invoices (due);
create index transactions_actor_user_id_idx on transactions (actor_user_id);
create index transactions_time_idx on transactions (time);
create index visitors_user_id_idx on visitors (user_id);
```

## Production Requirements

- Use Prisma or Drizzle migrations; do not edit schemas directly.
- Use pooled server-side connections only.
- Keep `DATABASE_URL` server-only.
- Never expose database credentials through `VITE_*` variables.
