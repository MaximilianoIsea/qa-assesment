import { defineConfig, devices, ReporterDescription } from '@playwright/test';

const reporters: ReporterDescription[] = [
  ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ['junit', { outputFile: 'test-results/results.xml' }],
  ['list'],
];

// GitHub annotations — inline pass/fail per test in the Actions log
if (process.env.CI) {
  reporters.push(['github']);
}

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: reporters,
  timeout: 30_000,        // max time per test
  expect: { timeout: 5_000 }, // max time for each assertion retry
  use: {
    baseURL: 'https://www.saucedemo.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },
  projects: [
    // ── Desktop browsers ─────────────────────────────────────────────────
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // ── Mobile viewports ─────────────────────────────────────────────────
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },          // 393×851, Chromium engine
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 13'] },        // 390×844, WebKit engine
    },

    // ── Branded browsers ─────────────────────────────────────────────────
    {
      name: 'google-chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
    // msedge is only available on the CI runner (ubuntu-latest has it pre-installed)
    ...(process.env.CI ? [{
      name: 'microsoft-edge',
      use: { ...devices['Desktop Edge'], channel: 'msedge' },
    }] : []),
  ],
});
