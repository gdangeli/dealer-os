import { test, expect, Page } from '@playwright/test';

/**
 * Dashboard tests - require authentication
 * To run these tests, set TEST_USER_EMAIL and TEST_USER_PASSWORD env vars
 */

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
  
  // Wait for redirect
  await expect(page).toHaveURL(/\/dashboard|\/onboarding/, { timeout: 15000 });
  return true;
}

test.describe('Dashboard', () => {
  test('should require authentication', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should display dashboard after login', async ({ page }) => {
    if (!TEST_EMAIL) {
      test.skip();
      return;
    }
    
    const loggedIn = await login(page);
    if (!loggedIn) return;
    
    // Check if redirected to onboarding or dashboard
    const url = page.url();
    if (url.includes('onboarding')) {
      await expect(page.getByText(/willkommen|einrichten|garage/i)).toBeVisible();
    } else {
      // On dashboard
      await expect(page).toHaveURL(/\/dashboard/);
    }
  });

  test('should display navigation elements', async ({ page }) => {
    if (!TEST_EMAIL) {
      test.skip();
      return;
    }
    
    const loggedIn = await login(page);
    if (!loggedIn) return;
    
    // Skip if on onboarding
    if (page.url().includes('onboarding')) {
      await page.goto('/dashboard');
    }
    
    // Should show navigation with key links
    await expect(page.getByRole('link', { name: /fahrzeuge/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /leads/i })).toBeVisible();
  });

  test('should have logout functionality', async ({ page }) => {
    if (!TEST_EMAIL) {
      test.skip();
      return;
    }
    
    const loggedIn = await login(page);
    if (!loggedIn) return;
    
    if (page.url().includes('onboarding')) {
      await page.goto('/dashboard');
    }
    
    // Find and click logout
    const logoutButton = page.getByRole('button', { name: /logout|abmelden/i });
    
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      await expect(page).toHaveURL(/\/login|\/$/);
    }
  });
});

test.describe('Dashboard Analytics', () => {
  test('should require authentication for analytics', async ({ page }) => {
    await page.goto('/dashboard/analytics');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should display analytics page when authenticated', async ({ page }) => {
    if (!TEST_EMAIL) {
      test.skip();
      return;
    }
    
    const loggedIn = await login(page);
    if (!loggedIn) return;
    
    await page.goto('/dashboard/analytics');
    
    // Should show analytics content
    await expect(page).toHaveURL(/\/dashboard\/analytics/);
  });
});
