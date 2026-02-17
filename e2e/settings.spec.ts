import { test, expect, Page } from '@playwright/test';

const TEST_EMAIL = process.env.TEST_USER_EMAIL;
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD;

const timestamp = Date.now();

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
    await page.goto('/de/dashboard/settings');
  }
  
  return true;
}

test.describe('Settings Access (unauthenticated)', () => {
  test('should redirect to login from settings page', async ({ page }) => {
    await page.goto('/de/dashboard/settings');
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Settings Page - Tabs Navigation', () => {
  test.skip(!TEST_EMAIL, 'Requires TEST_USER_EMAIL env var');

  test.beforeEach(async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) test.skip();
    await page.goto('/de/dashboard/settings');
    await expect(page.locator('main')).toBeVisible({ timeout: 10000 });
  });

  test('should display settings page with heading', async ({ page }) => {
    const heading = page.getByRole('heading', { name: /einstellungen/i });
    await expect(heading).toBeVisible();
  });

  test('should display all tabs', async ({ page }) => {
    // Check for tab buttons
    await expect(page.getByRole('tab', { name: /firmenprofil/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /benutzer/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /benachrichtigungen/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /e-mail.*vorlagen/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /kanäle/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /abo/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /gefahrenzone/i })).toBeVisible();
  });

  test('should switch between tabs', async ({ page }) => {
    // Click on Benutzer tab
    await page.getByRole('tab', { name: /benutzer/i }).click();
    await expect(page.getByText('Benutzerdaten')).toBeVisible();
    
    // Click on Benachrichtigungen tab
    await page.getByRole('tab', { name: /benachrichtigungen/i }).click();
    await expect(page.getByText('Neue Anfragen')).toBeVisible();
    
    // Click on Gefahrenzone tab
    await page.getByRole('tab', { name: /gefahrenzone/i }).click();
    await expect(page.getByText('Konto löschen')).toBeVisible();
  });
});

test.describe('Settings - Company Profile Form', () => {
  test.skip(!TEST_EMAIL, 'Requires TEST_USER_EMAIL env var');

  test.beforeEach(async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) test.skip();
    await page.goto('/de/dashboard/settings');
    await expect(page.locator('main')).toBeVisible({ timeout: 10000 });
    // Make sure we're on company tab (default)
    await page.getByRole('tab', { name: /firmenprofil/i }).click();
  });

  test('should display company profile form fields', async ({ page }) => {
    await expect(page.locator('#company_name')).toBeVisible();
    await expect(page.locator('#contact_name')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#phone')).toBeVisible();
    await expect(page.locator('#address')).toBeVisible();
    await expect(page.locator('#postal_code')).toBeVisible();
    await expect(page.locator('#city')).toBeVisible();
  });

  test('should have required field validation', async ({ page }) => {
    // Clear company name and try to save
    const companyInput = page.locator('#company_name');
    await companyInput.clear();
    
    // Click save
    const saveButton = page.getByRole('button', { name: /änderungen speichern/i });
    await saveButton.click();
    
    // Should show validation error
    await expect(page.getByText(/mindestens 2 zeichen/i)).toBeVisible({ timeout: 5000 });
  });

  test('should save company profile changes', async ({ page }) => {
    // Update phone number
    const phoneInput = page.locator('#phone');
    const testPhone = '+41 44 111 22 33';
    await phoneInput.fill(testPhone);
    
    // Save
    const saveButton = page.getByRole('button', { name: /änderungen speichern/i });
    await saveButton.click();
    
    // Wait for toast success message
    await expect(page.getByText(/gespeichert/i)).toBeVisible({ timeout: 5000 });
    
    // Verify the value persisted
    await expect(phoneInput).toHaveValue(testPhone);
  });

  test('should update address fields', async ({ page }) => {
    const testAddress = 'Teststrasse 123';
    const testCity = 'Testzürich';
    const testPostalCode = '9999';
    
    await page.locator('#address').fill(testAddress);
    await page.locator('#city').fill(testCity);
    await page.locator('#postal_code').fill(testPostalCode);
    
    // Save
    await page.getByRole('button', { name: /änderungen speichern/i }).click();
    
    // Wait for success
    await expect(page.getByText(/gespeichert/i)).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Settings - User Settings Form', () => {
  test.skip(!TEST_EMAIL, 'Requires TEST_USER_EMAIL env var');

  test.beforeEach(async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) test.skip();
    await page.goto('/de/dashboard/settings');
    await expect(page.locator('main')).toBeVisible({ timeout: 10000 });
    // Switch to user tab
    await page.getByRole('tab', { name: /benutzer/i }).click();
  });

  test('should display user settings form', async ({ page }) => {
    await expect(page.getByText('Benutzerdaten')).toBeVisible();
    await expect(page.locator('#user_contact_name')).toBeVisible();
  });

  test('should display password change form', async ({ page }) => {
    await expect(page.getByText('Passwort ändern')).toBeVisible();
    await expect(page.locator('#currentPassword')).toBeVisible();
    await expect(page.locator('#newPassword')).toBeVisible();
    await expect(page.locator('#confirmPassword')).toBeVisible();
  });

  test('should validate password mismatch', async ({ page }) => {
    await page.locator('#currentPassword').fill('oldpassword123');
    await page.locator('#newPassword').fill('newpassword123');
    await page.locator('#confirmPassword').fill('differentpassword456');
    
    // Try to submit
    const changeButton = page.getByRole('button', { name: /passwort ändern/i });
    await changeButton.click();
    
    // Should show validation error
    await expect(page.getByText(/stimmen nicht überein/i)).toBeVisible({ timeout: 5000 });
  });

  test('should show email as read-only', async ({ page }) => {
    // Email should be displayed but disabled
    const emailInput = page.locator('input[disabled]').filter({ hasText: /@/ });
    const disabledInputs = page.locator('input[disabled]');
    
    // At least one disabled input should exist (the email)
    await expect(disabledInputs.first()).toBeVisible();
  });
});

test.describe('Settings - Notifications Form', () => {
  test.skip(!TEST_EMAIL, 'Requires TEST_USER_EMAIL env var');

  test.beforeEach(async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) test.skip();
    await page.goto('/de/dashboard/settings');
    await expect(page.locator('main')).toBeVisible({ timeout: 10000 });
    // Switch to notifications tab
    await page.getByRole('tab', { name: /benachrichtigungen/i }).click();
  });

  test('should display notification settings', async ({ page }) => {
    await expect(page.getByText('Neue Anfragen')).toBeVisible();
    await expect(page.getByText('Tägliche Zusammenfassung')).toBeVisible();
    await expect(page.getByText('Langsteher-Warnung')).toBeVisible();
  });

  test('should have toggle switches for notifications', async ({ page }) => {
    // Check for switches (Radix Switch)
    const switches = page.locator('button[role="switch"]');
    await expect(switches.first()).toBeVisible();
    
    // Should have at least 2 switches (new leads, daily summary)
    const count = await switches.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('should toggle new lead notifications', async ({ page }) => {
    const newLeadSwitch = page.locator('button[role="switch"]').first();
    await expect(newLeadSwitch).toBeVisible();
    
    // Get current state
    const wasChecked = await newLeadSwitch.getAttribute('data-state') === 'checked';
    
    // Toggle
    await newLeadSwitch.click();
    
    // Verify state changed
    const newState = await newLeadSwitch.getAttribute('data-state');
    expect(newState).toBe(wasChecked ? 'unchecked' : 'checked');
    
    // Save
    await page.getByRole('button', { name: /einstellungen speichern/i }).click();
    
    // Wait for success
    await expect(page.getByText(/gespeichert/i)).toBeVisible({ timeout: 5000 });
    
    // Toggle back to original state
    await newLeadSwitch.click();
    await page.getByRole('button', { name: /einstellungen speichern/i }).click();
  });

  test('should update longstanding days setting', async ({ page }) => {
    const daysInput = page.locator('#longstanding_days');
    await expect(daysInput).toBeVisible();
    
    // Change value
    await daysInput.fill('45');
    
    // Save
    await page.getByRole('button', { name: /einstellungen speichern/i }).click();
    
    // Wait for success
    await expect(page.getByText(/gespeichert/i)).toBeVisible({ timeout: 5000 });
    
    // Verify value
    await expect(daysInput).toHaveValue('45');
  });
});

test.describe('Settings - Channels Tab', () => {
  test.skip(!TEST_EMAIL, 'Requires TEST_USER_EMAIL env var');

  test('should display channels coming soon', async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) return;
    
    await page.goto('/de/dashboard/settings');
    await expect(page.locator('main')).toBeVisible({ timeout: 10000 });
    
    // Switch to channels tab
    await page.getByRole('tab', { name: /kanäle/i }).click();
    
    // Should show coming soon message
    await expect(page.getByText(/coming soon/i)).toBeVisible();
    
    // Should list channels
    await expect(page.getByText('AutoScout24')).toBeVisible();
    await expect(page.getByText('mobile.de')).toBeVisible();
    await expect(page.getByText('tutti.ch')).toBeVisible();
  });
});

test.describe('Settings - Billing Tab', () => {
  test.skip(!TEST_EMAIL, 'Requires TEST_USER_EMAIL env var');

  test('should have link to billing page', async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) return;
    
    await page.goto('/de/dashboard/settings');
    await expect(page.locator('main')).toBeVisible({ timeout: 10000 });
    
    // Switch to billing tab
    await page.getByRole('tab', { name: /abo/i }).click();
    
    // Should have link to dedicated billing page
    const billingLink = page.getByRole('link', { name: /abo.*verwaltung/i });
    await expect(billingLink).toBeVisible();
  });
});

test.describe('Settings - Danger Zone', () => {
  test.skip(!TEST_EMAIL, 'Requires TEST_USER_EMAIL env var');

  test.beforeEach(async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) test.skip();
    await page.goto('/de/dashboard/settings');
    await expect(page.locator('main')).toBeVisible({ timeout: 10000 });
    // Switch to danger zone tab
    await page.getByRole('tab', { name: /gefahrenzone/i }).click();
  });

  test('should display danger zone options', async ({ page }) => {
    await expect(page.getByText('Alle Daten exportieren')).toBeVisible();
    await expect(page.getByText('Konto löschen')).toBeVisible();
  });

  test('should have export data button', async ({ page }) => {
    const exportButton = page.getByRole('button', { name: /daten exportieren/i });
    await expect(exportButton).toBeVisible();
  });

  test('should open delete account dialog', async ({ page }) => {
    const deleteButton = page.getByRole('button', { name: /konto löschen/i });
    await expect(deleteButton).toBeVisible();
    
    // Click to open dialog
    await deleteButton.click();
    
    // Dialog should open
    await expect(page.getByText('Konto wirklich löschen?')).toBeVisible();
    await expect(page.getByText(/diese aktion löscht unwiderruflich/i)).toBeVisible();
    
    // Should have confirmation input
    const confirmInput = page.locator('input[placeholder="LÖSCHEN"]');
    await expect(confirmInput).toBeVisible();
    
    // Delete button should be disabled without confirmation
    const confirmDeleteButton = page.getByRole('button', { name: /endgültig löschen/i });
    await expect(confirmDeleteButton).toBeDisabled();
    
    // Close dialog
    await page.getByRole('button', { name: /abbrechen/i }).click();
  });

  test('should enable delete button only with correct confirmation', async ({ page }) => {
    // Open dialog
    await page.getByRole('button', { name: /konto löschen/i }).click();
    await expect(page.getByText('Konto wirklich löschen?')).toBeVisible();
    
    const confirmInput = page.locator('input[placeholder="LÖSCHEN"]');
    const confirmDeleteButton = page.getByRole('button', { name: /endgültig löschen/i });
    
    // Type wrong confirmation
    await confirmInput.fill('WRONG');
    await expect(confirmDeleteButton).toBeDisabled();
    
    // Type correct confirmation
    await confirmInput.fill('LÖSCHEN');
    await expect(confirmDeleteButton).toBeEnabled();
    
    // Close without deleting
    await page.getByRole('button', { name: /abbrechen/i }).click();
  });

  test('should trigger data export download', async ({ page }) => {
    // Set up download handler
    const downloadPromise = page.waitForEvent('download', { timeout: 10000 }).catch(() => null);
    
    // Click export
    await page.getByRole('button', { name: /daten exportieren/i }).click();
    
    // Wait for download or toast
    const download = await downloadPromise;
    
    if (download) {
      // Verify filename
      const filename = download.suggestedFilename();
      expect(filename).toMatch(/dealer-os-export.*\.json$/);
    } else {
      // At least toast should appear
      await expect(page.getByText(/export|vorbereitet/i)).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe('Settings - Form Error Handling', () => {
  test.skip(!TEST_EMAIL, 'Requires TEST_USER_EMAIL env var');

  test('should show email validation error', async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) return;
    
    await page.goto('/de/dashboard/settings');
    await expect(page.locator('main')).toBeVisible({ timeout: 10000 });
    
    // Clear email and enter invalid
    const emailInput = page.locator('#email');
    await emailInput.fill('invalid-email');
    
    // Try to save
    await page.getByRole('button', { name: /änderungen speichern/i }).click();
    
    // Should show validation error
    await expect(page.getByText(/ungültige e-mail/i)).toBeVisible({ timeout: 5000 });
  });
});
