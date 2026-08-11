import {defineConfig,devices} from '@playwright/test';

export default defineConfig({
  testDir:'./tests',
  timeout:90_000,
  expect:{timeout:12_000},
  fullyParallel:false,
  workers:1,
  reporter:[['line'],['json',{outputFile:'test-results/authenticated-ipad-results.json'}]],
  use:{
    baseURL:'http://127.0.0.1:4173',
    trace:'off',
    screenshot:'only-on-failure',
  },
  projects:[
    {
      name:'chromium-1024',
      use:{...devices['Desktop Chrome'],browserName:'chromium',viewport:{width:1024,height:1366}},
    },
    {
      name:'ipad-webkit',
      use:{...devices['iPad Pro 11'],browserName:'webkit',viewport:{width:1024,height:1366}},
    },
  ],
  webServer:{
    command:'npm run build && npm run preview -- --host 127.0.0.1 --port 4173',
    url:'http://127.0.0.1:4173',
    reuseExistingServer:false,
    timeout:120_000,
  },
});
