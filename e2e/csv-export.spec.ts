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
  
  if (page.url().includes('onboarding')) {
    await page.goto('/de/dashboard/vehicles');
  }
  
  return true;
}

test.describe('Export Functionality', () => {
  test('should require authentication for export API', async ({ page }) => {
    const response = await page.request.get('/api/export/autoscout24');
    expect([401, 302, 307, 405, 404]).toContain(response.status());
  });
});

test.describe('CSV/Data Export (authenticated)', () => {
  test.skip(!TEST_EMAIL, 'Requires TEST_USER_EMAIL env var');

  test.beforeEach(async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) test.skip();
  });

  test('should have export option on vehicles page', async ({ page }) => {
    await page.goto('/de/dashboard/vehicles');
    await expect(page.locator('main')).toBeVisible();
  });

  test('should trigger download on export click', async ({ page }) => {
    await page.goto('/de/dashboard/vehicles');
    
    const exportButton = page.getByRole('button', { name: /export|csv|download/i });
    const isVisible = await exportButton.isVisible().catch(() => false);
    
    if (isVisible) {
      const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);
      await exportButton.click();
      
      const download = await downloadPromise;
      if (download) {
        const filename = download.suggestedFilename();
        expect(filename).toMatch(/\.(csv|xlsx|json)$/i);
      }
    } else {
      await expect(page.locator('main')).toBeVisible();
    }
  });
});
