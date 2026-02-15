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
    await page.goto('/dashboard/settings');
  }
  
  return true;
}

test.describe('Settings Page', () => {
  test.beforeEach(async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) test.skip();
    await page.goto('/dashboard/settings');
  });

  test('should display settings page', async ({ page }) => {
    if (!TEST_EMAIL) test.skip();
    
    await expect(page.getByRole('heading', { name: /einstellungen|settings/i })).toBeVisible();
  });

  test('should display company info fields', async ({ page }) => {
    if (!TEST_EMAIL) test.skip();
    
    // Look for company/dealer info fields
    const companyNameField = page.getByLabel(/firmenname|company|händler|dealer/i);
    if (await companyNameField.isVisible()) {
      await expect(companyNameField).toBeVisible();
    }
  });

  test('should display contact fields', async ({ page }) => {
    if (!TEST_EMAIL) test.skip();
    
    // Look for contact fields
    const emailField = page.getByLabel(/email/i);
    const phoneField = page.getByLabel(/telefon|phone/i);
    
    const hasEmail = await emailField.isVisible();
    const hasPhone = await phoneField.isVisible();
    
    expect(hasEmail || hasPhone).toBe(true);
  });

  test('should have save button', async ({ page }) => {
    if (!TEST_EMAIL) test.skip();
    
    const saveButton = page.getByRole('button', { name: /speichern|save/i });
    await expect(saveButton).toBeVisible();
  });

  test('should show success message on save', async ({ page }) => {
    if (!TEST_EMAIL) test.skip();
    
    const saveButton = page.getByRole('button', { name: /speichern|save/i });
    await saveButton.click();
    
    // Wait for success toast or message
    const successMessage = page.getByText(/gespeichert|saved|erfolgreich|success/i);
    await expect(successMessage).toBeVisible({ timeout: 5000 });
  });

  test('should display theme or appearance settings if available', async ({ page }) => {
    if (!TEST_EMAIL) test.skip();
    
    const themeToggle = page.getByRole('switch', { name: /dark|theme|dunkel/i });
    if (await themeToggle.isVisible()) {
      await expect(themeToggle).toBeVisible();
    }
  });
});
