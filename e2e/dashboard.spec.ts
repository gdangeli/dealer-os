import { test, expect, Page } from '@playwright/test';

/**
 * Dashboard tests - require authentication
 * To run these tests, set TEST_USER_EMAIL and TEST_USER_PASSWORD env vars
 */

const TEST_EMAIL = process.env.TEST_USER_EMAIL;
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD;

async function login(page: Page) {
  if (!TEST_EMAIL || !TEST_PASSWORD) {
    test.skip();
    return;
  }
  
  await page.goto('/login');
  await page.getByLabel(/email/i).fill(TEST_EMAIL);
  await page.getByLabel(/passwort|password/i).fill(TEST_PASSWORD);
  await page.getByRole('button', { name: /login|anmelden/i }).click();
  
  // Wait for redirect
  await expect(page).toHaveURL(/\/dashboard|\/onboarding/, { timeout: 15000 });
}

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should display dashboard after login', async ({ page }) => {
    if (!TEST_EMAIL) test.skip();
    
    // Check if redirected to onboarding or dashboard
    const url = page.url();
    if (url.includes('onboarding')) {
      await expect(page.getByText(/willkommen|onboarding|einrichten/i)).toBeVisible();
    } else {
      await expect(page.getByText(/dashboard|übersicht/i)).toBeVisible();
    }
  });

  test('should display sidebar navigation', async ({ page }) => {
    if (!TEST_EMAIL) test.skip();
    
    // Skip onboarding check
    if (page.url().includes('onboarding')) {
      await page.goto('/dashboard');
    }
    
    // Look for navigation elements
    const sidebar = page.locator('nav, aside').first();
    await expect(sidebar).toBeVisible();
    
    // Check for main nav items
    await expect(page.getByRole('link', { name: /fahrzeuge|vehicles/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /leads|anfragen/i })).toBeVisible();
  });

  test('should have working logout button', async ({ page }) => {
    if (!TEST_EMAIL) test.skip();
    
    // Find and click logout
    const logoutButton = page.getByRole('button', { name: /logout|abmelden/i });
    
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      await expect(page).toHaveURL(/\/login|\/$/);
    }
  });
});

test.describe('Dashboard Analytics', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    if (TEST_EMAIL && !page.url().includes('onboarding')) {
      await page.goto('/dashboard/analytics');
    }
  });

  test('should display analytics page', async ({ page }) => {
    if (!TEST_EMAIL) test.skip();
    if (page.url().includes('onboarding')) test.skip();
    
    await expect(page.getByText(/analytics|statistiken|übersicht/i)).toBeVisible();
  });

  test('should display charts or stats', async ({ page }) => {
    if (!TEST_EMAIL) test.skip();
    if (page.url().includes('onboarding')) test.skip();
    
    // Look for chart containers or stat cards
    const statsOrCharts = page.locator('[class*="chart"], [class*="stat"], [class*="card"]').first();
    await expect(statsOrCharts).toBeVisible();
  });
});
