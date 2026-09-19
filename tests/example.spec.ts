import { test, expect } from "./fixtures/pages";
import { users } from "./fixtures/users";

test("scaffold smoke test: POM wiring works end-to-end", async ({ loginPage, inventoryPage }) => {
  await loginPage.goto();
  await loginPage.login(users.standard.username, users.standard.password);

  await expect(inventoryPage.inventoryList).toBeVisible();
  await expect(inventoryPage.items).toHaveCount(6);

  await inventoryPage.header.burgerMenu.open();
  await expect(inventoryPage.header.burgerMenu.logoutLink).toBeVisible();
  await inventoryPage.header.burgerMenu.close();
});
