import type { Locator } from "@playwright/test";
import { AuthenticatedPage } from "./AuthenticatedPage";

export type SortOption = "az" | "za" | "lohi" | "hilo";

export class InventoryPage extends AuthenticatedPage {
  readonly inventoryList: Locator = this.page.getByTestId("inventory-list");
  readonly items: Locator = this.page.getByTestId("inventory-item");
  readonly sortDropdown: Locator = this.page.getByTestId("product-sort-container");

  async goto(): Promise<void> {
    await this.page.goto("/inventory.html");
  }

  /** Scopes to a single product card by its visible name, e.g. "Sauce Labs Backpack". */
  item(name: string): Locator {
    return this.items.filter({
      has: this.page.getByTestId("inventory-item-name").getByText(name, { exact: true }),
    });
  }

  async addToCart(name: string): Promise<void> {
    await this.item(name).getByRole("button", { name: "Add to cart" }).click();
  }

  async removeFromCart(name: string): Promise<void> {
    await this.item(name).getByRole("button", { name: "Remove" }).click();
  }

  async sortBy(option: SortOption): Promise<void> {
    await this.sortDropdown.selectOption(option);
  }

  async itemNames(): Promise<string[]> {
    return this.items.getByTestId("inventory-item-name").allTextContents();
  }

  async itemPrices(): Promise<string[]> {
    return this.items.getByTestId("inventory-item-price").allTextContents();
  }
}
