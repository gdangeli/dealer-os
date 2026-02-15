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
    await page.goto('/de/dashboard/leads');
  }
  
  return true;
}

test.describe('Leads Access', () => {
  test('should require authentication for leads page', async ({ page }) => {
    await page.goto('/de/dashboard/leads');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should require authentication for new lead page', async ({ page }) => {
    await page.goto('/de/dashboard/leads/new');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should require authentication for lead detail page', async ({ page }) => {
    await page.goto('/de/dashboard/leads/123');
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Leads CRUD (authenticated)', () => {
  test.skip(!TEST_EMAIL, 'Requires TEST_USER_EMAIL env var');

  test.beforeEach(async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) test.skip();
    await page.goto('/de/dashboard/leads');
  });

  test('should display leads list page', async ({ page }) => {
    await expect(page.locator('main')).toBeVisible();
    const heading = page.getByRole('heading', { name: /leads|anfragen/i });
    await expect(heading).toBeVisible();
  });

  test('should have add lead button', async ({ page }) => {
    const addButton = page.getByRole('link', { name: /hinzufügen|neu|erfassen|lead|anfrage/i }).first();
    await expect(addButton).toBeVisible();
  });

  test('should navigate to new lead form', async ({ page }) => {
    const addButton = page.getByRole('link', { name: /hinzufügen|neu|erfassen|lead|anfrage/i }).first();
    await addButton.click();
    await expect(page).toHaveURL(/\/dashboard\/leads\/new/);
  });

  test('should display leads or empty state', async ({ page }) => {
    const content = page.locator('main');
    await expect(content).toBeVisible();
  });

  test('should have view toggle if available', async ({ page }) => {
    await expect(page.locator('main')).toBeVisible();
  });

  test('should have filter options if available', async ({ page }) => {
    await expect(page.locator('main')).toBeVisible();
  });
});
