import db from "../db/connection";

export const getAchievementQueryCost = async (childId: number) => {
  const query = `
      WITH child_stats AS (
        SELECT
          COALESCE((s.stats->>'total_learned_words')::int, 0)   AS spelling_total,
          COALESCE((m.stats->>'totalProblems')::int, 0)         AS math_total,
          COALESCE((sh.stats->>'totalCorrectShapes')::int, 0)   AS shapes_total,
          COALESCE((mem.stats->>'totalGames')::int, 0)          AS memory_total,
          COALESCE((c.stats->>'total_completed')::int, 0)       AS chores_total
        FROM (VALUES ($1::int)) AS v(child_id)
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
    `;

  const explainQuery = `EXPLAIN (
  ANALYZE,
  BUFFERS,
  FORMAT JSON
) ${query}`;

  try {
    const explainRes = await db.query(explainQuery, [childId]);
    const rows = explainRes.rows as any[];
    const plan = rows[0]["QUERY PLAN"][0] as any;
    const cost = plan.Plan["Total Cost"];
    console.log("Postgres cost estimate:", cost);
    console.log("Full query plan:", JSON.stringify(plan, null, 2));
    return cost;
  } catch (err) {
    console.error("Error running EXPLAIN:", err);
    throw err;
  }
};

export const getAchievementQueryCostOptimized = async (childId: number) => {
  const query = `
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
        (COALESCE((cp.stats->'spelling'->>'total_learned_words')::int, 0) >= r.required_value AND r.category = 'spelling')
         OR (COALESCE((cp.stats->'math'->>'totalProblems')::int, 0) >= r.required_value AND r.category = 'math')
         OR (COALESCE((cp.stats->'shapes'->>'totalCorrectShapes')::int, 0) >= r.required_value AND r.category = 'shapes')
         OR (COALESCE((cp.stats->'memory'->>'totalGames')::int, 0) >= r.required_value AND r.category = 'memory')
         OR (COALESCE((cp.stats->'chores'->>'total_completed')::int, 0) >= r.required_value AND r.category = 'chores')
          AS is_achieved,
        r.created_at,
        r.updated_at
      FROM achievements r
      CROSS JOIN (SELECT stats FROM child_profiles WHERE id = $1) cp
      WHERE r.is_active
        AND (
          (r.category = 'spelling' AND COALESCE((cp.stats->'spelling'->>'total_learned_words')::int, 0) >= r.required_value) OR
          (r.category = 'math'     AND COALESCE((cp.stats->'math'->>'totalProblems')::int, 0) >= r.required_value) OR
          (r.category = 'shapes'   AND COALESCE((cp.stats->'shapes'->>'totalCorrectShapes')::int, 0) >= r.required_value) OR
          (r.category = 'memory'   AND COALESCE((cp.stats->'memory'->>'totalGames')::int, 0) >= r.required_value) OR
          (r.category = 'chores'   AND COALESCE((cp.stats->'chores'->>'total_completed')::int, 0) >= r.required_value)
        )
      ORDER BY r.category, r.id;
    `;

  const explainQuery = `EXPLAIN (
  ANALYZE,
  BUFFERS,
  FORMAT JSON
) ${query}`;

  try {
    const explainRes = await db.query(explainQuery, [childId]);
    const rows = explainRes.rows as any[];
    const plan = rows[0]["QUERY PLAN"][0] as any;
    const cost = plan.Plan["Total Cost"];
    console.log("Optimized Postgres cost estimate:", cost);
    console.log("Optimized full query plan:", JSON.stringify(plan, null, 2));
    return cost;
  } catch (err) {
    console.error("Error running optimized EXPLAIN:", err);
    throw err;
  }
};

export const compareQueryPerformance = async (childId: number) => {
  console.log("=== Query Performance Comparison ===");
  console.log(`Testing with child ID: ${childId}`);
  console.log();

  try {
    console.log("1. Original query with multiple LEFT JOINs:");
    const originalCost = await getAchievementQueryCost(childId);
    console.log(`   Cost: ${originalCost}`);
    console.log();

    console.log("2. Optimized query with consolidated stats:");
    const optimizedCost = await getAchievementQueryCostOptimized(childId);
    console.log(`   Cost: ${optimizedCost}`);
    console.log();

    const improvement = (
      ((originalCost - optimizedCost) / originalCost) *
      100
    ).toFixed(2);
    console.log(`Performance improvement: ${improvement}%`);

    if (optimizedCost < originalCost) {
      console.log("✅ Optimized query is faster!");
    } else {
      console.log(
        "❌ Original query is faster (this might indicate missing indexes)"
      );
    }
  } catch (err) {
    console.error("Error comparing queries:", err);
  }
};
