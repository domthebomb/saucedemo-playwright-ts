import type { Locator } from "@playwright/test";
import { AuthenticatedPage } from "./AuthenticatedPage";

export class CheckoutStepOnePage extends AuthenticatedPage {
  readonly firstNameInput: Locator = this.page.getByTestId("firstName");
  readonly lastNameInput: Locator = this.page.getByTestId("lastName");
  readonly postalCodeInput: Locator = this.page.getByTestId("postalCode");
  readonly continueButton: Locator = this.page.getByTestId("continue");
  readonly cancelButton: Locator = this.page.getByTestId("cancel");
  readonly errorMessage: Locator = this.page.getByTestId("error");

  async fillInfo(firstName: string, lastName: string, postalCode: string): Promise<void> {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.postalCodeInput.fill(postalCode);
  }

  async continueToOverview(): Promise<void> {
    await this.continueButton.click();
  }
}
