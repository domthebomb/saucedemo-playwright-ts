import type { Locator } from "@playwright/test";

/**
 * The repeated "list of product cards" markup — used for the inventory grid,
 * the cart rows, and the checkout order summary. All three render items
 * tagged `data-test="inventory-item"`, so this must always be constructed
 * from a locator already scoped to the right container (e.g. the inventory
 * list vs. the cart list); querying that test id from the bare page would
 * silently match whichever of the three happens to be in the DOM.
 */
export class ProductList {
  readonly items: Locator;

  constructor(private readonly root: Locator) {
    this.items = root.getByTestId("inventory-item");
  }

  /**
   * Scopes to a single product card by its visible name, e.g. "Sauce Labs Backpack".
   * The inner `has` locator is deliberately page-scoped rather than rooted at
   * `root` again: Playwright's `has` filter nests the inner selector under
   * each outer match, so re-prefixing it with the same root selector would
   * look for the root *inside* one of its own item rows and never match.
   * `has` only needs to test per-candidate containment, so a page-wide inner
   * locator is safe here even though `items` itself must stay root-scoped.
   */
  item(name: string): Locator {
    return this.items.filter({
      has: this.root.page().getByTestId("inventory-item-name").getByText(name, { exact: true }),
    });
  }

  names(): Locator {
    return this.items.getByTestId("inventory-item-name");
  }

  prices(): Locator {
    return this.items.getByTestId("inventory-item-price");
  }
}
