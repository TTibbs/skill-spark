insert into user_profiles (id, username, display_name, email, profile_image_url, password_hash, is_parent, total_children, timezone, user_preferences) values
  (1, 'alice123', 'Alice', 'alice@example.com', '', '$2b$10$PK1uN99FbQuSoywHymLd.eJjTA/tGE5WOY3qkd9iF3f1NDuXPrKhm', true, 2, 'Europe/London', '{"notificationsEnabled": true, "theme": "system", "language": "en", "pin_key": "$2b$10$9g6OekWGPb4MgxjlszpN9uQReFcE4g2.t02AABxAFOW1JLA0tzEPu"}');

insert into child_profiles (id, user_id, name, age, xp, level, reward_points, last_played) values
  (1, 1, 'Emma', 6, 120, 2, 25, now()),
  (2, 1, 'Liam', 4, 35, 1, 10, now());

insert into word_categories (id, name) values
  (1, 'Animals'),
  (2, 'Food');

insert into words (word_id, word, image, category) values
  (1, 'cat', 'https://example.test/cat.png', 'Animals'),
  (2, 'dog', 'https://example.test/dog.png', 'Animals'),
  (3, 'apple', 'https://example.test/apple.png', 'Food');

insert into shapes (id, name, description, image) values
  (1, 'Circle', 'A round shape', 'https://example.test/circle.png'),
  (2, 'Square', 'A four-sided shape', 'https://example.test/square.png');

insert into user_chore_categories (id, user_id, name, description) values
  (1, 1, 'Morning', 'Morning routine chores'),
  (2, 1, 'Bedroom', 'Bedroom tidy-up chores');

insert into chores (id, title, description, category, xp, reward_points, user_id) values
  (1, 'Make the bed', 'Pull up the covers and arrange pillows.', 'Bedroom', 10, 2, 1),
  (2, 'Brush teeth', 'Brush teeth after breakfast.', 'Morning', 5, 1, 1),
  (3, 'Pack school bag', 'Put homework and lunch into the school bag.', 'Morning', 8, 2, 1),
  (4, 'Put books away', 'Return books neatly to the shelf.', 'Bedroom', 6, 1, 1);

insert into assigned_chores (
  id,
  chore_id,
  child_id,
  status,
  submitted_at,
  reviewed_at,
  reviewed_by,
  rejection_reason,
  assigned_xp_reward,
  assigned_reward_points,
  awarded_xp,
  awarded_reward_points,
  is_completed,
  completed_at,
  last_completed_at,
  total_xp_earned
) values
  (1, 1, 1, 'assigned', null, null, null, null, 10, 2, 0, 0, false, null, null, 0),
  (2, 2, 1, 'submitted', now(), null, null, null, 5, 1, 0, 0, false, null, null, 0),
  (3, 3, 1, 'approved', now() - interval '2 days', now() - interval '1 day', 1, null, 8, 2, 8, 2, true, now() - interval '1 day', now() - interval '1 day', 8),
  (4, 4, 2, 'rejected', now() - interval '1 day', now(), 1, 'Please put every book back on the shelf.', 6, 1, 0, 0, false, null, null, 0);

insert into chore_completion_history (assigned_chore_id, xp_earned)
values (3, 8);

insert into achievements (id, title, description, criteria, required_value, xp_reward, points_reward, is_active, image_url, category, is_special) values
  (1, 'First Word', 'Complete one spelling activity.', 'spelling_games_completed', 1, 25, 5, true, null, 'spelling', false),
  (2, 'Math Starter', 'Complete one maths activity.', 'math_games_completed', 1, 25, 5, true, null, 'math', false);

insert into premium_rewards (id, title, description, points_required, is_active, category, does_expire, duration_days) values
  (1, 'Extra story time', 'A fictional local reward for development.', 30, true, 'activity', false, 0);

insert into family_rewards (id, user_id, title, description, star_cost, is_active) values
  (1, 1, 'Choose movie night', 'Pick the family film for the evening.', 20, true),
  (2, 1, 'Extra story time', 'Add one extra story before bed.', 12, true),
  (3, 1, 'Weekend park trip', 'Choose a local park for a weekend visit.', 35, true),
  (4, 1, 'Archived test reward', 'A hidden local reward.', 5, false);

insert into reward_redemptions (
  id,
  reward_id,
  child_id,
  user_id,
  status,
  reward_title,
  reward_description,
  star_cost,
  requested_at,
  reviewed_at,
  reviewed_by,
  rejection_reason,
  refunded_at
) values
  (1, 1, 1, 1, 'requested', 'Choose movie night', 'Pick the family film for the evening.', 20, now(), null, null, null, null),
  (2, 2, 1, 1, 'approved', 'Extra story time', 'Add one extra story before bed.', 12, now() - interval '2 days', now() - interval '1 day', 1, null, null),
  (3, 3, 2, 1, 'rejected', 'Weekend park trip', 'Choose a local park for a weekend visit.', 35, now() - interval '3 days', now() - interval '2 days', 1, 'Let us save this for another weekend.', now() - interval '2 days');

insert into math_stats (child_id) values (1), (2);
insert into spelling_stats (child_id) values (1), (2);
insert into shape_stats (child_id) values (1), (2);
insert into memory_stats (child_id) values (1), (2);
insert into chore_stats (child_id) values (1), (2);

select setval('user_profiles_id_seq', (select max(id) from user_profiles));
select setval('child_profiles_id_seq', (select max(id) from child_profiles));
select setval('word_categories_id_seq', (select max(id) from word_categories));
select setval('words_word_id_seq', (select max(word_id) from words));
select setval('shapes_id_seq', (select max(id) from shapes));
select setval('user_chore_categories_id_seq', (select max(id) from user_chore_categories));
select setval('chores_id_seq', (select max(id) from chores));
select setval('assigned_chores_id_seq', (select max(id) from assigned_chores));
select setval('chore_completion_history_id_seq', (select max(id) from chore_completion_history));
select setval('achievements_id_seq', (select max(id) from achievements));
select setval('premium_rewards_id_seq', (select max(id) from premium_rewards));
select setval('family_rewards_id_seq', (select max(id) from family_rewards));
select setval('reward_redemptions_id_seq', (select max(id) from reward_redemptions));
