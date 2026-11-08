const fs = require("fs");
const os = require("os");
const path = require("path");

const healthMetricsCounter = require("./healthReader");
const workoutCalculator = require("./workoutReader");

describe("workout and health data readers", () => {
  let testDirectory;
  let consoleError;

  beforeEach(() => {
    testDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "fitness-readers-"));
    consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
    fs.rmSync(testDirectory, { recursive: true, force: true });
  });

  test("reads valid workout CSV and returns the expected summary object", async () => {
    const workoutFile = path.join(testDirectory, "workouts.csv");
    fs.writeFileSync(
      workoutFile,
      "workout,duration\nRunning,30\nCycling,45\nYoga,20\n"
    );

    await expect(workoutCalculator(workoutFile)).resolves.toEqual({
      workoutCount: 3,
      totalMinutes: 95,
    });
  });

  test("reads valid health JSON and returns the entry count", async () => {
    const healthFile = path.join(testDirectory, "health.json");
    fs.writeFileSync(
      healthFile,
      JSON.stringify([{ steps: 5000 }, { steps: 7000 }])
    );

    await expect(healthMetricsCounter(healthFile)).resolves.toBe(2);
  });

  test("handles a missing workout CSV with a null result and clear error", async () => {
    const missingFile = path.join(testDirectory, "missing-workouts.csv");

    await expect(workoutCalculator(missingFile)).resolves.toBeNull();
    expect(consoleError).toHaveBeenCalledWith(
      expect.stringContaining("Unable to read workout CSV")
    );
  });

  test("handles a missing health JSON file with a null result and clear error", async () => {
    const missingFile = path.join(testDirectory, "missing-health.json");

    await expect(healthMetricsCounter(missingFile)).resolves.toBeNull();
    expect(consoleError).toHaveBeenCalledWith(
      expect.stringContaining("Unable to read health data:")
    );
  });
});