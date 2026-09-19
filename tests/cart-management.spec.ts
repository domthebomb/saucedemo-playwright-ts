import { test, expect } from "./fixtures/pages";
import { products } from "./fixtures/products";

const cartItems = [products.backpack, products.bikeLight];

test.describe("Cart management", () => {
  test.beforeEach(async ({ loggedInInventoryPage }) => {
    for (const item of cartItems) {
      await loggedInInventoryPage.addToCart(item.name);
    }
  });

  test("removing one item updates the badge and item list", async ({
    loggedInInventoryPage,
    cartPage,
  }) => {
    await loggedInInventoryPage.header.openCart();

    await cartPage.removeItem(products.backpack.name);

    const remaining = cartItems.filter((item) => item !== products.backpack);
    await expect(cartPage.products.names()).toHaveText(remaining.map((item) => item.name));
    await expect(cartPage.header.cartBadge).toHaveText(String(remaining.length));
  });

  test("removing every item clears the cart badge", async ({ loggedInInventoryPage, cartPage }) => {
    await loggedInInventoryPage.header.openCart();

    for (const item of cartItems) {
      await cartPage.removeItem(item.name);
    }

    await expect(cartPage.products.items).toHaveCount(0);
    await expect(cartPage.header.cartBadge).toBeHidden();
  });
});
