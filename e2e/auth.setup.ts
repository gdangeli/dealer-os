import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../.playwright/.auth/user.json');

/**
 * This setup file authenticates a test user and saves the session state.
 * To use authenticated tests, you need to:
 * 1. Create a test account on the platform
 * 2. Set TEST_USER_EMAIL and TEST_USER_PASSWORD environment variables
 * 3. Run: npx playwright test --project=setup
 * 
 * For now, this is optional - tests without auth will test the public pages.
 */
setup('authenticate', async ({ page }) => {
  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;
  
  if (!email || !password) {
    console.log('⚠️  No test credentials provided. Skipping auth setup.');
    console.log('   Set TEST_USER_EMAIL and TEST_USER_PASSWORD to enable authenticated tests.');
    return;
  }

  await page.goto('/login');
  
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/passwort|password/i).fill(password);
  await page.getByRole('button', { name: /login|anmelden/i }).click();
  
  // Wait for redirect to dashboard
  await expect(page).toHaveURL(/\/dashboard|\/onboarding/, { timeout: 15000 });
  
  // Save signed-in state
  await page.context().storageState({ path: authFile });
  console.log('✅ Auth state saved to', authFile);
});
