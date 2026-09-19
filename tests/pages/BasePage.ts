import type { Page } from "@playwright/test";

/**
 * Root of the Page Object Model. Every page object gets a handle on the
 * Playwright `Page`; nothing else is assumed here since the login page
 * (the one page with no header/burger menu) also extends this directly.
 */
export abstract class BasePage {
  constructor(protected readonly page: Page) {}
}
