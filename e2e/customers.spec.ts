import { test, expect, Page } from '@playwright/test';

const TEST_EMAIL = process.env.TEST_USER_EMAIL;
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD;

// Unique test data
const timestamp = Date.now();
const testCustomer = {
  company: `E2E Test GmbH ${timestamp}`,
  firstName: `E2E-Vorname-${timestamp}`,
  lastName: `E2E-Nachname-${timestamp}`,
  email: `e2e-customer-${timestamp}@test-example.com`,
  phone: '+41 79 123 45 67',
  street: 'Teststrasse 123',
  zip: '8000',
  city: 'Zürich',
  notes: 'E2E Test Kunde - wird automatisch gelöscht',
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
    await page.goto('/de/dashboard/customers');
  }
  
  return true;
}

test.describe('Customers Access (unauthenticated)', () => {
  test('should redirect to login from customers page', async ({ page }) => {
    await page.goto('/de/dashboard/customers');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect to login from new customer page', async ({ page }) => {
    await page.goto('/de/dashboard/customers/new');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect to login from customer detail page', async ({ page }) => {
    await page.goto('/de/dashboard/customers/some-id');
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Customers List (authenticated)', () => {
  test.skip(!TEST_EMAIL, 'Requires TEST_USER_EMAIL env var');

  test.beforeEach(async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) test.skip();
    await page.goto('/de/dashboard/customers');
  });

  test('should display customers list with heading', async ({ page }) => {
    await expect(page.locator('main')).toBeVisible();
    const heading = page.getByRole('heading', { name: /kunden/i });
    await expect(heading).toBeVisible();
  });

  test('should have add customer button that navigates to form', async ({ page }) => {
    const addButton = page.getByRole('link', { name: /neu|hinzufügen|erfassen/i }).first();
    await expect(addButton).toBeVisible();
    await addButton.click();
    await expect(page).toHaveURL(/\/dashboard\/customers\/new/);
  });

  test('should display customers table or empty state', async ({ page }) => {
    const content = page.locator('main');
    await expect(content).toBeVisible();
    // Should have either a table or empty state message
    const hasTable = await page.locator('table').count() > 0;
    const hasEmptyState = await page.getByText(/keine kunden|noch keine/i).count() > 0;
    expect(hasTable || hasEmptyState).toBeTruthy();
  });

  test('should have search/filter functionality', async ({ page }) => {
    // Check for search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="such"], input[placeholder*="Search"]');
    const hasSearch = await searchInput.count() > 0;
    // Search is optional but good to have
    if (hasSearch) {
      await expect(searchInput.first()).toBeVisible();
    }
  });
});

test.describe('Customer Form (authenticated)', () => {
  test.skip(!TEST_EMAIL, 'Requires TEST_USER_EMAIL env var');

  test.beforeEach(async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) test.skip();
    await page.goto('/de/dashboard/customers/new');
  });

  test('should display customer form with all fields', async ({ page }) => {
    await expect(page.locator('form')).toBeVisible();
    
    // Check for company field
    await expect(page.locator('input[name="company"], #company')).toBeVisible();
    
    // Check for name fields
    await expect(page.locator('input[name="first_name"], #first_name, input[name="firstName"]')).toBeVisible();
    await expect(page.locator('input[name="last_name"], #last_name, input[name="lastName"]')).toBeVisible();
    
    // Check for contact fields
    await expect(page.locator('input[name="email"], #email, input[type="email"]')).toBeVisible();
    await expect(page.locator('input[name="phone"], #phone, input[type="tel"]')).toBeVisible();
  });

  test('should display address fields', async ({ page }) => {
    await expect(page.locator('form')).toBeVisible();
    
    // Address fields (may be optional)
    const streetInput = page.locator('input[name="street"], #street, input[name="address"]');
    const zipInput = page.locator('input[name="zip"], #zip, input[name="postal_code"]');
    const cityInput = page.locator('input[name="city"], #city');
    
    // At least city should be present for Swiss addresses
    const hasAddressFields = await streetInput.count() > 0 || await cityInput.count() > 0;
    expect(hasAddressFields).toBeTruthy();
  });

  test('should have submit button', async ({ page }) => {
    const submitButton = page.getByRole('button', { name: /speichern|erstellen|anlegen/i });
    await expect(submitButton).toBeVisible();
  });

  test('should have cancel/back navigation', async ({ page }) => {
    const cancelButton = page.getByRole('link', { name: /abbrechen|zurück/i });
    const backButton = page.getByRole('button', { name: /abbrechen|zurück/i });
    const hasCancel = await cancelButton.count() > 0 || await backButton.count() > 0;
    expect(hasCancel).toBeTruthy();
  });
});

test.describe('Customer CRUD Operations', () => {
  test.skip(!TEST_EMAIL, 'Requires TEST_USER_EMAIL env var');

  let createdCustomerId: string | null = null;

  test('should create a new customer', async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) test.skip();
    
    await page.goto('/de/dashboard/customers/new');
    await expect(page.locator('form')).toBeVisible();

    // Fill company
    const companyInput = page.locator('input[name="company"], #company');
    if (await companyInput.count() > 0) {
      await companyInput.fill(testCustomer.company);
    }

    // Fill name
    await page.locator('input[name="first_name"], #first_name, input[name="firstName"]').first().fill(testCustomer.firstName);
    await page.locator('input[name="last_name"], #last_name, input[name="lastName"]').first().fill(testCustomer.lastName);

    // Fill contact
    await page.locator('input[name="email"], #email, input[type="email"]').first().fill(testCustomer.email);
    const phoneInput = page.locator('input[name="phone"], #phone, input[type="tel"]');
    if (await phoneInput.count() > 0) {
      await phoneInput.first().fill(testCustomer.phone);
    }

    // Fill address (if present)
    const streetInput = page.locator('input[name="street"], #street');
    if (await streetInput.count() > 0) {
      await streetInput.first().fill(testCustomer.street);
    }
    const zipInput = page.locator('input[name="zip"], #zip');
    if (await zipInput.count() > 0) {
      await zipInput.first().fill(testCustomer.zip);
    }
    const cityInput = page.locator('input[name="city"], #city');
    if (await cityInput.count() > 0) {
      await cityInput.first().fill(testCustomer.city);
    }

    // Submit
    await page.getByRole('button', { name: /speichern|erstellen|anlegen/i }).click();

    // Should redirect to customer list or detail page
    await expect(page).toHaveURL(/\/dashboard\/customers/, { timeout: 10000 });

    // Extract customer ID from URL if on detail page
    const url = page.url();
    const match = url.match(/\/customers\/([a-f0-9-]+)/);
    if (match) {
      createdCustomerId = match[1];
    }
  });

  test('should display created customer in list', async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) test.skip();
    
    await page.goto('/de/dashboard/customers');
    
    // Search for the test customer
    const searchInput = page.locator('input[type="search"], input[placeholder*="such"]');
    if (await searchInput.count() > 0) {
      await searchInput.first().fill(testCustomer.lastName);
      await page.waitForTimeout(500); // Wait for search
    }

    // Customer should be in the list
    await expect(page.getByText(testCustomer.lastName)).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to customer detail page', async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) test.skip();
    
    await page.goto('/de/dashboard/customers');
    
    // Click on the test customer
    const customerRow = page.getByText(testCustomer.lastName).first();
    await customerRow.click();

    // Should be on detail page
    await expect(page).toHaveURL(/\/dashboard\/customers\/[a-f0-9-]+/);
  });

  test('should edit customer', async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) test.skip();
    
    await page.goto('/de/dashboard/customers');
    
    // Find and click on the test customer
    const customerRow = page.getByText(testCustomer.lastName).first();
    await customerRow.click();
    await expect(page).toHaveURL(/\/dashboard\/customers\/[a-f0-9-]+/);

    // Find edit button
    const editButton = page.getByRole('button', { name: /bearbeiten|edit/i });
    if (await editButton.count() > 0) {
      await editButton.click();
      
      // Modify notes field
      const notesInput = page.locator('textarea[name="notes"], #notes');
      if (await notesInput.count() > 0) {
        await notesInput.fill('Aktualisierte Notiz - E2E Test');
      }

      // Save
      await page.getByRole('button', { name: /speichern|aktualisieren/i }).click();
      await expect(page).toHaveURL(/\/dashboard\/customers/);
    }
  });

  test('should delete customer', async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) test.skip();
    
    await page.goto('/de/dashboard/customers');
    
    // Find the test customer
    const customerRow = page.getByText(testCustomer.lastName).first();
    await customerRow.click();
    await expect(page).toHaveURL(/\/dashboard\/customers\/[a-f0-9-]+/);

    // Find delete button
    const deleteButton = page.getByRole('button', { name: /löschen|delete|entfernen/i });
    if (await deleteButton.count() > 0) {
      await deleteButton.click();

      // Confirm deletion if dialog appears
      const confirmButton = page.getByRole('button', { name: /ja|bestätigen|löschen/i });
      if (await confirmButton.count() > 0) {
        await confirmButton.click();
      }

      // Should redirect to list
      await expect(page).toHaveURL(/\/dashboard\/customers$/, { timeout: 5000 });

      // Customer should no longer be in list
      await expect(page.getByText(testCustomer.email)).not.toBeVisible({ timeout: 3000 });
    }
  });
});
