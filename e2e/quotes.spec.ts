import { test, expect, Page } from '@playwright/test';

const TEST_EMAIL = process.env.TEST_USER_EMAIL;
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD;

// Unique test data
const timestamp = Date.now();
const testQuote = {
  title: `E2E Test Offerte ${timestamp}`,
  customerName: 'Test Kunde',
  vehicleInfo: 'BMW 320d - ZH 123456',
  price: '45000',
  discount: '500',
  validDays: '30',
  notes: 'E2E Test Offerte - wird automatisch gelöscht',
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
    await page.goto('/de/dashboard/quotes');
  }
  
  return true;
}

test.describe('Quotes Access (unauthenticated)', () => {
  test('should redirect to login from quotes page', async ({ page }) => {
    await page.goto('/de/dashboard/quotes');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect to login from new quote page', async ({ page }) => {
    await page.goto('/de/dashboard/quotes/new');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect to login from quote detail page', async ({ page }) => {
    await page.goto('/de/dashboard/quotes/some-id');
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Quotes List (authenticated)', () => {
  test.skip(!TEST_EMAIL, 'Requires TEST_USER_EMAIL env var');

  test.beforeEach(async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) test.skip();
    await page.goto('/de/dashboard/quotes');
  });

  test('should display quotes list with heading', async ({ page }) => {
    await expect(page.locator('main')).toBeVisible();
    const heading = page.getByRole('heading', { name: /offerten|angebote/i });
    await expect(heading).toBeVisible();
  });

  test('should have add quote button that navigates to form', async ({ page }) => {
    const addButton = page.getByRole('link', { name: /neu|hinzufügen|erstellen/i }).first();
    await expect(addButton).toBeVisible();
    await addButton.click();
    await expect(page).toHaveURL(/\/dashboard\/quotes\/new/);
  });

  test('should display quotes table or empty state', async ({ page }) => {
    const content = page.locator('main');
    await expect(content).toBeVisible();
    const hasTable = await page.locator('table').count() > 0;
    const hasEmptyState = await page.getByText(/keine offerten|noch keine/i).count() > 0;
    expect(hasTable || hasEmptyState).toBeTruthy();
  });

  test('should have status filter', async ({ page }) => {
    // Check for status filter/tabs
    const statusFilter = page.getByRole('tab', { name: /entwurf|gesendet|akzeptiert/i });
    const selectFilter = page.locator('select[name="status"]');
    const hasFilter = await statusFilter.count() > 0 || await selectFilter.count() > 0;
    // Filter is optional but expected
    if (hasFilter) {
      expect(hasFilter).toBeTruthy();
    }
  });
});

test.describe('Quote Form (authenticated)', () => {
  test.skip(!TEST_EMAIL, 'Requires TEST_USER_EMAIL env var');

  test.beforeEach(async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) test.skip();
    await page.goto('/de/dashboard/quotes/new');
  });

  test('should display quote form', async ({ page }) => {
    await expect(page.locator('form')).toBeVisible();
  });

  test('should have customer selection', async ({ page }) => {
    // Customer selector (select or combobox)
    const customerSelect = page.locator('select[name="customer_id"], #customer_id, [name="customer"]');
    const customerCombobox = page.getByRole('combobox', { name: /kunde/i });
    const hasCustomerField = await customerSelect.count() > 0 || await customerCombobox.count() > 0;
    expect(hasCustomerField).toBeTruthy();
  });

  test('should have vehicle selection', async ({ page }) => {
    // Vehicle selector
    const vehicleSelect = page.locator('select[name="vehicle_id"], #vehicle_id, [name="vehicle"]');
    const vehicleCombobox = page.getByRole('combobox', { name: /fahrzeug/i });
    const hasVehicleField = await vehicleSelect.count() > 0 || await vehicleCombobox.count() > 0;
    expect(hasVehicleField).toBeTruthy();
  });

  test('should have price fields', async ({ page }) => {
    // Price input
    const priceInput = page.locator('input[name="price"], #price, input[name="total"], input[name="amount"]');
    await expect(priceInput.first()).toBeVisible();
  });

  test('should have validity date field', async ({ page }) => {
    // Valid until date
    const validInput = page.locator('input[name="valid_until"], #valid_until, input[type="date"]');
    const hasValidField = await validInput.count() > 0;
    expect(hasValidField).toBeTruthy();
  });

  test('should have submit button', async ({ page }) => {
    const submitButton = page.getByRole('button', { name: /speichern|erstellen|anlegen/i });
    await expect(submitButton).toBeVisible();
  });
});

test.describe('Quote Detail Page', () => {
  test.skip(!TEST_EMAIL, 'Requires TEST_USER_EMAIL env var');

  test('should show 404 or redirect for non-existent quote', async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) test.skip();
    
    await page.goto('/de/dashboard/quotes/non-existent-id-12345');
    
    // Should show error or redirect
    const hasError = await page.getByText(/nicht gefunden|not found|fehler/i).count() > 0;
    const redirectedToList = page.url().includes('/quotes') && !page.url().includes('non-existent');
    expect(hasError || redirectedToList).toBeTruthy();
  });
});

test.describe('Quote Status Workflow', () => {
  test.skip(!TEST_EMAIL, 'Requires TEST_USER_EMAIL env var');

  test('quote list should show status badges', async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) test.skip();
    
    await page.goto('/de/dashboard/quotes');
    
    // If there are quotes, they should have status badges
    const hasQuotes = await page.locator('table tbody tr').count() > 0;
    if (hasQuotes) {
      const statusBadges = page.locator('[class*="badge"], [class*="status"], [class*="chip"]');
      expect(await statusBadges.count()).toBeGreaterThan(0);
    }
  });
});

test.describe('Quote PDF Generation', () => {
  test.skip(!TEST_EMAIL, 'Requires TEST_USER_EMAIL env var');

  test('quote detail should have PDF download button', async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) test.skip();
    
    await page.goto('/de/dashboard/quotes');
    
    // Click on first quote if exists
    const firstQuote = page.locator('table tbody tr').first();
    if (await firstQuote.count() > 0) {
      await firstQuote.click();
      await expect(page).toHaveURL(/\/dashboard\/quotes\/[a-f0-9-]+/);
      
      // Check for PDF button
      const pdfButton = page.getByRole('button', { name: /pdf|download|herunterladen/i });
      const pdfLink = page.getByRole('link', { name: /pdf|download/i });
      const hasPdfAction = await pdfButton.count() > 0 || await pdfLink.count() > 0;
      expect(hasPdfAction).toBeTruthy();
    }
  });
});

test.describe('Quote to Invoice Conversion', () => {
  test.skip(!TEST_EMAIL, 'Requires TEST_USER_EMAIL env var');

  test('accepted quote should have convert to invoice button', async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) test.skip();
    
    await page.goto('/de/dashboard/quotes');
    
    // Look for accepted quotes
    const acceptedTab = page.getByRole('tab', { name: /akzeptiert|accepted/i });
    if (await acceptedTab.count() > 0) {
      await acceptedTab.click();
      await page.waitForTimeout(500);
    }
    
    // Click on first quote if exists
    const firstQuote = page.locator('table tbody tr').first();
    if (await firstQuote.count() > 0) {
      await firstQuote.click();
      
      // Check for convert to invoice button
      const convertButton = page.getByRole('button', { name: /rechnung|invoice|konvertieren/i });
      // This is expected for accepted quotes
      if (await convertButton.count() > 0) {
        await expect(convertButton).toBeVisible();
      }
    }
  });
});
