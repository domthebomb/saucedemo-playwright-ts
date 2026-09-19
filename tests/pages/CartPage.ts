import type { Locator } from "@playwright/test";
import { AuthenticatedPage } from "./AuthenticatedPage";

export class CartPage extends AuthenticatedPage {
  readonly cartList: Locator = this.page.getByTestId("cart-list");
  readonly items: Locator = this.page.getByTestId("inventory-item");
  readonly checkoutButton: Locator = this.page.getByTestId("checkout");
  readonly continueShoppingButton: Locator = this.page.getByTestId("continue-shopping");

  /** Scopes to a single cart row by its visible product name. */
  item(name: string): Locator {
    return this.items.filter({
      has: this.page.getByTestId("inventory-item-name").getByText(name, { exact: true }),
    });
  }

  async removeItem(name: string): Promise<void> {
    await this.item(name).getByRole("button", { name: "Remove" }).click();
  }

  async itemNames(): Promise<string[]> {
    return this.items.getByTestId("inventory-item-name").allTextContents();
  }

  async checkout(): Promise<void> {
    await this.checkoutButton.click();
  }
}
