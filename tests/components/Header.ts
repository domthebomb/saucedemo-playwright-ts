import type { Locator, Page } from "@playwright/test";
import { BurgerMenu } from "./BurgerMenu";

/**
 * The header rendered on every authenticated page: the burger menu plus the
 * cart link/badge. Modelled as one component so both reused pieces of the
 * header are treated the same way, rather than the menu being a component
 * and the cart indicator being a pair of locators bolted directly onto
 * AuthenticatedPage.
 */
export class Header {
  readonly burgerMenu: BurgerMenu;
  readonly cartLink: Locator;
  readonly cartBadge: Locator;

  constructor(page: Page) {
    this.burgerMenu = new BurgerMenu(page);
    this.cartLink = page.getByTestId("shopping-cart-link");
    this.cartBadge = page.getByTestId("shopping-cart-badge");
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
  }

  /** Badge is unmounted (not just hidden) when the cart is empty, hence 0 rather than reading text. */
  async cartItemCount(): Promise<number> {
    if (!(await this.cartBadge.isVisible())) {
      return 0;
    }
    return Number(await this.cartBadge.textContent());
  }
}
