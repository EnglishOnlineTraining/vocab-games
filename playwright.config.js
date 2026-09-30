const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30_000,
  use: {
    // Not 8765: another local checkout often serves there, and reusing it
    // would silently test that checkout instead of this one.
    baseURL: 'http://localhost:8791',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'python3 -m http.server 8791',
    port: 8791,
    reuseExistingServer: false,
  },
});
