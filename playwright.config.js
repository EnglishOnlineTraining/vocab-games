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
    // python3 -m http.server, but with a listen backlog of 128 instead of
    // socketserver's default 5. With several workers loading pages at once the
    // short queue overflowed and the OS reset connections: a page lost
    // integrity.js or consent.js, never left step 0, and a random test failed.
    command: 'python3 -c "import runpy, socketserver, sys; socketserver.TCPServer.request_queue_size = 128; sys.argv = [\'http.server\', \'8791\']; runpy.run_module(\'http.server\', run_name=\'__main__\')"',
    port: 8791,
    reuseExistingServer: false,
  },
});
