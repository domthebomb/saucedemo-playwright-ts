import type { Locator } from "@playwright/test";
import { AuthenticatedPage } from "./AuthenticatedPage";

export class CheckoutCompletePage extends AuthenticatedPage {
  readonly completeHeader: Locator = this.page.getByTestId("complete-header");
  readonly completeText: Locator = this.page.getByTestId("complete-text");
  readonly backToProductsButton: Locator = this.page.getByTestId("back-to-products");
}
