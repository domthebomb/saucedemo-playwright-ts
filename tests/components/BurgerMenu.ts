import type { Locator, Page } from "@playwright/test";

/**
 * The slide-out nav ("hamburger" menu) rendered on every authenticated page
 * (inventory, cart, checkout steps, order complete). Modelled as a standalone
 * component rather than duplicated per page object, since its markup and
 * behaviour are identical everywhere it appears.
 *
 * Note: the `data-test="open-menu"`/`"close-menu"` elements are decorative
 * <img> overlays from the underlying react-burger-menu widget; the actual
 * clickable control is the accessible "Open Menu"/"Close Menu" button
 * beneath them, so locators target that button by role instead. Verified
 * against the live DOM that those toggle buttons render outside the sliding
 * panel (`.bm-menu-wrap`), while the nav links render inside it — so only
 * the nav links are scoped to that root.
 */
export class BurgerMenu {
  readonly openButton: Locator;
  readonly closeButton: Locator;
  readonly logoutLink: Locator;

  constructor(page: Page) {
    const panel = page.locator(".bm-menu-wrap");
    this.openButton = page.getByRole("button", { name: "Open Menu" });
    this.closeButton = page.getByRole("button", { name: "Close Menu" });
    this.logoutLink = panel.getByTestId("logout-sidebar-link");
  }

  async open(): Promise<void> {
    await this.openButton.click();
    await this.closeButton.waitFor({ state: "visible" });
  }

  async logout(): Promise<void> {
    await this.open();
    await this.logoutLink.click();
  }
}
