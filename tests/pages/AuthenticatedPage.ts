import type { Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { Header } from "../components/Header";

/**
 * Shared by every page that only exists once a user is logged in. All of
 * them render the same header (burger menu + cart link/badge). Centralising
 * that here means each concrete page object only needs to describe what's
 * unique to it.
 */
export abstract class AuthenticatedPage extends BasePage {
  readonly header: Header;

  constructor(page: Page) {
    super(page);
    this.header = new Header(page);
  }
}
