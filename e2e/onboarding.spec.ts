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
  
  return true;
}

test.describe('Onboarding Access', () => {
  test('should require authentication', async ({ page }) => {
    await page.goto('/onboarding');
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Onboarding Wizard (authenticated)', () => {
  test.skip(!TEST_EMAIL, 'Requires TEST_USER_EMAIL env var');

  test('should show onboarding or dashboard after login', async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) return;
    
    const url = page.url();
    expect(url.includes('onboarding') || url.includes('dashboard')).toBe(true);
  });

  test('should display onboarding content when on onboarding page', async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) return;
    
    if (!page.url().includes('onboarding')) {
      test.skip();
      return;
    }
    
    const content = page.locator('main');
    await expect(content).toBeVisible();
  });

  test('should have navigation to skip or continue', async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) return;
    
    if (!page.url().includes('onboarding')) {
      test.skip();
      return;
    }
    
    const actionButton = page.getByRole('button', { name: /weiter|next|überspringen|skip|dashboard/i });
    await expect(actionButton).toBeVisible();
  });
});
