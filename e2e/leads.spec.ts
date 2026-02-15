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
  
  if (page.url().includes('onboarding')) {
    await page.goto('/dashboard/leads');
  }
  
  return true;
}

test.describe('Leads CRUD', () => {
  test.beforeEach(async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) test.skip();
    await page.goto('/dashboard/leads');
  });

  test('should display leads list page', async ({ page }) => {
    if (!TEST_EMAIL) test.skip();
    
    await expect(page.getByRole('heading', { name: /leads|anfragen/i })).toBeVisible();
  });

  test('should have add lead button', async ({ page }) => {
    if (!TEST_EMAIL) test.skip();
    
    const addButton = page.getByRole('link', { name: /hinzufügen|neu|add|new/i });
    await expect(addButton).toBeVisible();
  });

  test('should navigate to new lead form', async ({ page }) => {
    if (!TEST_EMAIL) test.skip();
    
    const addButton = page.getByRole('link', { name: /hinzufügen|neu|add|new/i });
    await addButton.click();
    
    await expect(page).toHaveURL(/\/dashboard\/leads\/new/);
  });

  test('should display lead form fields', async ({ page }) => {
    if (!TEST_EMAIL) test.skip();
    
    await page.goto('/dashboard/leads/new');
    
    // Check for common lead form fields
    await expect(page.getByLabel(/name|kunde|customer/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/telefon|phone/i)).toBeVisible();
  });

  test('should display leads table or list', async ({ page }) => {
    if (!TEST_EMAIL) test.skip();
    
    // Look for table or list
    const table = page.locator('table');
    const list = page.locator('[class*="list"], [class*="grid"]').first();
    
    const hasTable = await table.isVisible();
    const hasList = await list.isVisible();
    
    expect(hasTable || hasList).toBe(true);
  });

  test('should show lead status options', async ({ page }) => {
    if (!TEST_EMAIL) test.skip();
    
    await page.goto('/dashboard/leads/new');
    
    // Look for status dropdown
    const statusSelect = page.getByLabel(/status/i);
    if (await statusSelect.isVisible()) {
      await statusSelect.click();
      // Should show status options
      await expect(page.getByRole('option')).toHaveCount({ minimum: 1 });
    }
  });
});

test.describe('Lead Detail Page', () => {
  test.beforeEach(async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) test.skip();
  });

  test('should navigate to lead detail from list', async ({ page }) => {
    if (!TEST_EMAIL) test.skip();
    
    await page.goto('/dashboard/leads');
    
    // Click on first lead if exists
    const leadLink = page.locator('a[href*="/dashboard/leads/"]').first();
    
    if (await leadLink.isVisible()) {
      await leadLink.click();
      await expect(page).toHaveURL(/\/dashboard\/leads\/[^/]+$/);
    }
  });
});
