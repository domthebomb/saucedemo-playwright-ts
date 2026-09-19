import type { Locator } from "@playwright/test";
import { AuthenticatedPage } from "./AuthenticatedPage";
import { ProductList } from "../components/ProductList";

export class CheckoutStepTwoPage extends AuthenticatedPage {
  readonly summaryContainer: Locator = this.page.getByTestId("checkout-summary-container");
  readonly products: ProductList = new ProductList(this.summaryContainer);
  readonly subtotalLabel: Locator = this.page.getByTestId("subtotal-label");
  readonly taxLabel: Locator = this.page.getByTestId("tax-label");
  readonly totalLabel: Locator = this.page.getByTestId("total-label");
  readonly finishButton: Locator = this.page.getByTestId("finish");

  async finish(): Promise<void> {
    await this.finishButton.click();
  }
}
