import { test, expect, Page } from '@playwright/test';

const TEST_EMAIL = process.env.TEST_USER_EMAIL;
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD;

async function login(page: Page): Promise<boolean> {
  if (!TEST_EMAIL || !TEST_PASSWORD) {
    return false;
  }
  
  await page.goto('/de/login');
  await page.locator('#email').fill(TEST_EMAIL);
  await page.locator('#password').fill(TEST_PASSWORD);
  await page.getByRole('button', { name: /anmelden/i }).click();
  await expect(page).toHaveURL(/\/dashboard|\/onboarding/, { timeout: 15000 });
  
  if (page.url().includes('onboarding')) {
    await page.goto('/de/dashboard/settings');
  }
  
  return true;
}

test.describe('Settings Access', () => {
  test('should require authentication for settings page', async ({ page }) => {
    await page.goto('/de/dashboard/settings');
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Settings Page (authenticated)', () => {
  test.skip(!TEST_EMAIL, 'Requires TEST_USER_EMAIL env var');

  test.beforeEach(async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) test.skip();
    await page.goto('/de/dashboard/settings');
  });

  test('should display settings page', async ({ page }) => {
    await expect(page.locator('main')).toBeVisible();
    const heading = page.getByRole('heading', { name: /einstellungen|settings/i });
    await expect(heading).toBeVisible();
  });

  test('should display form fields', async ({ page }) => {
    await expect(page.locator('input, textarea, select').first()).toBeVisible();
  });

  test('should have save functionality', async ({ page }) => {
    const saveButton = page.getByRole('button', { name: /speichern|save/i });
    await expect(saveButton).toBeVisible();
  });
});
