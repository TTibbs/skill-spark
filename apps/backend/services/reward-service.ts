import db from "../db/connection";
import { Achievement, ChildProfile } from "../types";
import { selectStats } from "../models/children-model";
import { getLevel } from "../utils/levels";
import {
  getAchievementProgress,
  isTimeBasedAchievement,
  AllStats,
} from "../utils/achievement-progress";

export type ActivityType = "math" | "spelling" | "shapes" | "memory" | "chores";

export class AchievementService {
  public static async checkAndAwardAchievements(
    childId: number,
    activityType: ActivityType,
    stats: AllStats,
    previousStats?: AllStats
  ): Promise<Achievement[]> {
    if (!stats) return [];

    // Use provided previous stats or fetch them
    const prevStats = previousStats || (await selectStats(childId));

    const achievements = await this.getUncompletedAchievements(
      childId,
      activityType
    );

    const newlyCompletedAchievements: Achievement[] = [];

    for (const achievement of achievements) {
      // Get progress using simple direct function
      const currentProgress = getAchievementProgress(
        stats,
        achievement.category,
        achievement.criteria
      );
      const previousProgress = getAchievementProgress(
        prevStats as AllStats,
        achievement.category,
        achievement.criteria
      );

      // Simple time-based check
      const isTimeBased = isTimeBasedAchievement(achievement.criteria);

      // For time-based achievements, we want currentProgress <= required_value (faster time)
      // For other achievements, we want currentProgress >= required_value (higher progress)
      const shouldAward = isTimeBased
        ? currentProgress <= achievement.required_value && currentProgress > 0
        : currentProgress >= achievement.required_value;

      // Only award if this achievement is being reached in this specific activity
      const isNewAchievement = isTimeBased
        ? (previousProgress === 0 || currentProgress < previousProgress) &&
          currentProgress <= achievement.required_value
        : currentProgress >= achievement.required_value &&
          previousProgress < achievement.required_value;

      if (shouldAward && isNewAchievement) {
        // Award the achievement
        await db.query(
          `INSERT INTO completed_achievements (child_id, achievement_id, completed_at)
           VALUES ($1, $2, NOW())
           ON CONFLICT (child_id, achievement_id) DO NOTHING`,
          [childId, achievement.id]
        );
        await db.query(
          `UPDATE child_profiles 
           SET xp = xp + $1,
               reward_points = reward_points + $2
           WHERE id = $3`,
          [achievement.xp_reward, achievement.points_reward, childId]
        );
        newlyCompletedAchievements.push({
          ...achievement,
          is_achieved: true,
        });
      }
    }

    return newlyCompletedAchievements;
  }

  private static async getUncompletedAchievements(
    childId: number,
    activityType: ActivityType
  ): Promise<Achievement[]> {
    const { rows } = await db.query<Achievement>(
      `SELECT a.* FROM achievements a
       WHERE a.category = $1 
       AND a.is_active = true 
       AND NOT EXISTS (
         SELECT 1 FROM completed_achievements ca 
         WHERE ca.achievement_id = a.id 
         AND ca.child_id = $2
       )`,
      [activityType, childId]
    );
    return rows;
  }

  public static async getChildAchievements(
    childId: number
  ): Promise<Achievement[]> {
    const currentStats = await selectStats(childId);
    const achievements = await this.getAchievementsWithCompletionStatus(
      childId
    );

    return achievements.map((achievement) => {
      const currentProgress = getAchievementProgress(
        currentStats as AllStats,
        achievement.category,
        achievement.criteria
      );

      // Simple time-based check
      const isTimeBased = isTimeBasedAchievement(achievement.criteria);

      // For time-based achievements, we want currentProgress <= required_value (faster time)
      // For other achievements, we want currentProgress >= required_value (higher progress)
      const isAchieved = isTimeBased
        ? currentProgress <= achievement.required_value && currentProgress > 0
        : currentProgress >= achievement.required_value;

      return {
        ...achievement,
        is_achieved: achievement.is_achieved || isAchieved,
      };
    });
  }

  private static async getAchievementsWithCompletionStatus(
    childId: number
  ): Promise<(Achievement & { is_achieved: boolean })[]> {
    const { rows } = await db.query<Achievement & { is_achieved: boolean }>(
      `SELECT a.*, 
        CASE WHEN ca.id IS NOT NULL THEN true ELSE false END as is_achieved
       FROM achievements a
       LEFT JOIN completed_achievements ca ON a.id = ca.achievement_id 
         AND ca.child_id = $1
       WHERE a.is_active = true
       ORDER BY a.category, a.required_value`,
      [childId]
    );

    return rows;
  }

  public static async getCompletedAchievements(
    childId: number
  ): Promise<Achievement[]> {
    const allAchievements = await this.getChildAchievements(childId);
    return allAchievements.filter((achievement) => achievement.is_achieved);
  }

  public static async getSingleChildAchievementProgress(
    childId: number,
    achievementId: number
  ): Promise<Achievement | null> {
    const achievements = await this.getChildAchievements(childId);
    return achievements.find((a) => a.id === achievementId) || null;
  }

  public static async updateChildProfile(
    childId: number,
    xpEarned: number
  ): Promise<ChildProfile> {
    const { rows } = await db.query<ChildProfile>(
      `UPDATE child_profiles 
       SET xp = xp + $1,
           last_played = NOW()
       WHERE id = $2
       RETURNING *`,
      [xpEarned, childId]
    );

    await this.checkAndUpdateChildLevel(childId);

    if (!rows[0]) {
      throw new Error("Child profile not found");
    }

    const { rows: updatedRows } = await db.query<ChildProfile>(
      `SELECT * FROM child_profiles WHERE id = $1`,
      [childId]
    );

    return updatedRows[0];
  }

  public static async checkAndUpdateChildLevel(childId: number): Promise<void> {
    const { rows } = await db.query<ChildProfile>(
      `SELECT xp, level FROM child_profiles WHERE id = $1`,
      [childId]
    );

    const childProfile = rows[0];
    if (!childProfile) return;

    const newLevel = getLevel(childProfile.xp || 0);

    if (newLevel !== childProfile.level) {
      await db.query(`UPDATE child_profiles SET level = $1 WHERE id = $2`, [
        newLevel,
        childId,
      ]);
    }
  }

  /**
   * Check for active premium rewards that affect XP calculation
   * @param childId The child's ID
   * @returns Object containing multiplier information
   */
  public static async getActivePremiumRewardMultipliers(
    childId: number
  ): Promise<{ xpMultiplier: number; activeRewards: any[] }> {
    const { rows } = await db.query(
      `SELECT pr.*, prp.expiry_date, prp.purchase_date, prp.is_activated, prp.id as purchase_id
       FROM premium_reward_purchases prp
       JOIN premium_rewards pr ON pr.id = prp.reward_id
       WHERE prp.child_id = $1
       AND prp.is_activated = true
       AND (prp.expiry_date IS NULL OR prp.expiry_date > NOW())
       AND pr.is_active = true
       ORDER BY prp.purchase_date DESC`,
      [childId]
    );

    let xpMultiplier = 1;
    const activeRewards = rows;

    // Apply multipliers based on active rewards
    for (const reward of activeRewards as any[]) {
      if (
        reward.title.toLowerCase().includes("double xp") ||
        reward.title.toLowerCase().includes("xp boost")
      ) {
        xpMultiplier *= 2;
      }
      // Add more multiplier types here as needed
      // if (reward.title.toLowerCase().includes("triple xp")) {
      //   xpMultiplier *= 3;
      // }
    }

    return { xpMultiplier, activeRewards };
  }

  /**
   * Calculate XP with premium reward multipliers applied
   * @param childId The child's ID
   * @param baseXp The base XP earned from the activity
   * @returns The final XP amount with multipliers applied
   */
  public static async calculateXpWithMultipliers(
    childId: number,
    baseXp: number
  ): Promise<{
    achievementXp: number;
    multiplier: number;
    activeRewards: any[];
  }> {
    const { xpMultiplier, activeRewards } =
      await this.getActivePremiumRewardMultipliers(childId);
    const achievementXp = Math.round(baseXp * xpMultiplier);

    return {
      achievementXp,
      multiplier: xpMultiplier,
      activeRewards,
    };
  }
}
