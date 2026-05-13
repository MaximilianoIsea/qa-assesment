import { Page, Locator } from '@playwright/test';

/** Represents the SauceDemo shopping cart page at `/cart.html`. */
export class CartPage {
  readonly page: Page;
  readonly cartItems: Locator;
  readonly checkoutButton: Locator;
  readonly continueShoppingButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartItems = page.locator('.cart_item');
    this.checkoutButton = page.locator('[data-test="checkout"]');
    this.continueShoppingButton = page.locator('[data-test="continue-shopping"]');
  }

  async goto(): Promise<void> {
    await this.page.goto('/cart.html');
  }

  getItem(itemName: string): Locator {
    return this.page.locator('.cart_item', { hasText: itemName });
  }

  async removeItem(itemName: string): Promise<void> {
    await this.getItem(itemName).locator('[data-test^="remove"]').click();
  }

  async proceedToCheckout(): Promise<void> {
    await this.checkoutButton.click();
  }
}
