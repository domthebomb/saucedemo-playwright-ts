import { test, expect } from "./fixtures/pages";
import { users } from "./fixtures/users";
import { messages } from "./fixtures/messages";

test.describe("Login", () => {
  test("standard user can log in", async ({ page, loginPage, inventoryPage }) => {
    await loginPage.goto();
    await loginPage.login(users.standard.username, users.standard.password);

    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(inventoryPage.inventoryList).toBeVisible();
  });

  test("rejects incorrect credentials", async ({ page, loginPage }) => {
    await loginPage.goto();
    await loginPage.login(users.invalid.username, users.invalid.password);

    await expect(loginPage.errorMessage).toHaveText(messages.invalidCredentials);
    await expect(page).toHaveURL("/");
  });

  test("rejects a locked-out user", async ({ page, loginPage }) => {
    await loginPage.goto();
    await loginPage.login(users.lockedOut.username, users.lockedOut.password);

    await expect(loginPage.errorMessage).toHaveText(messages.lockedOut);
    await expect(page).toHaveURL("/");
  });
});

test.describe("Logout", () => {
  test("logging out returns to the login page", async ({
    page,
    loginPage,
    loggedInInventoryPage,
  }) => {
    await loggedInInventoryPage.header.burgerMenu.logout();

    await expect(page).toHaveURL("/");
    await expect(loginPage.loginButton).toBeVisible();
  });
});
