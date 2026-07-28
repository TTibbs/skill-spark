create table family_rewards (
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

create table reward_redemptions (
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

create index idx_family_rewards_user_id on family_rewards(user_id);
create index idx_family_rewards_active on family_rewards(user_id, is_active)
where archived_at is null;
create index idx_reward_redemptions_child_status
on reward_redemptions(child_id, status);
create index idx_reward_redemptions_user_status
on reward_redemptions(user_id, status);

create unique index idx_reward_redemptions_one_requested_per_reward
on reward_redemptions(reward_id, child_id)
where status = 'requested' and reward_id is not null;
