import type { Locator } from "@playwright/test";
import { AuthenticatedPage } from "./AuthenticatedPage";
import { ProductList } from "../components/ProductList";

export class CartPage extends AuthenticatedPage {
  readonly cartList: Locator = this.page.getByTestId("cart-list");
  readonly products: ProductList = new ProductList(this.cartList);
  readonly checkoutButton: Locator = this.page.getByTestId("checkout");

  async removeItem(name: string): Promise<void> {
    await this.products.item(name).getByRole("button", { name: "Remove" }).click();
  }

  async checkout(): Promise<void> {
    await this.checkoutButton.click();
  }
}
