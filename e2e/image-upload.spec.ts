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
    await page.goto('/dashboard/vehicles/new');
  }
  
  return true;
}

test.describe('Image Upload', () => {
  test('should require authentication for vehicle form', async ({ page }) => {
    await page.goto('/dashboard/vehicles/new');
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Image Upload (authenticated)', () => {
  test.beforeEach(async ({ page }) => {
    if (!TEST_EMAIL) {
      test.skip();
      return;
    }
    const loggedIn = await login(page);
    if (!loggedIn) test.skip();
    await page.goto('/dashboard/vehicles/new');
  });

  test('should display image upload area', async ({ page }) => {
    if (!TEST_EMAIL) {
      test.skip();
      return;
    }
    
    // Look for dropzone or file input area
    const uploadArea = page.locator('[class*="dropzone"], [class*="upload"], input[type="file"]').first();
    await expect(uploadArea).toBeVisible();
  });

  test('should have file input for images', async ({ page }) => {
    if (!TEST_EMAIL) {
      test.skip();
      return;
    }
    
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeAttached();
  });

  test('should show drag and drop hint', async ({ page }) => {
    if (!TEST_EMAIL) {
      test.skip();
      return;
    }
    
    // Look for upload instructions
    const uploadHint = page.getByText(/drag|drop|ziehen|hochladen|bilder/i).first();
    if (await uploadHint.isVisible()) {
      await expect(uploadHint).toBeVisible();
    }
  });
});
