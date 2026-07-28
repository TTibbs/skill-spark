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
  alter column assigned_reward_points set default 0,
  add constraint assigned_chores_status_check
    check (status in ('assigned', 'submitted', 'approved', 'rejected'));

create unique index assigned_chores_unique_active
on assigned_chores (chore_id, child_id)
where status in ('assigned', 'submitted', 'rejected');

create index idx_assigned_chores_child_status
on assigned_chores (child_id, status);
