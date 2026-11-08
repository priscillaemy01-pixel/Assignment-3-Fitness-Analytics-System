const fs = require("fs");
const csv = require("csv-parser");

async function workoutCalculator(filePath) {
  try {
    const { workoutCount, totalMinutes } = await new Promise((resolve, reject) => {
      const workouts = [];
      let durationColumn;
      const parser = csv({ strict: true });

      parser.on("headers", (headers) => {
        durationColumn = headers.find((header) => {
          const normalizedHeader = header.toLowerCase().replace(/[^a-z0-9]/g, "");
          return (
            normalizedHeader.includes("duration") ||
            normalizedHeader === "minutes" ||
            normalizedHeader.endsWith("minutes")
          );
        });
      });

      parser.on("data", (workout) => workouts.push(workout));
      parser.on("error", (error) => {
        reject(new Error(`Invalid workout CSV: ${error.message}`));
      });
      parser.on("end", () => {
        if (!durationColumn) {
          reject(
            new Error(
              "Invalid workout CSV: a duration or minutes column is required."
            )
          );
          return;
        }

        let totalMinutes = 0;
        for (let index = 0; index < workouts.length; index += 1) {
          const duration = Number(workouts[index][durationColumn]);
          if (!Number.isFinite(duration) || duration < 0) {
            reject(
              new Error(
                `Invalid workout CSV: duration for workout ${index + 1} must be a non-negative number.`
              )
            );
            return;
          }
          totalMinutes += duration;
        }

        resolve({ workoutCount: workouts.length, totalMinutes });
      });

      fs.createReadStream(filePath)
        .on("error", (error) => {
          reject(new Error(`Unable to read workout CSV "${filePath}": ${error.message}`));
        })
        .pipe(parser);
    });

    console.log(`Total workouts: ${workoutCount}`);
    console.log(`Total minutes: ${totalMinutes}`);
    return { workoutCount, totalMinutes };
  } catch (error) {
    console.error(error.message);
    return null;
  }
}

module.exports = workoutCalculator;