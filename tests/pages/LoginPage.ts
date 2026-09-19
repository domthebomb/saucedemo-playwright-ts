import type { Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

export class LoginPage extends BasePage {
  readonly usernameInput: Locator = this.page.getByTestId("username");
  readonly passwordInput: Locator = this.page.getByTestId("password");
  readonly loginButton: Locator = this.page.getByTestId("login-button");
  readonly errorMessage: Locator = this.page.getByTestId("error");

  async goto(): Promise<void> {
    await this.page.goto("/");
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}
