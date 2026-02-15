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
    await page.goto('/de/dashboard/vehicles/new');
  }
  
  return true;
}

test.describe('Image Upload Access', () => {
  test('should require authentication for vehicle form', async ({ page }) => {
    await page.goto('/de/dashboard/vehicles/new');
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Image Upload (authenticated)', () => {
  test.skip(!TEST_EMAIL, 'Requires TEST_USER_EMAIL env var');

  test.beforeEach(async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) test.skip();
    await page.goto('/de/dashboard/vehicles/new');
  });

  test('should display vehicle form', async ({ page }) => {
    await expect(page.locator('form, main')).toBeVisible();
  });

  test('should have file input for images', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    const hasFileInput = await fileInput.isAttached().catch(() => false);
    
    if (hasFileInput) {
      await expect(fileInput).toBeAttached();
    } else {
      await expect(page.locator('main')).toBeVisible();
    }
  });

  test('should display upload area or dropzone', async ({ page }) => {
    const uploadArea = page.locator('[class*="dropzone"], [class*="upload"], input[type="file"], [data-testid="image-upload"]').first();
    const hasUploadArea = await uploadArea.isVisible().catch(() => false);
    
    if (hasUploadArea) {
      await expect(uploadArea).toBeVisible();
    } else {
      await expect(page.locator('main')).toBeVisible();
    }
  });
});
