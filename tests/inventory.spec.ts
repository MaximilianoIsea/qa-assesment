import { test, expect } from '@playwright/test';
import { InventoryPage } from './pages/InventoryPage';
import { loginAs, CREDENTIALS } from './helpers/auth';

test.describe('Inventory', () => {
  let inventoryPage: InventoryPage;

  test.beforeEach(async ({ page }) => {
    await loginAs(page, CREDENTIALS.users.standard);
    inventoryPage = new InventoryPage(page);
  });

  test('TC-005: inventory page displays exactly 6 products', async () => {
    await expect(inventoryPage.inventoryItems).toHaveCount(6);
  });

  test('TC-006: sorting by price low-to-high orders products in ascending order', async () => {
    await inventoryPage.sortBy('lohi');

    const prices = await inventoryPage.getItemPrices();
    const sorted = [...prices].sort((a, b) => a - b);

    expect(prices).toEqual(sorted);
  });

  test('TC-007: adding an item to cart increments the cart badge by one', async () => {
    await inventoryPage.addItemToCart('Sauce Labs Backpack');

    await expect(inventoryPage.cartBadge).toHaveText('1');
  });

  test('TC-008: logging out redirects to the login page', async ({ page }) => {
    await inventoryPage.logout();

    await expect(page).toHaveURL('/');
    await expect(page.locator('[data-test="login-button"]')).toBeVisible();
  });
});
