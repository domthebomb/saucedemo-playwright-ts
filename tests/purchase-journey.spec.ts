import { test, expect } from "./fixtures/pages";
import { products } from "./fixtures/products";
import { customer } from "./fixtures/customer";
import { messages } from "./fixtures/messages";

const cartItems = [products.backpack, products.bikeLight];

test.describe("Purchase journey", () => {
  test("standard user can buy two items end to end", async ({
    page,
    loggedInInventoryPage: inventoryPage,
    cartPage,
    checkoutStepOnePage,
    checkoutStepTwoPage,
    checkoutCompletePage,
  }, testInfo) => {
    await test.step("Add two items to the cart", async () => {
      for (const item of cartItems) {
        await inventoryPage.addToCart(item.name);
      }
      await expect(inventoryPage.header.cartBadge).toHaveText(String(cartItems.length));

      await testInfo.attach("cart-badge-after-adding-items", {
        body: await page.screenshot(),
        contentType: "image/png",
      });
    });

    await test.step("Go to cart and proceed to checkout", async () => {
      await inventoryPage.header.openCart();
      await expect(cartPage.products.items).toHaveCount(cartItems.length);

      await testInfo.attach("cart-contents-before-checkout", {
        body: await page.screenshot(),
        contentType: "image/png",
      });

      await cartPage.checkout();
    });

    await test.step("Fill in customer information", async () => {
      await checkoutStepOnePage.fillInfo(
        customer.firstName,
        customer.lastName,
        customer.postalCode,
      );
      await checkoutStepOnePage.continueToOverview();
    });

    await test.step("Verify order summary and price totals", async () => {
      await expect(checkoutStepTwoPage.summaryContainer).toBeVisible();
      await expect(checkoutStepTwoPage.products.names()).toHaveText(
        cartItems.map((item) => item.name),
      );

      const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0);
      const subtotalText = `Item total: $${subtotal.toFixed(2)}`;
      // Tax/total are asserted as fixed values verified against the live site rather than
      // computed here, since re-deriving the site's own tax rounding would make the test
      // circular — it would pass even if that rounding logic were subtly wrong.
      const taxText = "Tax: $3.20";
      const totalText = "Total: $43.18";

      await expect(
        checkoutStepTwoPage.subtotalLabel,
        "Cart subtotal must exactly match the sum of the added items' prices — a mismatch here is a billing bug, not a UI nitpick.",
      ).toHaveText(subtotalText);
      await expect(
        checkoutStepTwoPage.taxLabel,
        "Tax must match the site's verified rate for this subtotal — see the comment above on why this is a fixed value, not computed.",
      ).toHaveText(taxText);
      await expect(
        checkoutStepTwoPage.totalLabel,
        "Total must equal subtotal + tax — a mismatch means the customer would be charged the wrong amount.",
      ).toHaveText(totalText);

      await testInfo.attach("price-breakdown", {
        body: JSON.stringify(
          { items: cartItems.map((item) => item.name), subtotalText, taxText, totalText },
          null,
          2,
        ),
        contentType: "application/json",
      });
    });

    await test.step("Complete the order", async () => {
      await checkoutStepTwoPage.finish();

      await expect(checkoutCompletePage.completeHeader).toHaveText(messages.orderCompleteHeader);
      await expect(checkoutCompletePage.completeText).toHaveText(messages.orderCompleteText);

      await testInfo.attach("order-confirmation", {
        body: await page.screenshot(),
        contentType: "image/png",
      });
    });
  });
});
