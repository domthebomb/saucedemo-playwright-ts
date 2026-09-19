import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"], ["html", { open: process.env.CI ? "never" : "on-failure" }]],
  use: {
    baseURL: "https://www.saucedemo.com",
    // "on-first-retry" only helps if retries are enabled (CI only, see above);
    // locally with retries: 0 that would mean never getting a trace at all.
    trace: process.env.CI ? "on-first-retry" : "retain-on-failure",
    screenshot: "only-on-failure",
    // Sauce Demo marks interactive elements with data-test, not the Playwright default data-testid.
    testIdAttribute: "data-test",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
