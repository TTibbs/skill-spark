create table user_profiles (
  id serial primary key,
  username text not null unique,
  display_name text not null,
  email text not null unique,
  profile_image_url text,
  password_hash text not null,
  is_parent boolean default false,
  total_children integer default 0,
  timezone text default 'GMT',
  user_preferences jsonb default '{"notificationsEnabled": false, "theme": "system", "language": "en", "pin_key": null}',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table user_sessions (
  id serial primary key,
  user_id integer references user_profiles(id) on delete cascade,
  token_id text not null unique,
  created_at timestamp with time zone default now()
);

create table password_reset_tokens (
  id serial primary key,
  user_id integer references user_profiles(id) on delete cascade,
  token text not null unique,
  expires_at timestamp with time zone not null,
  used_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

create table child_profiles (
  id serial primary key,
  user_id integer references user_profiles(id) on delete cascade,
  name text not null,
  age integer default 0,
  xp integer default 0,
  level integer default 1,
  reward_points integer default 0,
  last_played timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table premium_rewards (
  id serial primary key,
  title text not null,
  description text,
  points_required integer not null,
  is_active boolean default true,
  category text not null,
  does_expire boolean default false,
  duration_days integer default 0
);

create table premium_reward_purchases (
  id serial primary key,
  user_id integer references user_profiles(id) on delete cascade,
  child_id integer references child_profiles(id) on delete cascade,
  reward_id integer references premium_rewards(id) on delete cascade,
  purchase_date timestamp with time zone default now(),
  is_activated boolean default false,
  expiry_date timestamp with time zone
);

create table achievements (
  id serial primary key,
  title text not null,
  description text,
  criteria text not null,
  required_value integer default 0,
  xp_reward integer default 0,
  points_reward integer default 0,
  is_active boolean default true,
  image_url text,
  category text not null,
  is_special boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table completed_achievements (
  id serial primary key,
  child_id integer references child_profiles(id) on delete cascade,
  achievement_id integer references achievements(id) on delete cascade,
  completed_at timestamp with time zone default now(),
  unique(child_id, achievement_id)
);

create table shapes (
  id serial primary key,
  name varchar(255) not null unique,
  description text,
  image text
);

create table user_chore_categories (
  id serial primary key,
  user_id integer not null references user_profiles(id) on delete cascade,
  name varchar(255) not null,
  description text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id, name)
);

create table chores (
  id serial primary key,
  title text not null,
  description text,
  category varchar(255) not null,
  xp integer default 0,
  user_id integer not null references user_profiles(id) on delete cascade,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table assigned_chores (
  id serial primary key,
  chore_id integer references chores(id) on delete cascade,
  child_id integer references child_profiles(id) on delete cascade,
  assigned_at timestamp with time zone default now(),
  completed_at timestamp with time zone,
  is_completed boolean default false,
  completion_count integer default 0,
  last_completed_at timestamp with time zone,
  total_xp_earned integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create unique index assigned_chores_unique_incomplete
on assigned_chores (chore_id, child_id)
where is_completed = false;

create table chore_completion_history (
  id serial primary key,
  assigned_chore_id integer references assigned_chores(id) on delete cascade,
  completed_at timestamp with time zone default now(),
  xp_earned integer not null,
  created_at timestamp with time zone default now()
);

create table word_categories (
  id serial primary key,
  name varchar(255) not null unique,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table words (
  word_id serial primary key,
  word text not null,
  image text,
  category varchar(255) not null references word_categories(name) on delete cascade,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(word, category)
);

create table learned_words (
  id serial primary key,
  word_id integer references words(word_id) on delete cascade,
  word text not null,
  image text,
  category varchar(255) not null references word_categories(name) on delete cascade,
  learned_at timestamp with time zone default now(),
  times_learned integer default 0,
  child_id integer references child_profiles(id) on delete cascade,
  unique(word_id, child_id)
);

create table math_stats (
  stats jsonb not null default '{"totalGames": 0, "totalProblems": 0, "correctAnswers": 0, "incorrectAnswers": 0, "overallAccuracy": 0, "addition": {"correct": 0, "incorrect": 0, "accuracy": 0}, "subtraction": {"correct": 0, "incorrect": 0, "accuracy": 0}, "multiplication": {"correct": 0, "incorrect": 0, "accuracy": 0}, "division": {"correct": 0, "incorrect": 0, "accuracy": 0}, "counting": {"correct": 0, "incorrect": 0, "accuracy": 0}}',
  child_id integer references child_profiles(id) on delete cascade,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(child_id)
);

create table spelling_stats (
  stats jsonb not null default '{"totalGames": 0, "total_learned_words": 0, "total_hints_used": 0, "total_correct_guesses": 0, "total_incorrect_guesses": 0, "accuracy": 0}',
  child_id integer references child_profiles(id) on delete cascade,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(child_id)
);

create table shape_stats (
  child_id integer references child_profiles(id) on delete cascade,
  stats jsonb not null default '{"totalGames": 0, "totalShapes": 0, "totalCorrectShapes": 0, "totalIncorrectShapes": 0, "overallAccuracy": 0, "totalTimeSecs": 0, "bestTimeSecs": 0}',
  updated_at timestamp with time zone default now(),
  unique(child_id)
);

create table memory_stats (
  child_id integer references child_profiles(id) on delete cascade,
  stats jsonb not null default '{"totalGames": 0, "totalMoves": 0, "totalTimeSecs": 0, "bestTimeSecs": 0, "fewestMoves": 0, "picture": {"gamesPlayed": 0, "totalMoves": 0, "totalTimeSecs": 0, "bestTimeSecs": 0, "fewestMoves": 0}, "sound": {"gamesPlayed": 0, "totalMoves": 0, "totalTimeSecs": 0, "bestTimeSecs": 0, "fewestMoves": 0}}',
  updated_at timestamp with time zone default now(),
  unique(child_id)
);

create table chore_stats (
  child_id integer references child_profiles(id) on delete cascade,
  stats jsonb not null default '{"total_completed": 0, "total_xp_earned": 0, "daily_completed": 0, "weekly_completed": 0, "monthly_completed": 0, "streak_days": 0, "longest_streak": 0}',
  updated_at timestamp with time zone default now(),
  unique(child_id)
);

create index idx_spelling_stats_child_id on spelling_stats(child_id);
create index idx_math_stats_child_id on math_stats(child_id);
create index idx_shape_stats_child_id on shape_stats(child_id);
create index idx_memory_stats_child_id on memory_stats(child_id);
create index idx_chore_stats_child_id on chore_stats(child_id);
create index idx_learned_words_child_id on learned_words(child_id);
create index idx_learned_words_word_id_child_id on learned_words(word_id, child_id);
create index idx_chores_user_id on chores(user_id);
create index idx_assigned_chores_chore_id on assigned_chores(chore_id);
create index idx_assigned_chores_child_id on assigned_chores(child_id);
create index idx_assigned_chores_child_id_completed on assigned_chores(child_id, is_completed);
create index idx_chore_completion_history_assigned_chore_id on chore_completion_history(assigned_chore_id);
create index idx_active_achievements_cat_id on achievements(category, id) where is_active;
create index idx_completed_achievements_child_id on completed_achievements(child_id);
create index idx_completed_achievements_achievement_id on completed_achievements(achievement_id);
create index idx_premium_reward_purchases_child_id on premium_reward_purchases(child_id);
create index idx_premium_reward_purchases_reward_id on premium_reward_purchases(reward_id);
create index idx_premium_reward_purchases_child_id_activated on premium_reward_purchases(child_id, is_activated);
create index idx_user_sessions_user_id on user_sessions(user_id);
create index idx_user_sessions_token_id on user_sessions(token_id);
create index idx_user_sessions_created_at on user_sessions(created_at);
create index idx_password_reset_tokens_token on password_reset_tokens(token);
create index idx_password_reset_tokens_user_id on password_reset_tokens(user_id);
create index idx_password_reset_tokens_expires_at on password_reset_tokens(expires_at);
create index idx_child_profiles_user_id on child_profiles(user_id);
create index idx_words_category on words(category);
create index idx_chores_category on chores(category);
create index idx_premium_rewards_is_active on premium_rewards(is_active);
