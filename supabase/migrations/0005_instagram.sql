-- Instagram sync: private secrets store + dedupe key for synced posts.

-- Service-role-only secrets (RLS on, deliberately NO policies — anon/authenticated
-- get nothing; all access goes through server code using the service client).
create table if not exists integration_secrets (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);
alter table integration_secrets enable row level security;

-- Upsert key for posts synced from external platforms (IG media id).
-- Plain unique index: Postgres allows multiple NULLs, and PostgREST's
-- ON CONFLICT (external_id) needs a full (non-partial) unique index.
alter table social_posts add column if not exists external_id text;
create unique index if not exists social_posts_external_id_key on social_posts (external_id);
