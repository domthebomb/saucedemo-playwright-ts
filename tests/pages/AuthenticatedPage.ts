import type { Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { BurgerMenu } from "../components/BurgerMenu";

/**
 * Shared by every page that only exists once a user is logged in. All of
 * them render the same header: the burger menu and the cart link/badge.
 * Centralising that here means each concrete page object only needs to
 * describe what's unique to it.
 */
export abstract class AuthenticatedPage extends BasePage {
  readonly burgerMenu: BurgerMenu;
  readonly cartLink: Locator;
  readonly cartBadge: Locator;

  constructor(page: Page) {
    super(page);
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
