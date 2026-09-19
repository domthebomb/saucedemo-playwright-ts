import { test, expect } from "@playwright/test";

test("scaffold smoke test: Sauce Demo login page loads", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Swag Labs");
});
