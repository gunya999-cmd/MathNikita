import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 45_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  workers: 4,
  retries: 0,
  reporter: [['line'], ['json', { outputFile: 'test-results/audio-webkit-results.json' }]],
  use: {
    ...devices['iPad Pro 11'],
    browserName: 'webkit',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
});
