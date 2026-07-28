alter table game_result_submissions
drop constraint game_result_submissions_game_type_check;

alter table game_result_submissions
add constraint game_result_submissions_game_type_check
check (game_type in ('math', 'memory', 'spelling', 'shapes'));
