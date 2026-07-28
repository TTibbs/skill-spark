import cron from "node-cron";
import { selectSessionsToCleanup } from "../models/auth-model";

// Run every month at 00:00:00 on the 1st day
export const sessionCleanCronJob = cron.schedule("0 0 1 * *", async () => {
  try {
    console.log("Starting monthly session cleanup...");
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    await selectSessionsToCleanup(thirtyDaysAgo);
    console.log("Monthly session cleanup completed successfully");
  } catch (error) {
    console.error("Error during monthly session cleanup:", error);
  }
});
