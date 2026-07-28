alter table user_sessions
  add column if not exists expires_at timestamp with time zone,
  add column if not exists revoked_at timestamp with time zone,
  add column if not exists last_used_at timestamp with time zone;

update user_sessions
set expires_at = created_at + interval '7 days'
where expires_at is null;

alter table user_sessions
  alter column expires_at set not null;

create index if not exists user_sessions_active_token_idx
  on user_sessions (token_id)
  where revoked_at is null;

create index if not exists user_sessions_user_active_idx
  on user_sessions (user_id, expires_at)
  where revoked_at is null;

create index if not exists password_reset_tokens_active_idx
  on password_reset_tokens (token, expires_at)
  where used_at is null;
