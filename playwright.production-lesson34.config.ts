import {defineConfig,devices} from '@playwright/test';

const isWebKit=process.env.PRODUCTION_BROWSER==='webkit';

export default defineConfig({
  testDir:'./tests',
  timeout:120_000,
  expect:{timeout:15_000},
  fullyParallel:false,
  workers:1,
  reporter:[['line']],
  use:{
    ...(isWebKit?devices['iPad Pro 11']:{viewport:{width:1440,height:1000}}),
    browserName:isWebKit?'webkit':'chromium',
    baseURL:'https://mathnikita.gunya999.workers.dev',
    trace:'off',
    screenshot:'only-on-failure',
  },
});