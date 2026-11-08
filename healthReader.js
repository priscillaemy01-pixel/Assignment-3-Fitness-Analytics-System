const fs = require("fs");
const { promisify } = require("util");

const readFile = promisify(fs.readFile);

async function healthMetricsCounter(filePath) {
  try {
    const fileContents = await readFile(filePath, "utf8");
    const healthEntries = JSON.parse(fileContents);

    if (!Array.isArray(healthEntries)) {
      throw new TypeError("Health data must be a JSON array.");
    }

    const total = healthEntries.length;
    console.log(`Total health entries: ${total}`);
    return total;
  } catch (error) {
    console.error(`Unable to read health data: ${error.message}`);
    return null;
  }
}

module.exports = healthMetricsCounter;