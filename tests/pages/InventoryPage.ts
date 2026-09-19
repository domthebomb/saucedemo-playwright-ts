import type { Locator } from "@playwright/test";
import { AuthenticatedPage } from "./AuthenticatedPage";
import { ProductList } from "../components/ProductList";

export class InventoryPage extends AuthenticatedPage {
  readonly inventoryList: Locator = this.page.getByTestId("inventory-list");
  readonly products: ProductList = new ProductList(this.inventoryList);

  async goto(): Promise<void> {
    await this.page.goto("/inventory.html");
  }

  async addToCart(name: string): Promise<void> {
    await this.products.item(name).getByRole("button", { name: "Add to cart" }).click();
  }
}
