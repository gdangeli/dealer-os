import { defineConfig, devices } from '@playwright/test';
import path from 'path';

// Auth storage state path
const authFile = path.join(__dirname, '.playwright/.auth/user.json');

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,  // Run tests sequentially for stability
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [['line'], ['html', { open: 'never' }]],
  timeout: 30000,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    // Setup project - runs first, authenticates and saves state
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },
    // Tests that don't need authentication
    {
      name: 'no-auth',
      testMatch: /landing\.spec\.ts|auth\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    // Tests that need authentication - depend on setup
    {
      name: 'authenticated',
      testIgnore: /landing\.spec\.ts|auth\.spec\.ts|auth\.setup\.ts/,
      use: { 
        ...devices['Desktop Chrome'],
        storageState: authFile,
      },
      dependencies: ['setup'],
    },
  ],
  webServer: {
    command: process.env.CI ? 'npm run start' : 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
