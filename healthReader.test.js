const fs = require("fs");
const os = require("os");
const path = require("path");

const healthMetricsCounter = require("./healthReader");
const workoutCalculator = require("./workoutReader");

describe("fitness data readers", () => {
  let testDirectory;
  let consoleError;
  let consoleLog;

  beforeEach(() => {
    testDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "fitness-readers-"));
    consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
    consoleLog = jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
    fs.rmSync(testDirectory, { recursive: true, force: true });
  });

  test("reads health JSON and returns the total number of entries", async () => {
    const healthFile = path.join(testDirectory, "health.json");
    fs.writeFileSync(
      healthFile,
      JSON.stringify([{ steps: 5000 }, { steps: 7000 }, { steps: 3000 }])
    );

    await expect(healthMetricsCounter(healthFile)).resolves.toBe(3);
    expect(consoleLog).toHaveBeenCalledWith("Total health entries: 3");
  });

  test("returns null and reports an error when the health file is missing", async () => {
    const missingFile = path.join(testDirectory, "missing-health.json");

    await expect(healthMetricsCounter(missingFile)).resolves.toBeNull();
    expect(consoleError).toHaveBeenCalledWith(
      expect.stringContaining("Unable to read health data:")
    );
  });

  test("returns null and reports an error when health JSON is invalid", async () => {
    const healthFile = path.join(testDirectory, "invalid-health.json");
    fs.writeFileSync(healthFile, "{invalid json");

    await expect(healthMetricsCounter(healthFile)).resolves.toBeNull();
    expect(consoleError).toHaveBeenCalledWith(
      expect.stringContaining("Unable to read health data:")
    );
  });

  test("reads workout CSV and returns the workout count and total minutes", async () => {
    const workoutFile = path.join(testDirectory, "workouts.csv");
    fs.writeFileSync(
      workoutFile,
      "workout,duration\nRunning,30\nCycling,45\nYoga,20\n"
    );

    await expect(workoutCalculator(workoutFile)).resolves.toEqual({
      workoutCount: 3,
      totalMinutes: 95,
    });
    expect(consoleLog).toHaveBeenNthCalledWith(1, "Total workouts: 3");
    expect(consoleLog).toHaveBeenNthCalledWith(2, "Total minutes: 95");
  });

  test("returns null and reports an error when the workout CSV is missing", async () => {
    const missingFile = path.join(testDirectory, "missing-workouts.csv");

    await expect(workoutCalculator(missingFile)).resolves.toBeNull();
    expect(consoleError).toHaveBeenCalledWith(
      expect.stringContaining("Unable to read workout CSV")
    );
  });
});