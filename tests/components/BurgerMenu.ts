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
 * beneath them, so locators target that button by role instead.
 */
export class BurgerMenu {
  readonly openButton: Locator;
  readonly closeButton: Locator;
  readonly allItemsLink: Locator;
  readonly aboutLink: Locator;
  readonly logoutLink: Locator;
  readonly resetAppStateLink: Locator;

  constructor(private readonly page: Page) {
    this.openButton = page.getByRole("button", { name: "Open Menu" });
    this.closeButton = page.getByRole("button", { name: "Close Menu" });
    this.allItemsLink = page.getByTestId("inventory-sidebar-link");
    this.aboutLink = page.getByTestId("about-sidebar-link");
    this.logoutLink = page.getByTestId("logout-sidebar-link");
    this.resetAppStateLink = page.getByTestId("reset-sidebar-link");
  }

  async open(): Promise<void> {
    await this.openButton.click();
    await this.closeButton.waitFor({ state: "visible" });
  }

  async close(): Promise<void> {
    await this.closeButton.click();
    await this.openButton.waitFor({ state: "visible" });
  }

  async logout(): Promise<void> {
    await this.open();
    await this.logoutLink.click();
  }

  async resetAppState(): Promise<void> {
    await this.open();
    await this.resetAppStateLink.click();
    await this.close();
  }

  async goToAllItems(): Promise<void> {
    await this.open();
    await this.allItemsLink.click();
  }
}
