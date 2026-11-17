const { defineConfig } = require('@playwright/test');

// TEST_PORT picks the server port (default 8791), so two sessions can run tests at once.
const PORT = process.env.TEST_PORT || 8791;

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30_000,
  use: {
    // Not 8765: another local checkout often serves there, and reusing it
    // would silently test that checkout instead of this one.
    baseURL: `http://localhost:${PORT}`,
    screenshot: 'only-on-failure',
  },
  webServer: {
    // python3 -m http.server, but with a listen backlog of 128 instead of
    // socketserver's default 5. With several workers loading pages at once the
    // short queue overflowed and the OS reset connections: a page could lose
    // one of its scripts (losing exercise.js leaves it stuck on step 0), and a
    // random test failed.
    command: `python3 -c "import runpy, socketserver, sys; socketserver.TCPServer.request_queue_size = 128; sys.argv = ['http.server', '${PORT}']; runpy.run_module('http.server', run_name='__main__')"`,
    port: Number(PORT),
    reuseExistingServer: false,
  },
});
