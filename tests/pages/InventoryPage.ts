import { Page, Locator } from '@playwright/test';

/** Maps to the sort dropdown's option values as defined by the SauceDemo app. */
export type SortOption = 'az' | 'za' | 'lohi' | 'hilo';

/** Represents the SauceDemo product listing page at `/inventory.html`. */
export class InventoryPage {
  readonly page: Page;
  readonly inventoryList: Locator;
  readonly inventoryItems: Locator;
  readonly sortDropdown: Locator;
  readonly cartBadge: Locator;
  readonly cartLink: Locator;
  readonly burgerMenuButton: Locator;
  readonly logoutLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.inventoryList = page.locator('.inventory_list');
    this.inventoryItems = page.locator('.inventory_item');
    this.sortDropdown = page.locator('[data-test="product-sort-container"]');
    this.cartBadge = page.locator('.shopping_cart_badge');
    this.cartLink = page.locator('.shopping_cart_link');
    this.burgerMenuButton = page.locator('#react-burger-menu-btn');
    this.logoutLink = page.locator('#logout_sidebar_link');
  }

  async goto(): Promise<void> {
    await this.page.goto('/inventory.html');
  }

  getItem(itemName: string): Locator {
    return this.page.locator('.inventory_item', { hasText: itemName });
  }

  async addItemToCart(itemName: string): Promise<void> {
    await this.getItem(itemName).locator('[data-test^="add-to-cart"]').click();
  }

  async removeItemFromCart(itemName: string): Promise<void> {
    await this.getItem(itemName).locator('[data-test^="remove"]').click();
  }

  async sortBy(option: SortOption): Promise<void> {
    await this.sortDropdown.selectOption(option);
  }

  async getItemPrices(): Promise<number[]> {
    const texts = await this.page.locator('.inventory_item_price').allTextContents();
    return texts.map(t => parseFloat(t.replace('$', '')));
  }

  async getAllImageSrcs(): Promise<string[]> {
    return this.page.locator('.inventory_item img').evaluateAll(
      (imgs: HTMLImageElement[]) => imgs.map(img => img.src)
    );
  }

  async logout(): Promise<void> {
    await this.burgerMenuButton.click();
    await this.logoutLink.click();
  }
}
