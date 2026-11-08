require("dotenv").config();

const workoutCalculator = require("./workoutReader");
const healthMetricsCounter = require("./healthReader");

async function processFiles() {
  const userName = process.env.USER_NAME;
  const weeklyGoal = Number(process.env.WEEKLY_GOAL);

  if (!userName || !Number.isFinite(weeklyGoal) || weeklyGoal < 0) {
    console.error(
      "Please set USER_NAME and a non-negative numeric WEEKLY_GOAL in your .env file."
    );
    return;
  }

  console.log(`Processing data for: ${userName}`);

  try {
    console.log("📁 Reading workout data...");
    const workoutSummary = await workoutCalculator("./data/workouts.csv");
    if (!workoutSummary) {
      console.error("Could not summarize workout data. Check the CSV file and try again.");
      return;
    }

    console.log("📁 Reading health data...");
    const healthEntryCount = await healthMetricsCounter("./data/health-metrics.csv");
    if (healthEntryCount === null) {
      console.error("Could not summarize health data. Check the health data file and try again.");
      return;
    }

    console.log("\n=== SUMMARY ===");
    console.log(`Workouts found: ${workoutSummary.workoutCount}`);
    console.log(`Total workout minutes: ${workoutSummary.totalMinutes}`);
    console.log(`Health entries found: ${healthEntryCount}`);
    console.log(`Weekly goal: ${weeklyGoal} minutes`);

    if (workoutSummary.totalMinutes >= weeklyGoal) {
      console.log(
        `🎉 Congratulations ${userName}! You have met your weekly goal!`
      );
    } else {
      console.log(
        `${userName}, you need ${weeklyGoal - workoutSummary.totalMinutes} more minutes to meet your weekly goal.`
      );
    }
  } catch (error) {
    console.error(`Unable to process fitness data: ${error.message}`);
  }
}

processFiles();

module.exports = processFiles;