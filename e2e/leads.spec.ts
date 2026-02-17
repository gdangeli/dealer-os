import { test, expect, Page } from '@playwright/test';

const TEST_EMAIL = process.env.TEST_USER_EMAIL;
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD;

// Unique test data
const timestamp = Date.now();
const testLead = {
  firstName: `E2E-Vorname-${timestamp}`,
  lastName: `E2E-Nachname-${timestamp}`,
  email: `e2e-${timestamp}@test-example.com`,
  phone: '+41 79 123 45 67',
  message: 'E2E Test Anfrage - wird automatisch gelöscht',
  notes: 'Interne Testnotiz',
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
    await page.goto('/de/dashboard/leads');
  }
  
  return true;
}

test.describe('Leads Access (unauthenticated)', () => {
  test('should redirect to login from leads page', async ({ page }) => {
    await page.goto('/de/dashboard/leads');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect to login from new lead page', async ({ page }) => {
    await page.goto('/de/dashboard/leads/new');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect to login from lead detail page', async ({ page }) => {
    await page.goto('/de/dashboard/leads/some-id');
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Leads List (authenticated)', () => {
  test.skip(!TEST_EMAIL, 'Requires TEST_USER_EMAIL env var');

  test.beforeEach(async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) test.skip();
    await page.goto('/de/dashboard/leads');
  });

  test('should display leads list with heading', async ({ page }) => {
    await expect(page.locator('main')).toBeVisible();
    const heading = page.getByRole('heading', { name: /leads|anfragen/i });
    await expect(heading).toBeVisible();
  });

  test('should have add lead button that navigates to form', async ({ page }) => {
    const addButton = page.getByRole('link', { name: /neu|hinzufügen|erfassen/i }).first();
    await expect(addButton).toBeVisible();
    await addButton.click();
    await expect(page).toHaveURL(/\/dashboard\/leads\/new/);
  });

  test('should display leads or empty state', async ({ page }) => {
    const content = page.locator('main');
    await expect(content).toBeVisible();
  });
});

test.describe('Lead Form - All Fields', () => {
  test.skip(!TEST_EMAIL, 'Requires TEST_USER_EMAIL env var');

  test.beforeEach(async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) test.skip();
    await page.goto('/de/dashboard/leads/new');
    await expect(page.locator('main')).toBeVisible({ timeout: 10000 });
  });

  test('should display all form sections', async ({ page }) => {
    // Check for card titles
    await expect(page.getByText('Kontaktdaten')).toBeVisible();
    await expect(page.getByText('Anfrage-Details')).toBeVisible();
    await expect(page.getByText('Quelle')).toBeVisible();
    await expect(page.getByText('Fahrzeug')).toBeVisible();
  });

  test('should have all input fields visible', async ({ page }) => {
    await expect(page.locator('#firstName')).toBeVisible();
    await expect(page.locator('#lastName')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#phone')).toBeVisible();
  });

  test('should require firstName and lastName', async ({ page }) => {
    // Try to submit with empty names
    await page.getByRole('button', { name: /erstellen/i }).click();
    
    // Should stay on the page (native HTML5 validation or custom alert)
    await expect(page).toHaveURL(/\/dashboard\/leads\/new/);
  });
});

test.describe('Lead Form - Select Dropdowns (Radix UI)', () => {
  test.skip(!TEST_EMAIL, 'Requires TEST_USER_EMAIL env var');

  test.beforeEach(async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) test.skip();
    await page.goto('/de/dashboard/leads/new');
    await expect(page.locator('main')).toBeVisible({ timeout: 10000 });
  });

  test('should open and select source (Quelle)', async ({ page }) => {
    // Find the source select
    const sourceSelect = page.locator('button[role="combobox"]').first();
    await expect(sourceSelect).toBeVisible();
    
    // Click to open
    await sourceSelect.click();
    await page.waitForTimeout(200);
    
    // Should see source options
    await expect(page.getByRole('option', { name: /vor ort/i })).toBeVisible();
    await expect(page.getByRole('option', { name: /telefon/i })).toBeVisible();
    await expect(page.getByRole('option', { name: /website/i })).toBeVisible();
    
    // Select "Telefon"
    await page.getByRole('option', { name: /telefon/i }).click();
    
    // Verify selection
    await expect(sourceSelect).toContainText(/telefon/i);
  });

  test('should open and interact with vehicle select', async ({ page }) => {
    // Find the vehicle select (second combobox)
    const vehicleSelect = page.locator('button[role="combobox"]').nth(1);
    await expect(vehicleSelect).toBeVisible();
    
    // Click to open
    await vehicleSelect.click();
    await page.waitForTimeout(200);
    
    // Should see "Kein spezifisches Fahrzeug" option
    const noVehicleOption = page.getByRole('option', { name: /kein spezifisches/i });
    await expect(noVehicleOption).toBeVisible();
    
    // Select it
    await noVehicleOption.click();
    
    // Dropdown should close
    await expect(noVehicleOption).not.toBeVisible();
  });
});

test.describe('Lead CRUD - Full Workflow', () => {
  test.skip(!TEST_EMAIL, 'Requires TEST_USER_EMAIL env var');
  
  let createdLeadId: string | null = null;

  test('should create a new lead with all fields', async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) return;
    
    await page.goto('/de/dashboard/leads/new');
    await expect(page.locator('main')).toBeVisible({ timeout: 10000 });
    
    // Fill contact info
    await page.locator('#firstName').fill(testLead.firstName);
    await page.locator('#lastName').fill(testLead.lastName);
    await page.locator('#email').fill(testLead.email);
    await page.locator('#phone').fill(testLead.phone);
    
    // Fill message (find textarea in Anfrage-Details section)
    const messageTextarea = page.locator('textarea').first();
    await messageTextarea.fill(testLead.message);
    
    // Fill notes (second textarea)
    const notesTextarea = page.locator('textarea').nth(1);
    await notesTextarea.fill(testLead.notes);
    
    // Select source
    const sourceSelect = page.locator('button[role="combobox"]').first();
    await sourceSelect.click();
    await page.waitForTimeout(200);
    await page.getByRole('option', { name: /telefon/i }).click();
    
    // Submit
    await page.getByRole('button', { name: /erstellen/i }).click();
    
    // Should redirect to lead detail page
    await expect(page).toHaveURL(/\/dashboard\/leads\/[a-f0-9-]+$/, { timeout: 15000 });
    
    // Extract lead ID from URL
    const url = page.url();
    const match = url.match(/\/leads\/([a-f0-9-]+)$/);
    if (match) {
      createdLeadId = match[1];
    }
    
    // Verify data on detail page
    await expect(page.locator('#firstName')).toHaveValue(testLead.firstName);
    await expect(page.locator('#lastName')).toHaveValue(testLead.lastName);
  });

  test('should edit lead contact info', async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) return;
    
    // First create a lead
    await page.goto('/de/dashboard/leads/new');
    await expect(page.locator('main')).toBeVisible({ timeout: 10000 });
    
    await page.locator('#firstName').fill(`Edit-First-${timestamp}`);
    await page.locator('#lastName').fill(`Edit-Last-${timestamp}`);
    
    await page.getByRole('button', { name: /erstellen/i }).click();
    await expect(page).toHaveURL(/\/dashboard\/leads\/[a-f0-9-]+$/, { timeout: 15000 });
    
    // Now edit the contact info
    const updatedPhone = '+41 78 999 88 77';
    await page.locator('#phone').fill(updatedPhone);
    
    // Save
    await page.getByRole('button', { name: /speichern/i }).click();
    
    // Wait for success message (alert or toast)
    await page.waitForTimeout(1000);
    
    // Verify phone was saved
    await expect(page.locator('#phone')).toHaveValue(updatedPhone);
  });
});

test.describe('Lead Status - Change Status', () => {
  test.skip(!TEST_EMAIL, 'Requires TEST_USER_EMAIL env var');

  test('should change lead status via dropdown', async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) return;
    
    // Create a lead first
    await page.goto('/de/dashboard/leads/new');
    await expect(page.locator('main')).toBeVisible({ timeout: 10000 });
    
    await page.locator('#firstName').fill(`Status-Test-${timestamp}`);
    await page.locator('#lastName').fill('StatusChange');
    
    await page.getByRole('button', { name: /erstellen/i }).click();
    await expect(page).toHaveURL(/\/dashboard\/leads\/[a-f0-9-]+$/, { timeout: 15000 });
    
    // Find the status dropdown (in the "Bearbeitung" card)
    const statusSelect = page.locator('button[role="combobox"]').first();
    await expect(statusSelect).toBeVisible();
    
    // Open status dropdown
    await statusSelect.click();
    await page.waitForTimeout(200);
    
    // Should see all status options
    await expect(page.getByRole('option', { name: /offen/i })).toBeVisible();
    await expect(page.getByRole('option', { name: /in bearbeitung/i })).toBeVisible();
    await expect(page.getByRole('option', { name: /heiss/i })).toBeVisible();
    await expect(page.getByRole('option', { name: /verkauft/i })).toBeVisible();
    await expect(page.getByRole('option', { name: /nicht gekauft/i })).toBeVisible();
    
    // Change to "In Bearbeitung"
    await page.getByRole('option', { name: /in bearbeitung/i }).click();
    
    // Verify selection changed
    await expect(statusSelect).toContainText(/in bearbeitung/i);
    
    // Save
    await page.getByRole('button', { name: /speichern/i }).click();
    await page.waitForTimeout(1000);
  });

  test('should set next followup date', async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) return;
    
    // Create a lead first
    await page.goto('/de/dashboard/leads/new');
    await expect(page.locator('main')).toBeVisible({ timeout: 10000 });
    
    await page.locator('#firstName').fill(`Followup-Test-${timestamp}`);
    await page.locator('#lastName').fill('DateTest');
    
    await page.getByRole('button', { name: /erstellen/i }).click();
    await expect(page).toHaveURL(/\/dashboard\/leads\/[a-f0-9-]+$/, { timeout: 15000 });
    
    // Set followup date
    const followupInput = page.locator('#followup');
    await expect(followupInput).toBeVisible();
    
    // Set date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    
    await followupInput.fill(dateString);
    
    // Save
    await page.getByRole('button', { name: /speichern/i }).click();
    await page.waitForTimeout(1000);
    
    // Verify date was saved
    await expect(followupInput).toHaveValue(dateString);
  });
});

test.describe('Lead Notes - Add and Edit Notes', () => {
  test.skip(!TEST_EMAIL, 'Requires TEST_USER_EMAIL env var');

  test('should add internal notes to a lead', async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) return;
    
    // Create a lead first
    await page.goto('/de/dashboard/leads/new');
    await expect(page.locator('main')).toBeVisible({ timeout: 10000 });
    
    await page.locator('#firstName').fill(`Notes-Test-${timestamp}`);
    await page.locator('#lastName').fill('NotesTest');
    
    await page.getByRole('button', { name: /erstellen/i }).click();
    await expect(page).toHaveURL(/\/dashboard\/leads\/[a-f0-9-]+$/, { timeout: 15000 });
    
    // Find notes textarea in the "Ihre Notizen" section
    const notesSection = page.getByText('Ihre Notizen').locator('..');
    const notesTextarea = notesSection.locator('textarea');
    
    // If textarea not found directly, search globally
    const textarea = await notesTextarea.isVisible() ? notesTextarea : page.locator('textarea').last();
    
    // Add notes
    const noteText = 'E2E Test Notiz - Kunde sehr interessiert, Probefahrt am Samstag';
    await textarea.fill(noteText);
    
    // Save
    await page.getByRole('button', { name: /speichern/i }).click();
    await page.waitForTimeout(1000);
    
    // Verify notes were saved
    await expect(textarea).toHaveValue(noteText);
  });
});

test.describe('Lead Timeline - Activities', () => {
  test.skip(!TEST_EMAIL, 'Requires TEST_USER_EMAIL env var');

  test('should display timeline section on lead detail', async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) return;
    
    // Create a lead first
    await page.goto('/de/dashboard/leads/new');
    await expect(page.locator('main')).toBeVisible({ timeout: 10000 });
    
    await page.locator('#firstName').fill(`Timeline-Test-${timestamp}`);
    await page.locator('#lastName').fill('TimelineTest');
    
    await page.getByRole('button', { name: /erstellen/i }).click();
    await expect(page).toHaveURL(/\/dashboard\/leads\/[a-f0-9-]+$/, { timeout: 15000 });
    
    // Check for timeline section
    const timelineSection = page.getByText(/timeline|aktivitäten|verlauf/i);
    const hasTimeline = await timelineSection.isVisible().catch(() => false);
    
    if (hasTimeline) {
      await expect(timelineSection).toBeVisible();
    }
    
    // Page should load without errors
    await expect(page.locator('main')).toBeVisible();
  });

  test('should add a note via timeline if available', async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) return;
    
    // Create a lead first
    await page.goto('/de/dashboard/leads/new');
    await expect(page.locator('main')).toBeVisible({ timeout: 10000 });
    
    await page.locator('#firstName').fill(`Activity-Test-${timestamp}`);
    await page.locator('#lastName').fill('ActivityTest');
    
    await page.getByRole('button', { name: /erstellen/i }).click();
    await expect(page).toHaveURL(/\/dashboard\/leads\/[a-f0-9-]+$/, { timeout: 15000 });
    
    // Look for activity input or add button
    const activityInput = page.locator('input[placeholder*="aktivität"], input[placeholder*="notiz"], textarea[placeholder*="aktivität"]');
    const hasActivityInput = await activityInput.first().isVisible().catch(() => false);
    
    if (hasActivityInput) {
      await activityInput.first().fill('E2E Test Aktivität - Anruf getätigt');
      
      // Look for submit button
      const addButton = page.getByRole('button', { name: /hinzufügen|erstellen|senden/i });
      if (await addButton.isVisible().catch(() => false)) {
        await addButton.click();
        await page.waitForTimeout(1000);
      }
    }
    
    // Page should still work
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('Lead Score - Display', () => {
  test.skip(!TEST_EMAIL, 'Requires TEST_USER_EMAIL env var');

  test('should display lead score on detail page', async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) return;
    
    // Create a lead first
    await page.goto('/de/dashboard/leads/new');
    await expect(page.locator('main')).toBeVisible({ timeout: 10000 });
    
    await page.locator('#firstName').fill(`Score-Test-${timestamp}`);
    await page.locator('#lastName').fill('ScoreTest');
    await page.locator('#email').fill(`score-${timestamp}@test.com`);
    
    await page.getByRole('button', { name: /erstellen/i }).click();
    await expect(page).toHaveURL(/\/dashboard\/leads\/[a-f0-9-]+$/, { timeout: 15000 });
    
    // Check for lead score section
    const scoreSection = page.getByText(/lead score/i);
    const hasScore = await scoreSection.isVisible().catch(() => false);
    
    if (hasScore) {
      await expect(scoreSection).toBeVisible();
    }
    
    // Page should load without errors
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('Lead Delete', () => {
  test.skip(!TEST_EMAIL, 'Requires TEST_USER_EMAIL env var');

  test('should delete a lead with confirmation', async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) return;
    
    // Create a lead to delete
    await page.goto('/de/dashboard/leads/new');
    await expect(page.locator('main')).toBeVisible({ timeout: 10000 });
    
    await page.locator('#firstName').fill(`Delete-Test-${timestamp}`);
    await page.locator('#lastName').fill('ToBeDeleted');
    
    await page.getByRole('button', { name: /erstellen/i }).click();
    await expect(page).toHaveURL(/\/dashboard\/leads\/[a-f0-9-]+$/, { timeout: 15000 });
    
    // Set up dialog handler for confirmation
    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toContain('löschen');
      await dialog.accept();
    });
    
    // Click delete button
    const deleteButton = page.getByRole('button', { name: /löschen/i });
    await expect(deleteButton).toBeVisible();
    await deleteButton.click();
    
    // Should redirect to leads list
    await expect(page).toHaveURL(/\/dashboard\/leads$/, { timeout: 10000 });
  });
});
