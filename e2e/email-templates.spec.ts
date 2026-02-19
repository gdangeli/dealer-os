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
    await page.goto('/de/dashboard/email-templates');
  }
  
  return true;
}

test.describe('Email Templates Access (unauthenticated)', () => {
  test('should redirect to login from email-templates page', async ({ page }) => {
    await page.goto('/de/dashboard/email-templates');
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Email Templates Page', () => {
  test.skip(!TEST_EMAIL, 'Requires TEST_USER_EMAIL env var');

  test.beforeEach(async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) test.skip();
    await page.goto('/de/dashboard/email-templates');
    await expect(page.locator('main')).toBeVisible({ timeout: 10000 });
  });

  test('should display email templates page with heading', async ({ page }) => {
    const heading = page.getByRole('heading', { name: /e-mail-vorlagen/i });
    await expect(heading).toBeVisible();
  });

  test('should display page description', async ({ page }) => {
    await expect(page.getByText(/vorlagen für schnelle kundenantworten/i)).toBeVisible();
  });

  test('should have "Neue Vorlage" button', async ({ page }) => {
    const button = page.getByRole('button', { name: /neue vorlage/i });
    await expect(button).toBeVisible();
  });

  test('should have category filter dropdown', async ({ page }) => {
    await expect(page.getByRole('combobox')).toBeVisible();
  });

  test('should display tip card about placeholders', async ({ page }) => {
    await expect(page.getByText(/tipp: platzhalter verwenden/i)).toBeVisible();
  });

  test('should show placeholder examples in tip card', async ({ page }) => {
    await expect(page.getByText(/\{\{kunde_vorname\}\}/)).toBeVisible();
  });
});

test.describe('Email Templates - Dialog Interaction', () => {
  test.skip(!TEST_EMAIL, 'Requires TEST_USER_EMAIL env var');

  test.beforeEach(async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) test.skip();
    await page.goto('/de/dashboard/email-templates');
    await expect(page.locator('main')).toBeVisible({ timeout: 10000 });
  });

  test('should open create dialog when clicking "Neue Vorlage"', async ({ page }) => {
    await page.getByRole('button', { name: /neue vorlage/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText(/neue vorlage erstellen/i)).toBeVisible();
  });

  test('should display form fields in create dialog', async ({ page }) => {
    await page.getByRole('button', { name: /neue vorlage/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    
    // Check form fields
    await expect(page.getByLabel(/name/i)).toBeVisible();
    await expect(page.getByLabel(/kategorie/i)).toBeVisible();
    await expect(page.getByLabel(/betreff/i)).toBeVisible();
    await expect(page.getByLabel(/nachricht/i)).toBeVisible();
  });

  test('should have cancel and save buttons in dialog', async ({ page }) => {
    await page.getByRole('button', { name: /neue vorlage/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    
    await expect(page.getByRole('button', { name: /abbrechen/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /erstellen/i })).toBeVisible();
  });

  test('should close dialog when clicking cancel', async ({ page }) => {
    await page.getByRole('button', { name: /neue vorlage/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    
    await page.getByRole('button', { name: /abbrechen/i }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('should have placeholder insertion button', async ({ page }) => {
    await page.getByRole('button', { name: /neue vorlage/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    
    const placeholderButton = page.getByRole('button', { name: /platzhalter einfügen/i });
    await expect(placeholderButton).toBeVisible();
  });

  test('should show placeholder options when clicking placeholder button', async ({ page }) => {
    await page.getByRole('button', { name: /neue vorlage/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    
    await page.getByRole('button', { name: /platzhalter einfügen/i }).click();
    
    // Check for placeholder buttons
    await expect(page.getByText(/klicken sie auf einen platzhalter/i)).toBeVisible();
  });
});

test.describe('Email Templates - Category Filter', () => {
  test.skip(!TEST_EMAIL, 'Requires TEST_USER_EMAIL env var');

  test.beforeEach(async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) test.skip();
    await page.goto('/de/dashboard/email-templates');
    await expect(page.locator('main')).toBeVisible({ timeout: 10000 });
  });

  test('should have "Alle Kategorien" as default filter', async ({ page }) => {
    await expect(page.getByRole('combobox')).toContainText(/alle kategorien/i);
  });

  test('should open category dropdown on click', async ({ page }) => {
    await page.getByRole('combobox').click();
    // Should see category options
    await expect(page.getByRole('option', { name: /anfrage/i })).toBeVisible();
  });
});
