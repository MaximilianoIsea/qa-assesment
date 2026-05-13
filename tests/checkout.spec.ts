import { test, expect } from '@playwright/test';
import { InventoryPage } from './pages/InventoryPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { loginAs, CREDENTIALS } from './helpers/auth';

test.describe('Checkout', () => {
  let inventoryPage: InventoryPage;
  let cartPage: CartPage;
  let checkoutPage: CheckoutPage;

  test.beforeEach(async ({ page }) => {
    await loginAs(page, CREDENTIALS.users.standard);
    inventoryPage = new InventoryPage(page);
    cartPage = new CartPage(page);
    checkoutPage = new CheckoutPage(page);

    await inventoryPage.addItemToCart('Sauce Labs Backpack');
    await inventoryPage.cartLink.click();
    await cartPage.proceedToCheckout();
  });

  test('TC-012: standard_user completes full checkout and sees order confirmation', async ({ page }) => {
    await checkoutPage.fillForm('Jane', 'Doe', '10001');
    await checkoutPage.continue();

    await expect(checkoutPage.orderSummaryItems).toHaveCount(1);
    await expect(checkoutPage.itemTotal).toContainText('29.99');

    await checkoutPage.finish();

    await expect(page).toHaveURL(/checkout-complete/);
    await expect(checkoutPage.confirmationHeader).toHaveText('Thank you for your order!');
  });

  test('TC-013: submitting checkout info without first name shows validation error', async () => {
    await checkoutPage.continue();

    await expect(checkoutPage.errorMessage).toBeVisible();
    await expect(checkoutPage.errorMessage).toContainText('First Name is required');
  });
});
