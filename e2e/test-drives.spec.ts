import { test, expect, Page } from '@playwright/test';

const TEST_EMAIL = process.env.TEST_USER_EMAIL;
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD;

// Unique test data
const timestamp = Date.now();
const testTestDrive = {
  customerName: `E2E-Kunde-${timestamp}`,
  customerPhone: '+41 79 123 45 67',
  customerEmail: `e2e-${timestamp}@test-example.com`,
  notes: 'E2E Test Probefahrt - wird automatisch gelöscht',
};

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
    await page.goto('/de/dashboard/test-drives');
  }
  
  return true;
}

test.describe('Test Drives Access (unauthenticated)', () => {
  test('should redirect to login from test-drives page', async ({ page }) => {
    await page.goto('/de/dashboard/test-drives');
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Test Drives List (authenticated)', () => {
  test.skip(!TEST_EMAIL, 'Requires TEST_USER_EMAIL env var');

  test.beforeEach(async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) test.skip();
    await page.goto('/de/dashboard/test-drives');
  });

  test('should display test drives page with heading', async ({ page }) => {
    await expect(page.locator('main')).toBeVisible();
    const heading = page.getByRole('heading', { name: /probefahrt/i });
    await expect(heading).toBeVisible();
  });

  test('should have add test drive button', async ({ page }) => {
    const addButton = page.getByRole('button', { name: /neu|hinzufügen|probefahrt/i }).first();
    await expect(addButton).toBeVisible();
  });

  test('should display filter options', async ({ page }) => {
    // Check for filter buttons or dropdown
    const filterContainer = page.locator('main');
    await expect(filterContainer).toBeVisible();
    
    // Look for common filter options
    const upcomingFilter = page.getByRole('button', { name: /anstehend|upcoming/i }).or(
      page.getByText(/anstehend|upcoming/i)
    );
    await expect(upcomingFilter.first()).toBeVisible();
  });

  test('should display test drives table or empty state', async ({ page }) => {
    const content = page.locator('main');
    await expect(content).toBeVisible();
    
    // Either table or empty state should be visible
    const hasTable = await page.locator('table').isVisible().catch(() => false);
    const hasEmptyState = await page.getByText(/keine probefahrten|no test drives/i).isVisible().catch(() => false);
    
    expect(hasTable || hasEmptyState).toBeTruthy();
  });
});

test.describe('Test Drive Dialog', () => {
  test.skip(!TEST_EMAIL, 'Requires TEST_USER_EMAIL env var');

  test.beforeEach(async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) test.skip();
    await page.goto('/de/dashboard/test-drives');
  });

  test('should open new test drive dialog', async ({ page }) => {
    const addButton = page.getByRole('button', { name: /neu|hinzufügen|probefahrt/i }).first();
    await addButton.click();
    
    // Dialog should appear
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5000 });
  });

  test('should show required form fields in dialog', async ({ page }) => {
    const addButton = page.getByRole('button', { name: /neu|hinzufügen|probefahrt/i }).first();
    await addButton.click();
    
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5000 });
    
    // Check for essential fields - customer, vehicle, date/time
    const customerField = dialog.getByLabel(/kunde|customer/i).or(
      dialog.getByPlaceholder(/kunde|customer|name/i)
    );
    await expect(customerField.first()).toBeVisible();
  });

  test('should close dialog on cancel', async ({ page }) => {
    const addButton = page.getByRole('button', { name: /neu|hinzufügen|probefahrt/i }).first();
    await addButton.click();
    
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5000 });
    
    // Close via cancel button or X
    const cancelButton = dialog.getByRole('button', { name: /abbrechen|cancel|schliessen/i }).or(
      dialog.locator('button[aria-label*="close"], button[aria-label*="Close"]')
    );
    await cancelButton.first().click();
    
    await expect(dialog).not.toBeVisible({ timeout: 3000 });
  });
});

test.describe('Test Drive Status Updates', () => {
  test.skip(!TEST_EMAIL, 'Requires TEST_USER_EMAIL env var');

  test.beforeEach(async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) test.skip();
    await page.goto('/de/dashboard/test-drives');
  });

  test('should display status badges for test drives', async ({ page }) => {
    // Wait for content to load
    await page.waitForLoadState('networkidle');
    
    const content = page.locator('main');
    await expect(content).toBeVisible();
    
    // If there are test drives, they should have status badges
    const hasTestDrives = await page.locator('table tbody tr').count().catch(() => 0);
    
    if (hasTestDrives > 0) {
      // Look for status badges
      const statusBadge = page.locator('[class*="badge"]').or(
        page.getByText(/ausstehend|bestätigt|durchgeführt|abgesagt/i)
      );
      await expect(statusBadge.first()).toBeVisible();
    }
  });

  test('should have action menu for test drives', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    const rows = await page.locator('table tbody tr').count().catch(() => 0);
    
    if (rows > 0) {
      // Look for more actions button (three dots menu)
      const actionButton = page.locator('table tbody tr').first().getByRole('button', { name: /mehr|more|actions/i }).or(
        page.locator('table tbody tr').first().locator('[class*="dropdown"]')
      );
      
      const hasActionButton = await actionButton.first().isVisible().catch(() => false);
      expect(hasActionButton).toBeTruthy();
    }
  });
});

test.describe('Test Drive Filters', () => {
  test.skip(!TEST_EMAIL, 'Requires TEST_USER_EMAIL env var');

  test.beforeEach(async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) test.skip();
    await page.goto('/de/dashboard/test-drives');
  });

  test('should filter by upcoming test drives', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Click upcoming filter if available
    const upcomingFilter = page.getByRole('button', { name: /anstehend|upcoming/i }).or(
      page.getByText(/anstehend|upcoming/i)
    );
    
    if (await upcomingFilter.first().isVisible()) {
      await upcomingFilter.first().click();
      await page.waitForLoadState('networkidle');
    }
    
    // Page should still be functional
    await expect(page.locator('main')).toBeVisible();
  });

  test('should filter by all test drives', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Click all filter if available
    const allFilter = page.getByRole('button', { name: /alle|all/i }).or(
      page.getByText(/alle|all/i)
    );
    
    if (await allFilter.first().isVisible()) {
      await allFilter.first().click();
      await page.waitForLoadState('networkidle');
    }
    
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('Test Drive Mobile Responsiveness', () => {
  test.skip(!TEST_EMAIL, 'Requires TEST_USER_EMAIL env var');

  test.use({ viewport: { width: 375, height: 667 } });

  test('should be usable on mobile viewport', async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) test.skip();
    
    await page.goto('/de/dashboard/test-drives');
    await expect(page.locator('main')).toBeVisible();
    
    // Add button should still be accessible
    const addButton = page.getByRole('button', { name: /neu|hinzufügen|probefahrt|\+/i }).first();
    await expect(addButton).toBeVisible();
  });
});
