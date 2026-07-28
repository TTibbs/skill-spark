create table game_result_submissions (
  id serial primary key,
  child_id integer not null references child_profiles(id) on delete cascade,
  game_type text not null check (game_type in ('math', 'memory', 'spelling')),
  session_id text not null,
  response jsonb,
  created_at timestamp with time zone default now(),
  completed_at timestamp with time zone,
  unique(child_id, game_type, session_id)
);

create index idx_game_result_submissions_child_id on game_result_submissions(child_id);
