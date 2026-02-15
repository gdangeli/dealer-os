import { test, expect, Page } from '@playwright/test';

const TEST_EMAIL = process.env.TEST_USER_EMAIL;
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD;

async function login(page: Page): Promise<boolean> {
  if (!TEST_EMAIL || !TEST_PASSWORD) {
    return false;
  }
  
  await page.goto('/login');
  await page.locator('#email').fill(TEST_EMAIL);
  await page.locator('#password').fill(TEST_PASSWORD);
  await page.getByRole('button', { name: /anmelden/i }).click();
  await expect(page).toHaveURL(/\/dashboard|\/onboarding/, { timeout: 15000 });
  
  if (page.url().includes('onboarding')) {
    await page.goto('/dashboard/settings');
  }
  
  return true;
}

test.describe('Settings', () => {
  test('should require authentication for settings page', async ({ page }) => {
    await page.goto('/dashboard/settings');
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Settings Page (authenticated)', () => {
  test.beforeEach(async ({ page }) => {
    if (!TEST_EMAIL) {
      test.skip();
      return;
    }
    const loggedIn = await login(page);
    if (!loggedIn) test.skip();
    await page.goto('/dashboard/settings');
  });

  test('should display settings page', async ({ page }) => {
    if (!TEST_EMAIL) {
      test.skip();
      return;
    }
    
    await expect(page.getByRole('heading', { name: /einstellungen|settings/i })).toBeVisible();
  });

  test('should have save button', async ({ page }) => {
    if (!TEST_EMAIL) {
      test.skip();
      return;
    }
    
    const saveButton = page.getByRole('button', { name: /speichern|save/i });
    await expect(saveButton).toBeVisible();
  });

  test('should show success message on save', async ({ page }) => {
    if (!TEST_EMAIL) {
      test.skip();
      return;
    }
    
    const saveButton = page.getByRole('button', { name: /speichern|save/i });
    await saveButton.click();
    
    // Wait for success toast or message
    const successMessage = page.getByText(/gespeichert|saved|erfolgreich|success/i);
    await expect(successMessage).toBeVisible({ timeout: 5000 });
  });
});
