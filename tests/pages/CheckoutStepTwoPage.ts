import type { Locator } from "@playwright/test";
import { AuthenticatedPage } from "./AuthenticatedPage";

export class CheckoutStepTwoPage extends AuthenticatedPage {
  readonly summaryContainer: Locator = this.page.getByTestId("checkout-summary-container");
  readonly items: Locator = this.page.getByTestId("inventory-item");
  readonly subtotalLabel: Locator = this.page.getByTestId("subtotal-label");
  readonly taxLabel: Locator = this.page.getByTestId("tax-label");
  readonly totalLabel: Locator = this.page.getByTestId("total-label");
  readonly finishButton: Locator = this.page.getByTestId("finish");
  readonly cancelButton: Locator = this.page.getByTestId("cancel");

  async itemNames(): Promise<string[]> {
    return this.items.getByTestId("inventory-item-name").allTextContents();
  }

  async finish(): Promise<void> {
    await this.finishButton.click();
  }
}
