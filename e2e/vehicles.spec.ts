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
  
  // Navigate to vehicles if on onboarding
  if (page.url().includes('onboarding')) {
    await page.goto('/dashboard/vehicles');
  }
  
  return true;
}

test.describe('Vehicles', () => {
  test('should require authentication for vehicles page', async ({ page }) => {
    await page.goto('/dashboard/vehicles');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should require authentication for new vehicle page', async ({ page }) => {
    await page.goto('/dashboard/vehicles/new');
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Vehicles CRUD (authenticated)', () => {
  test.beforeEach(async ({ page }) => {
    if (!TEST_EMAIL) {
      test.skip();
      return;
    }
    const loggedIn = await login(page);
    if (!loggedIn) test.skip();
    await page.goto('/dashboard/vehicles');
  });

  test('should display vehicles list page', async ({ page }) => {
    if (!TEST_EMAIL) {
      test.skip();
      return;
    }
    
    await expect(page.getByRole('heading', { name: /fahrzeuge/i })).toBeVisible();
  });

  test('should have add vehicle button', async ({ page }) => {
    if (!TEST_EMAIL) {
      test.skip();
      return;
    }
    
    const addButton = page.getByRole('link', { name: /hinzufügen|neu|erfassen/i });
    await expect(addButton).toBeVisible();
  });

  test('should navigate to new vehicle form', async ({ page }) => {
    if (!TEST_EMAIL) {
      test.skip();
      return;
    }
    
    const addButton = page.getByRole('link', { name: /hinzufügen|neu|erfassen/i });
    await addButton.click();
    
    await expect(page).toHaveURL(/\/dashboard\/vehicles\/new/);
  });

  test('should display vehicle form fields', async ({ page }) => {
    if (!TEST_EMAIL) {
      test.skip();
      return;
    }
    
    await page.goto('/dashboard/vehicles/new');
    
    // Check for common vehicle form fields
    await expect(page.locator('input, select').first()).toBeVisible();
  });

  test('should display vehicles in list or grid', async ({ page }) => {
    if (!TEST_EMAIL) {
      test.skip();
      return;
    }
    
    // Either shows vehicles or empty state
    const content = page.locator('main');
    await expect(content).toBeVisible();
  });
});
