alter table child_profiles
add column archived_at timestamp with time zone;

create index idx_child_profiles_active_user_id
on child_profiles(user_id)
where archived_at is null;
