import { defineConfig, devices } from '@playwright/test';
import config from './playwright.config.js';

export default defineConfig({
  ...config,
  webServer: undefined,
  use: {
    ...config.use,
    baseURL: 'http://localhost:5173',
  },
});
