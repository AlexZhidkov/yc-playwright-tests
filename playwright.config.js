import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables from functional test .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "tests/functional/.env") });

export default defineConfig({
  testDir: "./tests/functional",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ["html"],
    ["json", { outputFile: "test-results/results.json" }],
    ["junit", { outputFile: "test-results/junit.xml" }],
  ],
  use: {
    baseURL: process.env.BASE_URL || "https://yappercare.web.app",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 15000,
    expect: {
      timeout: 15000,
    },
    // Set desktop viewport size to ensure sidebar is visible
    viewport: { width: 1280, height: 720 },
  },

  projects: [
    {
      name: "chromium",
      use: { 
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: "firefox",
      use: { 
        ...devices["Desktop Firefox"],
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: "Microsoft Edge",
      use: { 
        ...devices["Desktop Edge"], 
        channel: "msedge",
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: "Google Chrome",
      use: { 
        ...devices["Desktop Chrome"], 
        channel: "chrome",
        viewport: { width: 1280, height: 720 },
      },
    },
  ],

  outputDir: "test-results/",
});
