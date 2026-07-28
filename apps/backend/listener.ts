import "./config/env";
import app from "./app";
import { sessionCleanCronJob } from "./utils/sessionCleanCronJob";

const PORT = process.env.PORT || 9090;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  // Start the session cleanup cron job
  sessionCleanCronJob.start();
  console.log(
    "Session cleanup cron job started - will run on the 1st of each month at midnight"
  );
});
