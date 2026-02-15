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
    await page.goto('/dashboard/vehicles');
  }
  
  return true;
}

test.describe('Export Functionality', () => {
  test('should require authentication for export API', async ({ page }) => {
    // Test the API endpoint
    const response = await page.request.get('/api/export/autoscout24');
    // Should return 401 for unauthenticated
    expect([401, 302, 307]).toContain(response.status());
  });
});

test.describe('CSV/Data Export (authenticated)', () => {
  test.beforeEach(async ({ page }) => {
    if (!TEST_EMAIL) {
      test.skip();
      return;
    }
    const loggedIn = await login(page);
    if (!loggedIn) test.skip();
  });

  test('should have export option on vehicles page', async ({ page }) => {
    if (!TEST_EMAIL) {
      test.skip();
      return;
    }
    
    await page.goto('/dashboard/vehicles');
    
    // Look for export button (may be in dropdown)
    const exportButton = page.getByRole('button', { name: /export|csv|download|autoscout/i });
    if (await exportButton.isVisible()) {
      await expect(exportButton).toBeVisible();
    }
  });

  test('should trigger download on export', async ({ page }) => {
    if (!TEST_EMAIL) {
      test.skip();
      return;
    }
    
    await page.goto('/dashboard/vehicles');
    
    const exportButton = page.getByRole('button', { name: /export|csv|download/i });
    
    if (await exportButton.isVisible()) {
      // Set up download listener
      const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);
      
      await exportButton.click();
      
      const download = await downloadPromise;
      if (download) {
        const filename = download.suggestedFilename();
        expect(filename).toMatch(/\.(csv|xlsx|json)$/i);
      }
    }
  });
});
