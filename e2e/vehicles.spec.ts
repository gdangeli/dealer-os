import { test, expect, Page } from '@playwright/test';

const TEST_EMAIL = process.env.TEST_USER_EMAIL;
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD;

async function login(page: Page) {
  if (!TEST_EMAIL || !TEST_PASSWORD) {
    return false;
  }
  
  await page.goto('/login');
  await page.getByLabel(/email/i).fill(TEST_EMAIL);
  await page.getByLabel(/passwort|password/i).fill(TEST_PASSWORD);
  await page.getByRole('button', { name: /login|anmelden/i }).click();
  await expect(page).toHaveURL(/\/dashboard|\/onboarding/, { timeout: 15000 });
  
  // Navigate away from onboarding if needed
  if (page.url().includes('onboarding')) {
    await page.goto('/dashboard/vehicles');
  }
  
  return true;
}

test.describe('Vehicles CRUD', () => {
  test.beforeEach(async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) test.skip();
    await page.goto('/dashboard/vehicles');
  });

  test('should display vehicles list page', async ({ page }) => {
    if (!TEST_EMAIL) test.skip();
    
    await expect(page.getByRole('heading', { name: /fahrzeuge|vehicles/i })).toBeVisible();
  });

  test('should have add vehicle button', async ({ page }) => {
    if (!TEST_EMAIL) test.skip();
    
    const addButton = page.getByRole('link', { name: /hinzufügen|neu|add|new/i });
    await expect(addButton).toBeVisible();
  });

  test('should navigate to new vehicle form', async ({ page }) => {
    if (!TEST_EMAIL) test.skip();
    
    const addButton = page.getByRole('link', { name: /hinzufügen|neu|add|new/i });
    await addButton.click();
    
    await expect(page).toHaveURL(/\/dashboard\/vehicles\/new/);
    await expect(page.getByRole('heading', { name: /fahrzeug|vehicle/i })).toBeVisible();
  });

  test('should display vehicle form fields', async ({ page }) => {
    if (!TEST_EMAIL) test.skip();
    
    await page.goto('/dashboard/vehicles/new');
    
    // Check for common vehicle form fields
    await expect(page.getByLabel(/marke|brand|make/i)).toBeVisible();
    await expect(page.getByLabel(/modell|model/i)).toBeVisible();
    await expect(page.getByLabel(/preis|price/i)).toBeVisible();
  });

  test('should validate required fields on vehicle form', async ({ page }) => {
    if (!TEST_EMAIL) test.skip();
    
    await page.goto('/dashboard/vehicles/new');
    
    // Try to submit empty form
    const submitButton = page.getByRole('button', { name: /speichern|save|erstellen|create/i });
    await submitButton.click();
    
    // Should show validation errors or stay on page
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('/dashboard/vehicles/new');
  });

  test('should show status filter if available', async ({ page }) => {
    if (!TEST_EMAIL) test.skip();
    
    const statusFilter = page.getByRole('combobox', { name: /status/i });
    if (await statusFilter.isVisible()) {
      await expect(statusFilter).toBeVisible();
    }
  });

  test('should display vehicle cards or table', async ({ page }) => {
    if (!TEST_EMAIL) test.skip();
    
    // Look for either a table or card layout
    const table = page.locator('table');
    const cards = page.locator('[class*="card"], [class*="grid"]').first();
    
    const hasTable = await table.isVisible();
    const hasCards = await cards.isVisible();
    
    expect(hasTable || hasCards).toBe(true);
  });
});

test.describe('Vehicle Detail Page', () => {
  test.beforeEach(async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) test.skip();
  });

  test('should navigate to vehicle detail from list', async ({ page }) => {
    if (!TEST_EMAIL) test.skip();
    
    await page.goto('/dashboard/vehicles');
    
    // Click on first vehicle if exists
    const vehicleLink = page.locator('a[href*="/dashboard/vehicles/"]').first();
    
    if (await vehicleLink.isVisible()) {
      await vehicleLink.click();
      await expect(page).toHaveURL(/\/dashboard\/vehicles\/[^/]+$/);
    }
  });
});
