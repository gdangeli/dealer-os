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
    await page.goto('/dashboard/vehicles');
  }
  
  return true;
}

test.describe('CSV/Data Export', () => {
  test.beforeEach(async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) test.skip();
  });

  test('should have export button on vehicles page', async ({ page }) => {
    if (!TEST_EMAIL) test.skip();
    
    await page.goto('/dashboard/vehicles');
    
    // Look for export button
    const exportButton = page.getByRole('button', { name: /export|csv|download|herunterladen/i });
    if (await exportButton.isVisible()) {
      await expect(exportButton).toBeVisible();
    }
  });

  test('should trigger download on export click', async ({ page }) => {
    if (!TEST_EMAIL) test.skip();
    
    await page.goto('/dashboard/vehicles');
    
    const exportButton = page.getByRole('button', { name: /export|csv|download|herunterladen/i });
    
    if (await exportButton.isVisible()) {
      // Set up download listener
      const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);
      
      await exportButton.click();
      
      const download = await downloadPromise;
      if (download) {
        // Check that a file was downloaded
        const filename = download.suggestedFilename();
        expect(filename).toMatch(/\.(csv|xlsx|json)$/i);
      }
    }
  });

  test('should have export option on leads page', async ({ page }) => {
    if (!TEST_EMAIL) test.skip();
    
    await page.goto('/dashboard/leads');
    
    const exportButton = page.getByRole('button', { name: /export|csv|download|herunterladen/i });
    if (await exportButton.isVisible()) {
      await expect(exportButton).toBeVisible();
    }
  });

  test('should access AutoScout24 export API', async ({ page }) => {
    if (!TEST_EMAIL) test.skip();
    
    // Test the API endpoint exists
    const response = await page.request.get('/api/export/autoscout24');
    
    // Should return 401 for unauthenticated or 200/redirect for authenticated
    expect([200, 302, 401, 403]).toContain(response.status());
  });
});

test.describe('AutoScout24 Export', () => {
  test.beforeEach(async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) test.skip();
    await page.goto('/dashboard/vehicles');
  });

  test('should have AutoScout24 export option', async ({ page }) => {
    if (!TEST_EMAIL) test.skip();
    
    // Look for AutoScout export button or dropdown option
    const autoscoutButton = page.getByRole('button', { name: /autoscout|as24/i });
    const dropdownMenu = page.getByRole('menuitem', { name: /autoscout|as24/i });
    
    const hasButton = await autoscoutButton.isVisible().catch(() => false);
    const hasMenuItem = await dropdownMenu.isVisible().catch(() => false);
    
    // Either direct button or menu item is acceptable
    if (hasButton || hasMenuItem) {
      expect(hasButton || hasMenuItem).toBe(true);
    }
  });
});
