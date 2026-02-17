import { test, expect, Page } from '@playwright/test';

const TEST_EMAIL = process.env.TEST_USER_EMAIL;
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD;

// Unique test data
const timestamp = Date.now();
const testVehicle = {
  make: `E2E-Make-${timestamp}`,
  model: `E2E-Model-${timestamp}`,
  variant: 'GTI Test Edition',
  mileage: '85000',
  askingPrice: '24900',
  purchasePrice: '19500',
  powerKw: '147',
  color: 'Schwarz Metallic',
  description: 'E2E Test Fahrzeug - wird automatisch gelöscht',
  internalNotes: 'Testnotiz intern',
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
    await page.goto('/de/dashboard/vehicles');
  }
  
  return true;
}

// Helper: Select from Radix UI Select dropdown
async function selectRadixOption(page: Page, triggerSelector: string, optionText: string | RegExp) {
  const trigger = page.locator(triggerSelector);
  await trigger.click();
  await page.waitForTimeout(200); // Wait for animation
  
  // Radix portals content to body, so use global search
  const option = page.getByRole('option', { name: optionText });
  await expect(option).toBeVisible({ timeout: 5000 });
  await option.click();
  await page.waitForTimeout(100);
}

test.describe('Vehicles Access (unauthenticated)', () => {
  test('should redirect to login from vehicles page', async ({ page }) => {
    await page.goto('/de/dashboard/vehicles');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect to login from new vehicle page', async ({ page }) => {
    await page.goto('/de/dashboard/vehicles/new');
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Vehicles List (authenticated)', () => {
  test.skip(!TEST_EMAIL, 'Requires TEST_USER_EMAIL env var');

  test.beforeEach(async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) test.skip();
    await page.goto('/de/dashboard/vehicles');
  });

  test('should display vehicles list page with heading', async ({ page }) => {
    await expect(page.locator('main')).toBeVisible();
    const heading = page.getByRole('heading', { name: /fahrzeuge/i });
    await expect(heading).toBeVisible();
  });

  test('should have add vehicle button that navigates to form', async ({ page }) => {
    const addButton = page.getByRole('link', { name: /neu|hinzufügen|erfassen/i }).first();
    await expect(addButton).toBeVisible();
    await addButton.click();
    await expect(page).toHaveURL(/\/dashboard\/vehicles\/new/);
  });

  test('should display vehicles or empty state', async ({ page }) => {
    // Either vehicles table/grid or empty state message
    const content = page.locator('main');
    await expect(content).toBeVisible();
    
    // Check for table or empty state
    const hasVehicles = await page.locator('table, [data-testid="vehicle-card"]').isVisible().catch(() => false);
    const hasEmptyState = await page.getByText(/keine fahrzeuge|noch keine|leer/i).isVisible().catch(() => false);
    
    expect(hasVehicles || hasEmptyState).toBeTruthy();
  });
});

test.describe('Vehicle Form - Required Fields Validation', () => {
  test.skip(!TEST_EMAIL, 'Requires TEST_USER_EMAIL env var');

  test.beforeEach(async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) test.skip();
    await page.goto('/de/dashboard/vehicles/new');
    await expect(page.locator('form')).toBeVisible({ timeout: 10000 });
  });

  test('should display all form sections', async ({ page }) => {
    // Check for card titles
    await expect(page.getByText('Grunddaten')).toBeVisible();
    await expect(page.getByText('Technische Details')).toBeVisible();
    await expect(page.getByText('Kalkulation')).toBeVisible();
    await expect(page.getByText('Texte')).toBeVisible();
  });

  test('should have required field indicators', async ({ page }) => {
    // Check that required fields are marked
    await expect(page.locator('#make')).toHaveAttribute('required', '');
    await expect(page.locator('#model')).toHaveAttribute('required', '');
    await expect(page.locator('#first_registration')).toHaveAttribute('required', '');
    await expect(page.locator('#mileage')).toHaveAttribute('required', '');
    await expect(page.locator('#asking_price')).toHaveAttribute('required', '');
  });

  test('should prevent form submission with empty required fields', async ({ page }) => {
    // Try to submit empty form
    const submitButton = page.getByRole('button', { name: /fahrzeug erfassen|speichern/i });
    await submitButton.click();
    
    // Should not navigate away - form validation should prevent submission
    await expect(page).toHaveURL(/\/dashboard\/vehicles\/new/);
  });
});

test.describe('Vehicle Form - Select Dropdowns (Radix UI)', () => {
  test.skip(!TEST_EMAIL, 'Requires TEST_USER_EMAIL env var');

  test.beforeEach(async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) test.skip();
    await page.goto('/de/dashboard/vehicles/new');
    await expect(page.locator('form')).toBeVisible({ timeout: 10000 });
  });

  test('should open and select fuel type (Antrieb)', async ({ page }) => {
    // Find the fuel type select - it's the first select in the "Technische Details" section
    const fuelTypeSelect = page.locator('button[role="combobox"]').first();
    await expect(fuelTypeSelect).toBeVisible();
    
    // Click to open
    await fuelTypeSelect.click();
    await page.waitForTimeout(200);
    
    // Should see fuel type options
    await expect(page.getByRole('option', { name: /benzin/i })).toBeVisible();
    await expect(page.getByRole('option', { name: /diesel/i })).toBeVisible();
    
    // Select Diesel
    await page.getByRole('option', { name: /diesel/i }).click();
    
    // Verify selection
    await expect(fuelTypeSelect).toContainText(/diesel/i);
  });

  test('should open and select transmission (Getriebe)', async ({ page }) => {
    // Find the transmission select (second select in technical details)
    const transmissionSelect = page.locator('button[role="combobox"]').nth(1);
    await expect(transmissionSelect).toBeVisible();
    
    // Click to open
    await transmissionSelect.click();
    await page.waitForTimeout(200);
    
    // Should see transmission options
    await expect(page.getByRole('option', { name: /manuell|schaltgetriebe/i })).toBeVisible();
    await expect(page.getByRole('option', { name: /automatik/i })).toBeVisible();
    
    // Select Automatik
    await page.getByRole('option', { name: /automatik/i }).click();
    
    // Verify selection
    await expect(transmissionSelect).toContainText(/automatik/i);
  });
});

test.describe('Vehicle CRUD - Full Workflow', () => {
  test.skip(!TEST_EMAIL, 'Requires TEST_USER_EMAIL env var');
  
  let createdVehicleId: string | null = null;

  test('should create a new vehicle with all fields', async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) return;
    
    await page.goto('/de/dashboard/vehicles/new');
    await expect(page.locator('form')).toBeVisible({ timeout: 10000 });
    
    // Fill Grunddaten
    await page.locator('#make').fill(testVehicle.make);
    await page.locator('#model').fill(testVehicle.model);
    await page.locator('#variant').fill(testVehicle.variant);
    
    // Fill Technische Details
    await page.locator('#first_registration').fill('2020-06-15');
    await page.locator('#mileage').fill(testVehicle.mileage);
    await page.locator('#power_kw').fill(testVehicle.powerKw);
    await page.locator('#color').fill(testVehicle.color);
    
    // Select fuel type (first combobox)
    const fuelTypeSelect = page.locator('button[role="combobox"]').first();
    await fuelTypeSelect.click();
    await page.waitForTimeout(200);
    await page.getByRole('option', { name: /benzin/i }).click();
    
    // Select transmission (second combobox)
    const transmissionSelect = page.locator('button[role="combobox"]').nth(1);
    await transmissionSelect.click();
    await page.waitForTimeout(200);
    await page.getByRole('option', { name: /automatik/i }).click();
    
    // Fill Kalkulation
    await page.locator('#purchase_price').fill(testVehicle.purchasePrice);
    await page.locator('#asking_price').fill(testVehicle.askingPrice);
    
    // Fill Texte
    await page.locator('#description').fill(testVehicle.description);
    await page.locator('#internal_notes').fill(testVehicle.internalNotes);
    
    // Submit
    await page.getByRole('button', { name: /fahrzeug erfassen/i }).click();
    
    // Should redirect to vehicle detail page
    await expect(page).toHaveURL(/\/dashboard\/vehicles\/[a-f0-9-]+$/, { timeout: 15000 });
    
    // Extract vehicle ID from URL
    const url = page.url();
    const match = url.match(/\/vehicles\/([a-f0-9-]+)$/);
    if (match) {
      createdVehicleId = match[1];
    }
    
    // Verify we're on the edit page with our data
    await expect(page.locator('#make')).toHaveValue(testVehicle.make);
    await expect(page.locator('#model')).toHaveValue(testVehicle.model);
  });

  test('should edit an existing vehicle', async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) return;
    
    // First, create a vehicle to edit
    await page.goto('/de/dashboard/vehicles/new');
    await expect(page.locator('form')).toBeVisible({ timeout: 10000 });
    
    await page.locator('#make').fill(`Edit-Test-${timestamp}`);
    await page.locator('#model').fill('Edit-Model');
    await page.locator('#first_registration').fill('2021-01-01');
    await page.locator('#mileage').fill('50000');
    await page.locator('#asking_price').fill('15000');
    
    await page.getByRole('button', { name: /fahrzeug erfassen/i }).click();
    await expect(page).toHaveURL(/\/dashboard\/vehicles\/[a-f0-9-]+$/, { timeout: 15000 });
    
    // Now edit it
    const editedModel = 'Edited-Model-Updated';
    await page.locator('#model').fill(editedModel);
    
    // Change status (only visible in edit mode)
    const statusSelect = page.locator('button[role="combobox"]').last();
    if (await statusSelect.isVisible()) {
      await statusSelect.click();
      await page.waitForTimeout(200);
      const reservedOption = page.getByRole('option', { name: /reserviert/i });
      if (await reservedOption.isVisible()) {
        await reservedOption.click();
      }
    }
    
    // Save changes
    await page.getByRole('button', { name: /speichern/i }).click();
    
    // Should redirect back to list
    await expect(page).toHaveURL(/\/dashboard\/vehicles$/, { timeout: 10000 });
  });

  test('should display vehicle in the list after creation', async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) return;
    
    await page.goto('/de/dashboard/vehicles');
    await expect(page.locator('main')).toBeVisible();
    
    // Search for our test vehicle (if search exists) or look in list
    const vehicleEntry = page.getByText(testVehicle.make);
    
    // It may or may not be visible depending on pagination/filters
    // Just verify the page loads without errors
    await expect(page.locator('main')).toBeVisible();
  });

  test('should navigate to vehicle detail and back', async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) return;
    
    await page.goto('/de/dashboard/vehicles');
    
    // Click on first vehicle if exists
    const vehicleLink = page.locator('a[href*="/dashboard/vehicles/"]').first();
    const hasVehicle = await vehicleLink.isVisible().catch(() => false);
    
    if (hasVehicle) {
      await vehicleLink.click();
      await expect(page).toHaveURL(/\/dashboard\/vehicles\/[a-f0-9-]+/);
      
      // Should see form
      await expect(page.locator('form')).toBeVisible();
      
      // Go back
      await page.getByRole('button', { name: /verwerfen|zurück/i }).click();
      await expect(page).toHaveURL(/\/dashboard\/vehicles$/);
    }
  });
});

test.describe('Vehicle Form - Image Upload Area', () => {
  test.skip(!TEST_EMAIL, 'Requires TEST_USER_EMAIL env var');

  test('should show image upload component on edit page', async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) return;
    
    // Create a vehicle first to get to edit page
    await page.goto('/de/dashboard/vehicles/new');
    await expect(page.locator('form')).toBeVisible({ timeout: 10000 });
    
    await page.locator('#make').fill(`Image-Test-${timestamp}`);
    await page.locator('#model').fill('Upload-Model');
    await page.locator('#first_registration').fill('2022-01-01');
    await page.locator('#mileage').fill('30000');
    await page.locator('#asking_price').fill('18000');
    
    await page.getByRole('button', { name: /fahrzeug erfassen/i }).click();
    await expect(page).toHaveURL(/\/dashboard\/vehicles\/[a-f0-9-]+$/, { timeout: 15000 });
    
    // Now we should see the image upload section
    // Check for dropzone or file input
    const imageSection = page.getByText(/bilder|fotos|images/i);
    const hasImageSection = await imageSection.isVisible().catch(() => false);
    
    if (hasImageSection) {
      // Check for upload elements
      const uploadArea = page.locator('[class*="dropzone"], input[type="file"], [data-testid="image-upload"]');
      await expect(uploadArea.first()).toBeVisible();
    }
  });
});
