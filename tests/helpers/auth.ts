import { Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

/** Shared credentials for all SauceDemo test users. Password is the same for every account. */
export const CREDENTIALS = {
  password: 'secret_sauce',
  users: {
    standard: 'standard_user',
    lockedOut: 'locked_out_user',
    problem: 'problem_user',
    performanceGlitch: 'performance_glitch_user',
    error: 'error_user',
    visual: 'visual_user',
  },
} as const;

export async function loginAs(page: Page, username: string): Promise<void> {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(username, CREDENTIALS.password);
}
