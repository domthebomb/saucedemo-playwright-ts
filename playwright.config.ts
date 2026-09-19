import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: {
    baseURL: "https://www.saucedemo.com",
    trace: "on-first-retry",
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
