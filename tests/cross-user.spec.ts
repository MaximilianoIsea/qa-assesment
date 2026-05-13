import { test, expect, Page } from '@playwright/test';
import { InventoryPage } from './pages/InventoryPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { loginAs, CREDENTIALS } from './helpers/auth';

async function getInventoryImageSrcs(page: Page): Promise<string[]> {
  return page.locator('.inventory_item img').evaluateAll(
    (imgs: HTMLImageElement[]) => imgs.map(img => img.src)
  );
}

test.describe('Cross-user scenarios', () => {
  test('TC-014: problem_user product images are all broken — all items show the same image src', async ({ browser }) => {
    const [standardCtx, problemCtx] = await Promise.all([
      browser.newContext(),
      browser.newContext(),
    ]);

    const standardPage = await standardCtx.newPage();
    const problemPage = await problemCtx.newPage();

    await loginAs(standardPage, CREDENTIALS.users.standard);
    await loginAs(problemPage, CREDENTIALS.users.problem);

    const standardSrcs = await getInventoryImageSrcs(standardPage);
    const problemSrcs = await getInventoryImageSrcs(problemPage);

    await Promise.all([standardCtx.close(), problemCtx.close()]);

    // standard_user: each of the 6 products shows a unique image
    expect(new Set(standardSrcs).size).toBe(6);

    // problem_user (bug): all 6 products share the same broken image src
    expect(new Set(problemSrcs).size).toBe(1);
  });

  test('TC-015: problem_user last name field silently rejects keyboard input during checkout', async ({ page }) => {
    await loginAs(page, CREDENTIALS.users.problem);

    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    await inventoryPage.addItemToCart('Sauce Labs Backpack');
    await inventoryPage.cartLink.click();
    await cartPage.proceedToCheckout();

    await checkoutPage.firstNameInput.fill('Jane');
    await checkoutPage.lastNameInput.fill('Doe');
    await checkoutPage.postalCodeInput.fill('10001');

    // Bug: problem_user's last name field discards all input, leaving the field empty
    const lastNameValue = await checkoutPage.lastNameInput.inputValue();
    expect(lastNameValue).toBe('');
  });
});
