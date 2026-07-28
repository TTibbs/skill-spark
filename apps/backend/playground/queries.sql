\c gamified_learning_test;

EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
WITH child_stats AS (
        SELECT
          COALESCE((s.stats->>'total_learned_words')::int, 0)   AS spelling_total,
          COALESCE((m.stats->>'totalProblems')::int, 0)         AS math_total,
          COALESCE((sh.stats->>'totalCorrectShapes')::int, 0)   AS shapes_total,
          COALESCE((mem.stats->>'totalGames')::int, 0)          AS memory_total,
          COALESCE((c.stats->>'total_completed')::int, 0)       AS chores_total
        FROM (VALUES (1::int)) AS v(child_id)
        LEFT JOIN spelling_stats s  ON s.child_id  = v.child_id
        LEFT JOIN math_stats     m  ON m.child_id  = v.child_id
        LEFT JOIN shape_stats    sh ON sh.child_id = v.child_id
        LEFT JOIN memory_stats   mem ON mem.child_id= v.child_id
        LEFT JOIN chore_stats    c  ON c.child_id  = v.child_id
      )
      SELECT
        r.id,
        r.title,
        r.description,
        r.criteria,
        r.required_value,
        r.xp_reward,
        r.points_reward,
        r.image_url,
        r.category,
        (cs.spelling_total >= r.required_value AND r.category = 'spelling')
         OR (cs.math_total     >= r.required_value AND r.category = 'math')
         OR (cs.shapes_total   >= r.required_value AND r.category = 'shapes')
         OR (cs.memory_total   >= r.required_value AND r.category = 'memory')
         OR (cs.chores_total   >= r.required_value AND r.category = 'chores')
          AS is_achieved,
        r.created_at,
        r.updated_at
      FROM achievements r
      CROSS JOIN child_stats cs
      WHERE r.is_active
        AND (
          (r.category = 'spelling' AND cs.spelling_total >= r.required_value) OR
          (r.category = 'math'     AND cs.math_total     >= r.required_value) OR
          (r.category = 'shapes'   AND cs.shapes_total   >= r.required_value) OR
          (r.category = 'memory'   AND cs.memory_total   >= r.required_value) OR
          (r.category = 'chores'   AND cs.chores_total   >= r.required_value)
        )
      ORDER BY r.category, r.id;