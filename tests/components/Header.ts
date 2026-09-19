import type { Locator, Page } from "@playwright/test";
import { BurgerMenu } from "./BurgerMenu";

/**
 * The header rendered on every authenticated page: the burger menu plus the
 * cart link/badge. Rooted at `header-container` rather than the bare page,
 * since a future layout change that duplicates header-shaped markup
 * elsewhere on the page shouldn't be able to make these locators ambiguous.
 */
export class Header {
  private readonly root: Locator;
  readonly burgerMenu: BurgerMenu;
  readonly cartLink: Locator;
  readonly cartBadge: Locator;

  constructor(page: Page) {
    this.root = page.getByTestId("header-container");
    this.burgerMenu = new BurgerMenu(page);
    this.cartLink = this.root.getByTestId("shopping-cart-link");
    this.cartBadge = this.root.getByTestId("shopping-cart-badge");
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
  }
}
