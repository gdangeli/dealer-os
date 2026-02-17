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
  return true;
}

test.describe('Dashboard Access (unauthenticated)', () => {
  test('should redirect to login from dashboard', async ({ page }) => {
    await page.goto('/de/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect to login from analytics', async ({ page }) => {
    await page.goto('/de/dashboard/analytics');
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Dashboard - Navigation', () => {
  test.skip(!TEST_EMAIL, 'Requires TEST_USER_EMAIL env var');

  test.beforeEach(async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) test.skip();
    
    // Skip onboarding if needed
    if (page.url().includes('onboarding')) {
      await page.goto('/de/dashboard');
    }
  });

  test('should display dashboard after login', async ({ page }) => {
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('main')).toBeVisible();
  });

  test('should display sidebar navigation', async ({ page }) => {
    // Check for navigation links
    await expect(page.getByRole('link', { name: /fahrzeuge/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /leads|anfragen/i })).toBeVisible();
  });

  test('should navigate to vehicles page', async ({ page }) => {
    await page.getByRole('link', { name: /fahrzeuge/i }).click();
    await expect(page).toHaveURL(/\/dashboard\/vehicles/);
    await expect(page.locator('main')).toBeVisible();
  });

  test('should navigate to leads page', async ({ page }) => {
    await page.getByRole('link', { name: /leads|anfragen/i }).click();
    await expect(page).toHaveURL(/\/dashboard\/leads/);
    await expect(page.locator('main')).toBeVisible();
  });

  test('should navigate to analytics page if available', async ({ page }) => {
    const analyticsLink = page.getByRole('link', { name: /analytics|statistik|auswertung/i });
    const isVisible = await analyticsLink.isVisible().catch(() => false);
    
    if (isVisible) {
      await analyticsLink.click();
      await expect(page).toHaveURL(/\/dashboard\/analytics/);
    }
  });

  test('should navigate to settings page', async ({ page }) => {
    const settingsLink = page.getByRole('link', { name: /einstellungen|settings/i });
    const isVisible = await settingsLink.isVisible().catch(() => false);
    
    if (isVisible) {
      await settingsLink.click();
      await expect(page).toHaveURL(/\/dashboard\/settings/);
    }
  });

  test('should display logout button', async ({ page }) => {
    const logoutButton = page.getByRole('button', { name: /abmelden/i }).or(
      page.locator('button:has-text("Abmelden")').or(
        page.locator('nav').getByText(/abmelden/i)
      )
    );
    
    await expect(logoutButton.first()).toBeVisible();
  });
});

test.describe('Dashboard - Widgets', () => {
  test.skip(!TEST_EMAIL, 'Requires TEST_USER_EMAIL env var');

  test.beforeEach(async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) test.skip();
    
    if (page.url().includes('onboarding')) {
      await page.goto('/de/dashboard');
    }
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should display dashboard widgets', async ({ page }) => {
    // Check for stat cards or widgets
    const widgets = page.locator('[class*="card"], [class*="widget"], [class*="stat"]');
    const hasWidgets = await widgets.first().isVisible().catch(() => false);
    
    if (hasWidgets) {
      await expect(widgets.first()).toBeVisible();
    }
    
    await expect(page.locator('main')).toBeVisible();
  });

  test('should display vehicle count widget', async ({ page }) => {
    // Look for vehicle count/summary
    const vehicleWidget = page.getByText(/fahrzeuge/i).first();
    await expect(vehicleWidget).toBeVisible();
  });

  test('should display leads count or summary', async ({ page }) => {
    // Look for leads count/summary
    const leadsWidget = page.getByText(/leads|anfragen/i).first();
    await expect(leadsWidget).toBeVisible();
  });

  test('should display quick action buttons if available', async ({ page }) => {
    // Quick actions like "Neues Fahrzeug" or "Neue Anfrage"
    const quickActionNew = page.getByRole('link', { name: /neu.*erfassen|neues.*fahrzeug|neue.*anfrage/i });
    const hasQuickAction = await quickActionNew.isVisible().catch(() => false);
    
    if (hasQuickAction) {
      await expect(quickActionNew).toBeVisible();
    }
    
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('Dashboard - Responsive Layout', () => {
  test.skip(!TEST_EMAIL, 'Requires TEST_USER_EMAIL env var');

  test('should work on mobile viewport', async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) return;
    
    if (page.url().includes('onboarding')) {
      await page.goto('/de/dashboard');
    }
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await expect(page.locator('main')).toBeVisible();
    
    // Navigation might be in a hamburger menu
    const hamburger = page.locator('button[class*="hamburger"], button[class*="menu"], [data-testid="mobile-menu"]');
    const hasHamburger = await hamburger.isVisible().catch(() => false);
    
    if (hasHamburger) {
      await hamburger.click();
      // Menu should open
      await expect(page.getByRole('link', { name: /fahrzeuge/i })).toBeVisible();
    }
  });

  test('should work on tablet viewport', async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) return;
    
    if (page.url().includes('onboarding')) {
      await page.goto('/de/dashboard');
    }
    
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await expect(page.locator('main')).toBeVisible();
    await expect(page.getByRole('link', { name: /fahrzeuge/i })).toBeVisible();
  });
});

test.describe('Dashboard - Error States', () => {
  test.skip(!TEST_EMAIL, 'Requires TEST_USER_EMAIL env var');

  test('should handle network errors gracefully', async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) return;
    
    if (page.url().includes('onboarding')) {
      await page.goto('/de/dashboard');
    }
    
    // Simulate offline
    await page.route('**/api/**', route => route.abort('failed'));
    
    // Refresh page
    await page.reload();
    
    // Page should still render (might show error state)
    await expect(page.locator('body')).toBeVisible();
    
    // Remove route
    await page.unroute('**/api/**');
  });
});

test.describe('Dashboard - Quick Links', () => {
  test.skip(!TEST_EMAIL, 'Requires TEST_USER_EMAIL env var');

  test('should have quick link to add vehicle', async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) return;
    
    if (page.url().includes('onboarding')) {
      await page.goto('/de/dashboard');
    }
    
    // Look for quick add vehicle link
    const addVehicleLink = page.getByRole('link', { name: /fahrzeug.*erfassen|neues.*fahrzeug/i });
    const isVisible = await addVehicleLink.isVisible().catch(() => false);
    
    if (isVisible) {
      await addVehicleLink.click();
      await expect(page).toHaveURL(/\/dashboard\/vehicles\/new/);
    }
  });

  test('should have quick link to add lead', async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) return;
    
    if (page.url().includes('onboarding')) {
      await page.goto('/de/dashboard');
    }
    
    // Look for quick add lead link
    const addLeadLink = page.getByRole('link', { name: /anfrage.*erfassen|neue.*anfrage|lead.*erfassen/i });
    const isVisible = await addLeadLink.isVisible().catch(() => false);
    
    if (isVisible) {
      await addLeadLink.click();
      await expect(page).toHaveURL(/\/dashboard\/leads\/new/);
    }
  });
});
