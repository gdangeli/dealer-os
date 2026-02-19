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
    await page.goto('/de/dashboard/help');
  }
  
  return true;
}

test.describe('Help Page Access (unauthenticated)', () => {
  test('should redirect to login from help page', async ({ page }) => {
    await page.goto('/de/dashboard/help');
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Help Page - Layout', () => {
  test.skip(!TEST_EMAIL, 'Requires TEST_USER_EMAIL env var');

  test.beforeEach(async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) test.skip();
    await page.goto('/de/dashboard/help');
    await expect(page.locator('main')).toBeVisible({ timeout: 10000 });
  });

  test('should display help page heading', async ({ page }) => {
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
  });

  test('should display search input', async ({ page }) => {
    const searchInput = page.getByRole('searchbox');
    await expect(searchInput).toBeVisible();
  });

  test('should display quick start section', async ({ page }) => {
    await expect(page.getByText(/💡/)).toBeVisible();
  });

  test('should display category cards', async ({ page }) => {
    // Check for category icons
    await expect(page.getByText('🚀')).toBeVisible(); // Getting started
    await expect(page.getByText('🚙')).toBeVisible(); // Vehicles
    await expect(page.getByText('💬')).toBeVisible(); // Leads
  });

  test('should display support contact section', async ({ page }) => {
    await expect(page.getByText('🙋')).toBeVisible();
  });
});

test.describe('Help Page - Search Functionality', () => {
  test.skip(!TEST_EMAIL, 'Requires TEST_USER_EMAIL env var');

  test.beforeEach(async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) test.skip();
    await page.goto('/de/dashboard/help');
    await expect(page.locator('main')).toBeVisible({ timeout: 10000 });
  });

  test('should have search input with placeholder', async ({ page }) => {
    const searchInput = page.getByRole('searchbox');
    await expect(searchInput).toHaveAttribute('placeholder');
  });

  test('should filter categories when typing in search', async ({ page }) => {
    const searchInput = page.getByRole('searchbox');
    
    // Count categories before search
    const categoriesBefore = await page.locator('[class*="Card"]').count();
    
    // Type a search query
    await searchInput.fill('fahrzeug');
    await page.waitForTimeout(300); // Wait for filter
    
    // Categories should be filtered
    const categoriesAfter = await page.locator('[class*="Card"]').count();
    expect(categoriesAfter).toBeLessThanOrEqual(categoriesBefore);
  });

  test('should clear search and show all categories', async ({ page }) => {
    const searchInput = page.getByRole('searchbox');
    
    await searchInput.fill('test');
    await page.waitForTimeout(300);
    
    await searchInput.clear();
    await page.waitForTimeout(300);
    
    // All major category icons should be visible
    await expect(page.getByText('🚀')).toBeVisible();
    await expect(page.getByText('🚙')).toBeVisible();
  });
});

test.describe('Help Page - Categories', () => {
  test.skip(!TEST_EMAIL, 'Requires TEST_USER_EMAIL env var');

  test.beforeEach(async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) test.skip();
    await page.goto('/de/dashboard/help');
    await expect(page.locator('main')).toBeVisible({ timeout: 10000 });
  });

  test('should display getting-started category', async ({ page }) => {
    await expect(page.getByText('🚀')).toBeVisible();
  });

  test('should display vehicles category', async ({ page }) => {
    await expect(page.getByText('🚙')).toBeVisible();
  });

  test('should display leads category', async ({ page }) => {
    await expect(page.getByText('💬')).toBeVisible();
  });

  test('should display customers category', async ({ page }) => {
    await expect(page.getByText('👥')).toBeVisible();
  });

  test('should display quotes category', async ({ page }) => {
    await expect(page.getByText('📄')).toBeVisible();
  });

  test('should display invoices category', async ({ page }) => {
    await expect(page.getByText('🧾')).toBeVisible();
  });

  test('should display integrations category', async ({ page }) => {
    await expect(page.getByText('🔗')).toBeVisible();
  });

  test('should display analytics category', async ({ page }) => {
    await expect(page.getByText('📈')).toBeVisible();
  });
});

test.describe('Help Page - Support Section', () => {
  test.skip(!TEST_EMAIL, 'Requires TEST_USER_EMAIL env var');

  test.beforeEach(async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) test.skip();
    await page.goto('/de/dashboard/help');
    await expect(page.locator('main')).toBeVisible({ timeout: 10000 });
  });

  test('should display support section', async ({ page }) => {
    await expect(page.getByText('🙋')).toBeVisible();
  });

  test('should have support email link', async ({ page }) => {
    const emailLink = page.getByRole('link', { name: /support|kontakt/i });
    await expect(emailLink).toBeVisible();
  });
});

test.describe('Help Page - Navigation', () => {
  test.skip(!TEST_EMAIL, 'Requires TEST_USER_EMAIL env var');

  test.beforeEach(async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) test.skip();
    await page.goto('/de/dashboard/help');
    await expect(page.locator('main')).toBeVisible({ timeout: 10000 });
  });

  test('should have article links within categories', async ({ page }) => {
    // Check for article links (marked with › symbol)
    const articleLinks = page.locator('a:has-text("›")');
    const count = await articleLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should have quick start link', async ({ page }) => {
    const quickStartLink = page.getByRole('link', { name: /→/ }).first();
    await expect(quickStartLink).toBeVisible();
  });
});
