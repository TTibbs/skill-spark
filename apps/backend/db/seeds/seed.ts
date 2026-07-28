import db from "../connection";
import format from "pg-format";
import {
  SeedData,
  UserSession,
  MemoryStats,
  PremiumReward,
  Achievement,
  ShapeStats,
  SpellingStats,
  MathStats,
  LearnedWord,
  Word,
  ChildProfile,
  WordCategory,
  Shape,
  ChoreStats,
} from "../../types";
import { userSessions } from "../../db/data/test-data/user-sessions";

const seed = async ({
  users,
  childProfiles,
  learnedWords,
  mathStats,
  spellingStats,
  shapeStats,
  memoryStats,
  achievements,
  wordCategories,
  words,
  premiumRewards,
  shapes,
  choreStats,
}: SeedData) => {
  try {
    // Drop existing tables
    await db.query(`
      DROP TABLE IF EXISTS completed_achievements CASCADE;
      DROP TABLE IF EXISTS achievement_progress CASCADE;
      DROP TABLE IF EXISTS chore_stats CASCADE;
      DROP TABLE IF EXISTS memory_stats CASCADE;
      DROP TABLE IF EXISTS shape_stats CASCADE;
      DROP TABLE IF EXISTS math_stats CASCADE;
      DROP TABLE IF EXISTS spelling_stats CASCADE;
      DROP TABLE IF EXISTS game_result_submissions CASCADE;
      DROP TABLE IF EXISTS learned_words CASCADE;
      DROP TABLE IF EXISTS words CASCADE;
      DROP TABLE IF EXISTS word_categories CASCADE;
      DROP TABLE IF EXISTS chore_completion_history CASCADE;
      DROP TABLE IF EXISTS assigned_chores CASCADE;
      DROP TABLE IF EXISTS chores CASCADE;
      DROP TABLE IF EXISTS user_chore_categories CASCADE;
      DROP TABLE IF EXISTS shapes CASCADE;
      DROP TABLE IF EXISTS achievements CASCADE;
      DROP TABLE IF EXISTS reward_redemptions CASCADE;
      DROP TABLE IF EXISTS family_rewards CASCADE;
      DROP TABLE IF EXISTS premium_reward_purchases CASCADE;
      DROP TABLE IF EXISTS premium_rewards CASCADE;
      DROP TABLE IF EXISTS child_profiles CASCADE;
      DROP TABLE IF EXISTS password_reset_tokens CASCADE;
      DROP TABLE IF EXISTS user_profiles CASCADE;
      DROP TABLE IF EXISTS user_sessions CASCADE;

    `);

    // Create tables
    await db.query(`
      -- Create user_profiles table
      CREATE TABLE user_profiles (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        display_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        profile_image_url TEXT,
        password_hash TEXT NOT NULL,
        is_parent BOOLEAN DEFAULT false,
        total_children INTEGER DEFAULT 0,
        timezone TEXT DEFAULT 'GMT',
        user_preferences JSONB DEFAULT '{
          "notificationsEnabled": false,
          "theme": "system",
          "language": "en",
          "pin_key": null
        }',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create user_sessions table
      CREATE TABLE user_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES user_profiles(id) ON DELETE CASCADE,
        token_id TEXT NOT NULL UNIQUE,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
        revoked_at TIMESTAMP WITH TIME ZONE,
        last_used_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create password_reset_tokens table
      CREATE TABLE password_reset_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES user_profiles(id) ON DELETE CASCADE,
        token TEXT NOT NULL UNIQUE,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        used_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create child_profiles table
      CREATE TABLE child_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES user_profiles(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        age INTEGER DEFAULT 0,
        xp INTEGER DEFAULT 0,
        level INTEGER DEFAULT 1,
        reward_points INTEGER DEFAULT 0,
        last_played TIMESTAMP WITH TIME ZONE,
        archived_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE game_result_submissions (
        id SERIAL PRIMARY KEY,
        child_id INTEGER NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
        game_type TEXT NOT NULL CHECK (game_type IN ('math', 'memory', 'spelling', 'shapes')),
        session_id TEXT NOT NULL,
        response JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        completed_at TIMESTAMP WITH TIME ZONE,
        UNIQUE(child_id, game_type, session_id)
      );

      -- Create premium_rewards table
      CREATE TABLE premium_rewards (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        points_required INTEGER NOT NULL,
        is_active BOOLEAN DEFAULT true,
        category TEXT NOT NULL,
        does_expire BOOLEAN DEFAULT false,
        duration_days INTEGER DEFAULT 0
      );

      -- Create premium_reward_purchases table to track purchases
      CREATE TABLE premium_reward_purchases (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES user_profiles(id) ON DELETE CASCADE,
        child_id INTEGER REFERENCES child_profiles(id) ON DELETE CASCADE,
        reward_id INTEGER REFERENCES premium_rewards(id) ON DELETE CASCADE,
        purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        is_activated BOOLEAN DEFAULT false,
        expiry_date TIMESTAMP WITH TIME ZONE
      );

      CREATE TABLE family_rewards (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        star_cost INTEGER NOT NULL CHECK (star_cost > 0),
        image_url TEXT,
        is_active BOOLEAN NOT NULL DEFAULT true,
        archived_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );

      CREATE TABLE reward_redemptions (
        id SERIAL PRIMARY KEY,
        reward_id INTEGER REFERENCES family_rewards(id) ON DELETE SET NULL,
        child_id INTEGER NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
        status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'approved', 'rejected', 'cancelled')),
        reward_title TEXT NOT NULL,
        reward_description TEXT,
        star_cost INTEGER NOT NULL CHECK (star_cost > 0),
        requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        reviewed_at TIMESTAMP WITH TIME ZONE,
        reviewed_by INTEGER REFERENCES user_profiles(id) ON DELETE SET NULL,
        cancelled_at TIMESTAMP WITH TIME ZONE,
        rejection_reason TEXT,
        refunded_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );

      CREATE UNIQUE INDEX idx_reward_redemptions_one_requested_per_reward
        ON reward_redemptions(reward_id, child_id)
        WHERE status = 'requested' AND reward_id IS NOT NULL;

      -- Create achievements table (global achievements, not child-specific)
      CREATE TABLE achievements (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        criteria TEXT NOT NULL,
        required_value INTEGER DEFAULT 0,
        xp_reward INTEGER DEFAULT 0,
        points_reward INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        image_url TEXT,
        category TEXT NOT NULL,
        is_special BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create completed_achievements table to track which achievements each child has completed
      CREATE TABLE completed_achievements (
        id SERIAL PRIMARY KEY,
        child_id INTEGER REFERENCES child_profiles(id) ON DELETE CASCADE,
        achievement_id INTEGER REFERENCES achievements(id) ON DELETE CASCADE,
        completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(child_id, achievement_id)
      );

      -- Create shapes table
      CREATE TABLE shapes (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        image TEXT
      );

      -- Create user_chore_categories table for user-specific categories
      CREATE TABLE user_chore_categories (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, name)
      );

      -- Create chores table
      CREATE TABLE chores (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        category VARCHAR(255) NOT NULL,
        xp INTEGER DEFAULT 0,
        reward_points INTEGER DEFAULT 0,
        user_id INTEGER NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create assigned_chores table to track chores assigned to children and their completion status
      CREATE TABLE assigned_chores (
        id SERIAL PRIMARY KEY,
        chore_id INTEGER REFERENCES chores(id) ON DELETE CASCADE,
        child_id INTEGER REFERENCES child_profiles(id) ON DELETE CASCADE,
        assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        completed_at TIMESTAMP WITH TIME ZONE,
        is_completed BOOLEAN DEFAULT false,
        completion_count INTEGER DEFAULT 0,
        last_completed_at TIMESTAMP WITH TIME ZONE,
        total_xp_earned INTEGER DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'submitted', 'approved', 'rejected')),
        submitted_at TIMESTAMP WITH TIME ZONE,
        reviewed_at TIMESTAMP WITH TIME ZONE,
        reviewed_by INTEGER REFERENCES user_profiles(id) ON DELETE SET NULL,
        rejection_reason TEXT,
        assigned_xp_reward INTEGER NOT NULL DEFAULT 0,
        assigned_reward_points INTEGER NOT NULL DEFAULT 0,
        awarded_xp INTEGER NOT NULL DEFAULT 0,
        awarded_reward_points INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create partial unique constraint: only one active assignment per chore/child
      CREATE UNIQUE INDEX assigned_chores_unique_active 
      ON assigned_chores (chore_id, child_id) 
      WHERE status IN ('assigned', 'submitted', 'rejected');

      -- Create chore_completion_history table to track completion history
      CREATE TABLE chore_completion_history (
        id SERIAL PRIMARY KEY,
        assigned_chore_id INTEGER REFERENCES assigned_chores(id) ON DELETE CASCADE,
        completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        xp_earned INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create word_categories table
      CREATE TABLE word_categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create words table
      CREATE TABLE words (
        word_id SERIAL PRIMARY KEY,
        word TEXT NOT NULL,
        image TEXT,
        category VARCHAR(255) NOT NULL REFERENCES word_categories(name) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(word, category)
      );

      -- Create learned_words table
      CREATE TABLE learned_words (
        id SERIAL PRIMARY KEY,
        word_id INTEGER REFERENCES words(word_id) ON DELETE CASCADE,
        word TEXT NOT NULL,
        image TEXT,
        category VARCHAR(255) NOT NULL REFERENCES word_categories(name) ON DELETE CASCADE,
        learned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        times_learned INTEGER DEFAULT 0,
        child_id INTEGER REFERENCES child_profiles(id) ON DELETE CASCADE,
        UNIQUE(word_id, child_id)
      );

      -- Create math_stats table
      CREATE TABLE math_stats (
        stats JSONB NOT NULL DEFAULT '{
          "totalGames": 0,
          "totalProblems": 0,
          "correctAnswers": 0,
          "incorrectAnswers": 0,
          "overallAccuracy": 0,
          "addition": {
            "correct": 0,
            "incorrect": 0,
            "accuracy": 0
          },
          "subtraction": {
            "correct": 0,
            "incorrect": 0,
            "accuracy": 0
          },
          "multiplication": {
            "correct": 0,
            "incorrect": 0,
            "accuracy": 0
          },
          "division": {
            "correct": 0,
            "incorrect": 0,
            "accuracy": 0
          },
          "counting": {
            "correct": 0,
            "incorrect": 0,
            "accuracy": 0
          }
        }',
        child_id INTEGER REFERENCES child_profiles(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(child_id)
      );

      -- Create spelling_stats table
      CREATE TABLE spelling_stats (
        stats JSONB NOT NULL DEFAULT '{
          "totalGames": 0,
          "total_learned_words": 0,
          "total_hints_used": 0,
          "total_correct_guesses": 0,
          "total_incorrect_guesses": 0,
          "accuracy": 0
        }',
        child_id INTEGER REFERENCES child_profiles(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(child_id)
      );

      -- Create shape_stats table
      CREATE TABLE shape_stats (
        child_id INTEGER REFERENCES child_profiles(id) ON DELETE CASCADE,
        stats JSONB NOT NULL DEFAULT '{
          "totalGames": 0,
          "totalShapes": 0,
          "totalCorrectShapes": 0,
          "totalIncorrectShapes": 0,
          "overallAccuracy": 0,
          "totalTimeSecs": 0,
          "bestTimeSecs": 0
        }',
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(child_id)
      );

      -- Create memory_stats table
      CREATE TABLE memory_stats (
        child_id INTEGER REFERENCES child_profiles(id) ON DELETE CASCADE,
        stats JSONB NOT NULL DEFAULT '{
          "totalGames": 0,
          "totalMoves": 0,
          "totalTimeSecs": 0,
          "bestTimeSecs": 0,
          "fewestMoves": 0,
          "picture": {
            "gamesPlayed": 0,
            "totalMoves": 0,
            "totalTimeSecs": 0,
            "bestTimeSecs": 0,
            "fewestMoves": 0
          },
          "sound": {
            "gamesPlayed": 0,
            "totalMoves": 0,
            "totalTimeSecs": 0,
            "bestTimeSecs": 0,
            "fewestMoves": 0
          }
        }',
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(child_id)
      );

      -- Create chore_stats table
      CREATE TABLE chore_stats (
        child_id INTEGER REFERENCES child_profiles(id) ON DELETE CASCADE,
        stats JSONB NOT NULL DEFAULT '{
          "total_completed": 0,
          "total_xp_earned": 0,
          "daily_completed": 0,
          "weekly_completed": 0,
          "monthly_completed": 0,
          "streak_days": 0,
          "longest_streak": 0
        }',
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(child_id)
      );

      -- Create indexes for better query performance
      -- Stats tables by child id
      CREATE INDEX IF NOT EXISTS idx_spelling_stats_child_id ON spelling_stats(child_id);
      CREATE INDEX IF NOT EXISTS idx_math_stats_child_id ON math_stats(child_id);
      CREATE INDEX IF NOT EXISTS idx_shape_stats_child_id ON shape_stats(child_id);
      CREATE INDEX IF NOT EXISTS idx_memory_stats_child_id ON memory_stats(child_id);
      CREATE INDEX IF NOT EXISTS idx_chore_stats_child_id ON chore_stats(child_id);
      -- Learned words
      CREATE INDEX IF NOT EXISTS idx_learned_words_child_id ON learned_words(child_id);
      CREATE INDEX IF NOT EXISTS idx_learned_words_word_id_child_id ON learned_words(word_id, child_id);
      -- Custom chore index
      CREATE INDEX IF NOT EXISTS idx_chores_user_id ON chores(user_id);
      -- Assigned and completed chores
      CREATE INDEX IF NOT EXISTS idx_assigned_chores_chore_id ON assigned_chores(chore_id);
      CREATE INDEX IF NOT EXISTS idx_assigned_chores_child_id ON assigned_chores(child_id);
      CREATE INDEX IF NOT EXISTS idx_assigned_chores_child_id_completed ON assigned_chores(child_id, is_completed);
      CREATE INDEX IF NOT EXISTS idx_chore_completion_history_assigned_chore_id ON chore_completion_history(assigned_chore_id);
      -- Achievements
      CREATE INDEX IF NOT EXISTS idx_active_achievements_cat_id ON achievements(category, id) WHERE is_active;
      CREATE INDEX IF NOT EXISTS idx_completed_achievements_child_id ON completed_achievements(child_id);
      CREATE INDEX IF NOT EXISTS idx_completed_achievements_achievement_id ON completed_achievements(achievement_id);
      -- Premium reward purchases
      CREATE INDEX IF NOT EXISTS idx_premium_reward_purchases_child_id ON premium_reward_purchases(child_id);
      CREATE INDEX IF NOT EXISTS idx_premium_reward_purchases_reward_id ON premium_reward_purchases(reward_id);
      CREATE INDEX IF NOT EXISTS idx_premium_reward_purchases_child_id_activated ON premium_reward_purchases(child_id, is_activated);
      -- User sessions
      CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_sessions_token_id ON user_sessions(token_id);
      CREATE INDEX IF NOT EXISTS idx_user_sessions_created_at ON user_sessions(created_at);
      CREATE INDEX IF NOT EXISTS idx_user_sessions_active_token ON user_sessions(token_id) WHERE revoked_at IS NULL;
      -- Password reset tokens
      CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
      CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
      CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);
      -- Child profiles
      CREATE INDEX IF NOT EXISTS idx_child_profiles_user_id ON child_profiles(user_id);
      CREATE INDEX IF NOT EXISTS idx_child_profiles_active_user_id ON child_profiles(user_id) WHERE archived_at IS NULL;
      CREATE INDEX IF NOT EXISTS idx_game_result_submissions_child_id ON game_result_submissions(child_id);
      -- Words by category
      CREATE INDEX IF NOT EXISTS idx_words_category ON words(category);
      -- Chores by category
      CREATE INDEX IF NOT EXISTS idx_chores_category ON chores(category);
      -- Premium rewards by active status
      CREATE INDEX IF NOT EXISTS idx_premium_rewards_is_active ON premium_rewards(is_active);
    `);

    // Insert users into the `user_profiles` table
    const insertUsersQueryString = format(
      `INSERT INTO user_profiles (username, display_name, email, profile_image_url, password_hash, is_parent, timezone, user_preferences) VALUES %L RETURNING id`,
      users.map((user) => [
        user.username,
        user.display_name,
        user.email,
        user.profile_image_url || "",
        user.password_hash,
        user.is_parent || false,
        user.timezone || "GMT",
        user.user_preferences || {
          notificationsEnabled: true,
          theme: "light",
          language: "en",
          pin_key: null,
        },
      ])
    );

    await db.query(insertUsersQueryString);

    // Insert user sessions if they exist
    if (userSessions && userSessions.length > 0) {
      const insertUserSessionsQueryString = format(
        `INSERT INTO user_sessions (user_id, token_id, expires_at, revoked_at, last_used_at, created_at) VALUES %L RETURNING *`,
        userSessions.map((session: UserSession) => [
          session.user_id,
          session.token_id,
          session.expires_at,
          session.revoked_at || null,
          session.last_used_at || null,
          session.created_at,
        ])
      );
      await db.query(insertUserSessionsQueryString);
    }

    if (childProfiles && childProfiles.length > 0) {
      const insertChildProfilesQueryString = format(
        `INSERT INTO child_profiles (user_id, name, age, xp, level, reward_points, last_played) VALUES %L RETURNING *`,
        childProfiles.map((child: ChildProfile) => [
          child.user_id,
          child.name,
          child.age,
          child.xp,
          child.level,
          child.reward_points,
          child.last_played,
        ])
      );
      await db.query(insertChildProfilesQueryString);
    }

    if (premiumRewards && premiumRewards.length > 0) {
      const insertPremiumRewardsQueryString = format(
        `INSERT INTO premium_rewards (title, description, points_required, is_active, category, does_expire, duration_days) VALUES %L RETURNING *`,
        premiumRewards.map((reward: PremiumReward) => [
          reward.title,
          reward.description,
          reward.points_required,
          reward.is_active,
          reward.category,
          reward.does_expire,
          reward.duration_days,
        ])
      );
      await db.query(insertPremiumRewardsQueryString);
    }

    if (achievements && achievements.length > 0) {
      const insertAchievementsQueryString = format(
        `INSERT INTO achievements (title, description, criteria, required_value, xp_reward, points_reward, is_active, image_url, category, is_special) VALUES %L RETURNING *`,
        achievements.map((achievement: Achievement) => [
          achievement.title,
          achievement.description,
          achievement.criteria,
          achievement.required_value,
          achievement.xp_reward,
          achievement.points_reward,
          achievement.is_active,
          achievement.image_url,
          achievement.category,
          achievement.is_special,
        ])
      );
      await db.query(insertAchievementsQueryString);
    }

    if (shapes && shapes.length > 0) {
      const insertShapesQueryString = format(
        `INSERT INTO shapes (name, description, image) VALUES %L RETURNING *`,
        shapes.map((shape: Shape) => [
          shape.name,
          shape.description,
          shape.image,
        ])
      );
      await db.query(insertShapesQueryString);
    }

    // Note: choreCategories and chores are no longer seeded since all chores are now user-specific

    if (wordCategories && wordCategories.length > 0) {
      const insertWordCategoriesQueryString = format(
        `INSERT INTO word_categories (name) VALUES %L RETURNING *`,
        wordCategories.map((category: WordCategory) => [category.name])
      );
      await db.query(insertWordCategoriesQueryString);
    }

    // Note: chores are no longer seeded since all chores are now user-specific

    if (words && words.length > 0) {
      const insertWordsQueryString = format(
        `INSERT INTO words (word, image, category) VALUES %L RETURNING *`,
        words.map((word: Word) => [word.word, word.image, word.category])
      );
      await db.query(insertWordsQueryString);
    }

    if (learnedWords && learnedWords.length > 0) {
      const insertLearnedWordsQueryString = format(
        `INSERT INTO learned_words (word_id, word, image, category, learned_at, times_learned, child_id) VALUES %L RETURNING *`,
        learnedWords.map((word: LearnedWord) => [
          word.word_id,
          word.word,
          word.image,
          word.category,
          word.learned_at,
          word.times_learned,
          word.child_id,
        ])
      );
      await db.query(insertLearnedWordsQueryString);
    }

    if (mathStats && mathStats.length > 0) {
      const insertMathStatsQueryString = format(
        `INSERT INTO math_stats (child_id, stats) VALUES %L RETURNING *`,
        mathStats.map((stat: MathStats) => [stat.child_id, stat.stats])
      );
      await db.query(insertMathStatsQueryString);
    }

    if (spellingStats && spellingStats.length > 0) {
      const insertSpellingStatsQueryString = format(
        `INSERT INTO spelling_stats (child_id, stats) VALUES %L RETURNING *`,
        spellingStats.map((stat: SpellingStats) => [stat.child_id, stat.stats])
      );
      await db.query(insertSpellingStatsQueryString);
    }

    if (shapeStats && shapeStats.length > 0) {
      const insertShapeStatsQueryString = format(
        `INSERT INTO shape_stats (child_id, stats) VALUES %L RETURNING *`,
        shapeStats.map((stat: ShapeStats) => [stat.child_id, stat.stats])
      );
      await db.query(insertShapeStatsQueryString);
    }

    if (memoryStats && memoryStats.length > 0) {
      const insertMemoryStatsQueryString = format(
        `INSERT INTO memory_stats (child_id, stats) VALUES %L RETURNING *`,
        memoryStats.map((stat: MemoryStats) => [stat.child_id, stat.stats])
      );
      await db.query(insertMemoryStatsQueryString);
    }

    if (choreStats && choreStats.length > 0) {
      const insertChoreStatsQueryString = format(
        `INSERT INTO chore_stats (child_id, stats) VALUES %L RETURNING *`,
        choreStats.map((stat: ChoreStats) => [stat.child_id, stat.stats])
      );
      await db.query(insertChoreStatsQueryString);
    }
  } catch (err) {
    throw err;
  }
};

export default seed;
