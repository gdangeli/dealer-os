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
    await page.goto('/dashboard/leads');
  }
  
  return true;
}

test.describe('Leads', () => {
  test('should require authentication for leads page', async ({ page }) => {
    await page.goto('/dashboard/leads');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should require authentication for new lead page', async ({ page }) => {
    await page.goto('/dashboard/leads/new');
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Leads CRUD (authenticated)', () => {
  test.beforeEach(async ({ page }) => {
    if (!TEST_EMAIL) {
      test.skip();
      return;
    }
    const loggedIn = await login(page);
    if (!loggedIn) test.skip();
    await page.goto('/dashboard/leads');
  });

  test('should display leads list page', async ({ page }) => {
    if (!TEST_EMAIL) {
      test.skip();
      return;
    }
    
    await expect(page.getByRole('heading', { name: /leads|anfragen/i })).toBeVisible();
  });

  test('should have add lead button', async ({ page }) => {
    if (!TEST_EMAIL) {
      test.skip();
      return;
    }
    
    const addButton = page.getByRole('link', { name: /hinzufügen|neu|erfassen/i });
    await expect(addButton).toBeVisible();
  });

  test('should navigate to new lead form', async ({ page }) => {
    if (!TEST_EMAIL) {
      test.skip();
      return;
    }
    
    const addButton = page.getByRole('link', { name: /hinzufügen|neu|erfassen/i });
    await addButton.click();
    
    await expect(page).toHaveURL(/\/dashboard\/leads\/new/);
  });

  test('should display leads table or list', async ({ page }) => {
    if (!TEST_EMAIL) {
      test.skip();
      return;
    }
    
    // Either shows leads or empty state
    const content = page.locator('main');
    await expect(content).toBeVisible();
  });
});
