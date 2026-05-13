import { test, expect } from '@playwright/test';
import { InventoryPage } from './pages/InventoryPage';
import { CartPage } from './pages/CartPage';
import { loginAs, CREDENTIALS } from './helpers/auth';

test.describe('Cart', () => {
  let inventoryPage: InventoryPage;
  let cartPage: CartPage;

  test.beforeEach(async ({ page }) => {
    await loginAs(page, CREDENTIALS.users.standard);
    inventoryPage = new InventoryPage(page);
    cartPage = new CartPage(page);
  });

  test('TC-009: added item is visible in cart with its correct name', async ({ page }) => {
    await inventoryPage.addItemToCart('Sauce Labs Backpack');
    await inventoryPage.cartLink.click();

    await expect(page).toHaveURL(/cart/);
    await expect(cartPage.getItem('Sauce Labs Backpack')).toBeVisible();
    await expect(cartPage.cartItems).toHaveCount(1);
  });

  test('TC-010: removing an item from the cart empties it and clears the badge', async () => {
    await inventoryPage.addItemToCart('Sauce Labs Backpack');
    await inventoryPage.cartLink.click();
    await cartPage.removeItem('Sauce Labs Backpack');

    await expect(cartPage.cartItems).toHaveCount(0);
    await expect(inventoryPage.cartBadge).not.toBeVisible();
  });

  test('TC-011: cart items persist when navigating back to the inventory page', async () => {
    await inventoryPage.addItemToCart('Sauce Labs Backpack');
    await inventoryPage.addItemToCart('Sauce Labs Bolt T-Shirt');
    await inventoryPage.cartLink.click();

    await expect(cartPage.cartItems).toHaveCount(2);

    await cartPage.continueShoppingButton.click();
    await inventoryPage.cartLink.click();

    await expect(cartPage.cartItems).toHaveCount(2);
  });
});
