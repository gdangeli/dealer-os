import { test as setup, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const authFile = path.join(__dirname, '../.playwright/.auth/user.json');

/**
 * Authentication setup - runs once before authenticated tests.
 * Logs in and saves session state for reuse.
 */
setup('authenticate', async ({ page }) => {
  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;
  
  if (!email || !password) {
    console.log('⚠️  No test credentials provided (TEST_USER_EMAIL, TEST_USER_PASSWORD)');
    console.log('   Authenticated tests will be skipped.');
    // Create empty auth file so tests don't fail
    const authDir = path.dirname(authFile);
    if (!fs.existsSync(authDir)) {
      fs.mkdirSync(authDir, { recursive: true });
    }
    fs.writeFileSync(authFile, JSON.stringify({ cookies: [], origins: [] }));
    return;
  }

  // Ensure auth directory exists
  const authDir = path.dirname(authFile);
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  // Navigate to login
  await page.goto('/de/login');
  
  // Fill login form
  await page.locator('#email').fill(email);
  await page.locator('#password').fill(password);
  await page.getByRole('button', { name: /anmelden/i }).click();
  
  // Wait for redirect to dashboard or onboarding
  await expect(page).toHaveURL(/\/dashboard|\/onboarding/, { timeout: 20000 });
  
  // Save signed-in state
  await page.context().storageState({ path: authFile });
  console.log('✅ Auth state saved to', authFile);
});
