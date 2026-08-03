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

create table if not exists game_result_submissions (
  id serial primary key,
  child_id integer not null references child_profiles(id) on delete cascade,
  game_type text not null,
  session_id text not null,
  response jsonb,
  created_at timestamp with time zone default now(),
  completed_at timestamp with time zone,
  unique(child_id, game_type, session_id)
);

create index if not exists idx_game_result_submissions_child_id
  on game_result_submissions(child_id);

alter table game_result_submissions
  drop constraint if exists game_result_submissions_game_type_check;

alter table game_result_submissions
  add constraint game_result_submissions_game_type_check
  check (game_type in ('math', 'memory', 'spelling', 'shapes'));

alter table chores
  add column if not exists reward_points integer not null default 0;

drop index if exists assigned_chores_unique_incomplete;

alter table assigned_chores
  add column if not exists status text,
  add column if not exists submitted_at timestamp with time zone,
  add column if not exists reviewed_at timestamp with time zone,
  add column if not exists reviewed_by integer references user_profiles(id) on delete set null,
  add column if not exists rejection_reason text,
  add column if not exists assigned_xp_reward integer,
  add column if not exists assigned_reward_points integer,
  add column if not exists awarded_xp integer not null default 0,
  add column if not exists awarded_reward_points integer not null default 0;

update assigned_chores ac
set
  status = case when ac.is_completed then 'approved' else 'assigned' end,
  submitted_at = case when ac.is_completed then coalesce(ac.completed_at, ac.last_completed_at, ac.updated_at) else ac.submitted_at end,
  reviewed_at = case when ac.is_completed then coalesce(ac.completed_at, ac.last_completed_at, ac.updated_at) else ac.reviewed_at end,
  assigned_xp_reward = coalesce(ac.assigned_xp_reward, c.xp, 0),
  assigned_reward_points = coalesce(ac.assigned_reward_points, c.reward_points, 0),
  awarded_xp = case when ac.is_completed then coalesce(nullif(ac.total_xp_earned, 0), c.xp, 0) else ac.awarded_xp end,
  awarded_reward_points = case when ac.is_completed then coalesce(ac.awarded_reward_points, c.reward_points, 0) else ac.awarded_reward_points end
from chores c
where c.id = ac.chore_id;

alter table assigned_chores
  alter column status set not null,
  alter column status set default 'assigned',
  alter column assigned_xp_reward set not null,
  alter column assigned_xp_reward set default 0,
  alter column assigned_reward_points set not null,
  alter column assigned_reward_points set default 0;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'assigned_chores_status_check'
      and conrelid = 'assigned_chores'::regclass
  ) then
    alter table assigned_chores
      add constraint assigned_chores_status_check
      check (status in ('assigned', 'submitted', 'approved', 'rejected'));
  end if;
end $$;

create unique index if not exists assigned_chores_unique_active
  on assigned_chores (chore_id, child_id)
  where status in ('assigned', 'submitted', 'rejected');

create index if not exists idx_assigned_chores_child_status
  on assigned_chores (child_id, status);

create table if not exists family_rewards (
  id serial primary key,
  user_id integer not null references user_profiles(id) on delete cascade,
  title text not null,
  description text,
  star_cost integer not null check (star_cost > 0),
  image_url text,
  is_active boolean not null default true,
  archived_at timestamp with time zone,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

alter table family_rewards
  add column if not exists user_id integer references user_profiles(id) on delete cascade,
  add column if not exists title text,
  add column if not exists description text,
  add column if not exists star_cost integer,
  add column if not exists image_url text,
  add column if not exists is_active boolean not null default true,
  add column if not exists archived_at timestamp with time zone,
  add column if not exists created_at timestamp with time zone not null default now(),
  add column if not exists updated_at timestamp with time zone not null default now();

create table if not exists reward_redemptions (
  id serial primary key,
  reward_id integer references family_rewards(id) on delete set null,
  child_id integer not null references child_profiles(id) on delete cascade,
  user_id integer not null references user_profiles(id) on delete cascade,
  status text not null default 'requested'
    check (status in ('requested', 'approved', 'rejected', 'cancelled')),
  reward_title text not null,
  reward_description text,
  star_cost integer not null check (star_cost > 0),
  requested_at timestamp with time zone not null default now(),
  reviewed_at timestamp with time zone,
  reviewed_by integer references user_profiles(id) on delete set null,
  cancelled_at timestamp with time zone,
  rejection_reason text,
  refunded_at timestamp with time zone,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create index if not exists idx_family_rewards_user_id
  on family_rewards(user_id);

create index if not exists idx_family_rewards_active
  on family_rewards(user_id, is_active)
  where archived_at is null;

create index if not exists idx_reward_redemptions_child_status
  on reward_redemptions(child_id, status);

create index if not exists idx_reward_redemptions_user_status
  on reward_redemptions(user_id, status);

create unique index if not exists idx_reward_redemptions_one_requested_per_reward
  on reward_redemptions(reward_id, child_id)
  where status = 'requested' and reward_id is not null;

alter table child_profiles
  add column if not exists archived_at timestamp with time zone;

create index if not exists idx_child_profiles_active_user_id
  on child_profiles(user_id)
  where archived_at is null;
