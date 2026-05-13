import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { CREDENTIALS } from './helpers/auth';

test.describe('Login', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('TC-001: standard_user logs in and lands on inventory page', async ({ page }) => {
    await loginPage.login(CREDENTIALS.users.standard, CREDENTIALS.password);

    await expect(page).toHaveURL(/inventory/);
    await expect(page.locator('.inventory_list')).toBeVisible();
  });

  test('TC-002: locked_out_user sees account locked error message', async () => {
    await loginPage.login(CREDENTIALS.users.lockedOut, CREDENTIALS.password);

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText('locked out');
  });

  test('TC-003: submitting empty form shows username required error', async () => {
    await loginPage.loginButton.click();

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText('Username is required');
  });

  test('TC-004: correct username with wrong password shows credentials mismatch error', async () => {
    await loginPage.login(CREDENTIALS.users.standard, 'wrong_password');

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText('do not match');
  });
});
