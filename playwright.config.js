// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir:   './tests',
  timeout:   30_000,
  retries:   1,
  reporter:  [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL:          'http://localhost:3000',
    trace:            'on-first-retry',
    screenshot:       'only-on-failure',
    video:            'off',
    // Disable JS animations to keep tests deterministic
    // (we still check DOM presence, not animation timing)
  },

  projects: [
    {
      name:  'Desktop Chrome',
      use:   { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      // Uses Chromium with iPhone 13 UA + viewport — no WebKit install needed
      name:  'Mobile Chrome',
      use:   { ...devices['iPhone 13'], browserName: 'chromium' },
    },
  ],

  // Start local static server before tests
  webServer: {
    command: 'pnpm serve',
    url:     'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 15_000,
  },
});
