import {defineConfig} from '@playwright/test';

export default defineConfig({
  testDir:'./tests',
  timeout:900_000,
  expect:{timeout:40_000},
  fullyParallel:false,
  workers:1,
  reporter:[['line']],
  use:{
    browserName:'chromium',
    headless:true,
    trace:'retain-on-failure',
    screenshot:'only-on-failure',
    launchOptions:{args:['--autoplay-policy=no-user-gesture-required']},
  },
});
