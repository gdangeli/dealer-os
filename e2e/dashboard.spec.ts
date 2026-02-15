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
  
  // Wait for redirect
  await expect(page).toHaveURL(/\/dashboard|\/onboarding/, { timeout: 15000 });
  return true;
}

test.describe('Dashboard Access', () => {
  test('should require authentication', async ({ page }) => {
    await page.goto('/de/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect to login from analytics', async ({ page }) => {
    await page.goto('/de/dashboard/analytics');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect to login from settings', async ({ page }) => {
    await page.goto('/de/dashboard/settings');
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Dashboard (authenticated)', () => {
  test.skip(!TEST_EMAIL, 'Requires TEST_USER_EMAIL env var');

  test('should display dashboard after login', async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) return;
    
    const url = page.url();
    if (url.includes('onboarding')) {
      await expect(page.getByText(/willkommen|einrichten|garage/i)).toBeVisible();
    } else {
      await expect(page).toHaveURL(/\/dashboard/);
    }
  });

  test('should display navigation elements', async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) return;
    
    if (page.url().includes('onboarding')) {
      await page.goto('/de/dashboard');
    }
    
    await expect(page.getByRole('link', { name: /fahrzeuge/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /leads/i })).toBeVisible();
  });

  test('should navigate to vehicles page', async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) return;
    
    if (page.url().includes('onboarding')) {
      await page.goto('/de/dashboard');
    }
    
    await page.getByRole('link', { name: /fahrzeuge/i }).click();
    await expect(page).toHaveURL(/\/dashboard\/vehicles/);
  });

  test('should navigate to leads page', async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) return;
    
    if (page.url().includes('onboarding')) {
      await page.goto('/de/dashboard');
    }
    
    await page.getByRole('link', { name: /leads/i }).click();
    await expect(page).toHaveURL(/\/dashboard\/leads/);
  });

  test('should navigate to analytics page', async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) return;
    
    if (page.url().includes('onboarding')) {
      await page.goto('/de/dashboard');
    }
    
    const analyticsLink = page.getByRole('link', { name: /analytics|statistik|auswertung/i });
    if (await analyticsLink.isVisible()) {
      await analyticsLink.click();
      await expect(page).toHaveURL(/\/dashboard\/analytics/);
    }
  });

  test('should navigate to settings page', async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) return;
    
    if (page.url().includes('onboarding')) {
      await page.goto('/de/dashboard');
    }
    
    const settingsLink = page.getByRole('link', { name: /einstellungen|settings/i });
    if (await settingsLink.isVisible()) {
      await settingsLink.click();
      await expect(page).toHaveURL(/\/dashboard\/settings/);
    }
  });
});
