comment on column user_profiles.user_preferences is
  'Application preferences. The pin_key JSON property is a compatibility slot that stores only a bcrypt parent PIN hash, never plaintext.';

update user_profiles
set user_preferences = user_preferences || jsonb_build_object('pin_key', NULL)
where user_preferences ? 'pin_key'
  and user_preferences->>'pin_key' is not null
  and user_preferences->>'pin_key' not like '$2%$%';
