import { defineConfig,devices } from '@playwright/test';

export default defineConfig({
  testDir:'./tests',
  timeout:180_000,
  expect:{timeout:12_000},
  fullyParallel:false,
  workers:1,
  reporter:[['line'],['json',{outputFile:'test-results/desktop-results.json'}]],
  use:{
    ...devices['Desktop Chrome'],
    browserName:'chromium',
    viewport:{width:1440,height:900},
    baseURL:'http://127.0.0.1:4173',
    trace:'off',
    screenshot:'only-on-failure',
  },
  webServer:{
    command:'VITE_E2E_BYPASS_PROFILE=1 npm run build && npm run preview -- --host 127.0.0.1 --port 4173',
    url:'http://127.0.0.1:4173',
    reuseExistingServer:false,
    timeout:120_000,
  },
});
