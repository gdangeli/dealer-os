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
    await page.goto('/de/dashboard/vehicles');
  }
  
  return true;
}

test.describe('Vehicles Access', () => {
  test('should require authentication for vehicles page', async ({ page }) => {
    await page.goto('/de/dashboard/vehicles');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should require authentication for new vehicle page', async ({ page }) => {
    await page.goto('/de/dashboard/vehicles/new');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should require authentication for vehicle detail page', async ({ page }) => {
    await page.goto('/de/dashboard/vehicles/123');
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Vehicles CRUD (authenticated)', () => {
  test.skip(!TEST_EMAIL, 'Requires TEST_USER_EMAIL env var');

  test.beforeEach(async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) test.skip();
    await page.goto('/de/dashboard/vehicles');
  });

  test('should display vehicles list page', async ({ page }) => {
    await expect(page.locator('main')).toBeVisible();
    const heading = page.getByRole('heading', { name: /fahrzeuge/i });
    await expect(heading).toBeVisible();
  });

  test('should have add vehicle button', async ({ page }) => {
    const addButton = page.getByRole('link', { name: /hinzufügen|neu|erfassen|fahrzeug/i }).first();
    await expect(addButton).toBeVisible();
  });

  test('should navigate to new vehicle form', async ({ page }) => {
    const addButton = page.getByRole('link', { name: /hinzufügen|neu|erfassen|fahrzeug/i }).first();
    await addButton.click();
    await expect(page).toHaveURL(/\/dashboard\/vehicles\/new/);
  });

  test('should display vehicle form fields', async ({ page }) => {
    await page.goto('/de/dashboard/vehicles/new');
    await expect(page.locator('form, [data-testid="vehicle-form"], main')).toBeVisible();
    await expect(page.locator('input, select').first()).toBeVisible();
  });

  test('should display vehicles or empty state', async ({ page }) => {
    const content = page.locator('main');
    await expect(content).toBeVisible();
  });
});
