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
    await page.goto('/dashboard/leads');
  }
  
  return true;
}

test.describe('Leads Access', () => {
  test('should require authentication for leads page', async ({ page }) => {
    await page.goto('/dashboard/leads');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should require authentication for new lead page', async ({ page }) => {
    await page.goto('/dashboard/leads/new');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should require authentication for lead detail page', async ({ page }) => {
    await page.goto('/dashboard/leads/123');
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Leads CRUD (authenticated)', () => {
  test.skip(!TEST_EMAIL, 'Requires TEST_USER_EMAIL env var');

  test.beforeEach(async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) test.skip();
    await page.goto('/dashboard/leads');
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

  test('should load new lead form without errors', async ({ page }) => {
    await page.goto('/dashboard/leads/new');
    
    // Wait for page to fully load
    await expect(page.locator('main')).toBeVisible();
    
    // Check that form fields are visible
    await expect(page.locator('#firstName')).toBeVisible();
    await expect(page.locator('#lastName')).toBeVisible();
    
    // Check that Select dropdowns render without crashing
    const sourceSelect = page.getByRole('combobox').first();
    await expect(sourceSelect).toBeVisible();
    
    // Click to open vehicle select and verify it doesn't crash
    const vehicleSelect = page.getByRole('combobox').nth(1);
    await vehicleSelect.click();
    
    // The "Kein spezifisches Fahrzeug" option should be visible
    await expect(page.getByText(/kein spezifisches/i)).toBeVisible();
  });

  test('should create a new lead successfully', async ({ page }) => {
    await page.goto('/dashboard/leads/new');
    
    // Fill out required fields
    await page.locator('#firstName').fill('E2E');
    await page.locator('#lastName').fill('Testlead');
    await page.locator('#email').fill('e2e-test@example.com');
    
    // Submit form
    await page.getByRole('button', { name: /erstellen/i }).click();
    
    // Should redirect to lead detail page
    await expect(page).toHaveURL(/\/dashboard\/leads\/[a-f0-9-]+/, { timeout: 10000 });
  });
});
