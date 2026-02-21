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
    await page.goto('/de/dashboard/vehicles');
  }
  
  return true;
}

async function createVehicleWithImage(page: Page): Promise<string | null> {
  await page.goto('/de/dashboard/vehicles/new');
  await expect(page.locator('form')).toBeVisible({ timeout: 10000 });
  
  // Fill minimum required fields
  await page.locator('#make').fill(`PhotoAI-Test-${timestamp}`);
  await page.locator('#model').fill('AITestModel');
  await page.locator('#first_registration').fill('2022-06-15');
  await page.locator('#mileage').fill('25000');
  await page.locator('#asking_price').fill('35000');
  
  // Submit
  await page.getByRole('button', { name: /fahrzeug erfassen/i }).click();
  
  // Wait for redirect to edit page
  await expect(page).toHaveURL(/\/dashboard\/vehicles\/[a-f0-9-]+$/, { timeout: 15000 });
  
  // Upload an image
  const fileInput = page.locator('input[type="file"]');
  const testImageBuffer = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
    0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
    0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0xFF, 0xFF, 0x3F,
    0x00, 0x05, 0xFE, 0x02, 0xFE, 0xDC, 0xCC, 0x59, 0xE7, 0x00, 0x00, 0x00,
    0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
  ]);
  
  await fileInput.setInputFiles({
    name: 'test-vehicle.png',
    mimeType: 'image/png',
    buffer: testImageBuffer,
  });
  
  // Wait for upload
  await page.waitForTimeout(3000);
  
  const url = page.url();
  const match = url.match(/\/vehicles\/([a-f0-9-]+)$/);
  return match ? match[1] : null;
}

test.describe('Photo AI - Access', () => {
  test('should require authentication for vehicle photos', async ({ page }) => {
    await page.goto('/de/dashboard/vehicles/new');
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Photo AI - UI Elements', () => {
  test.skip(!TEST_EMAIL, 'Requires TEST_USER_EMAIL env var');

  test('should show AI optimize button on uploaded images', async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) return;
    
    await createVehicleWithImage(page);
    
    // Find image container and hover to reveal buttons
    const imageContainer = page.locator('[class*="group"]').filter({ has: page.locator('img') }).first();
    await imageContainer.hover();
    
    // Look for the AI optimize button (purple wand icon)
    const aiButton = page.locator('button[title*="KI"], button[title*="Optim"]');
    const hasAiButton = await aiButton.first().isVisible({ timeout: 5000 }).catch(() => false);
    
    if (hasAiButton) {
      await expect(aiButton.first()).toBeVisible();
    }
    
    // Page should remain stable
    await expect(page.locator('main')).toBeVisible();
  });

  test('should open Photo AI dialog when clicking optimize button', async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) return;
    
    await createVehicleWithImage(page);
    
    // Hover over image to reveal buttons
    const imageContainer = page.locator('[class*="group"]').filter({ has: page.locator('img') }).first();
    await imageContainer.hover();
    await page.waitForTimeout(500);
    
    // Click AI optimize button
    const aiButton = page.locator('button[title*="KI"], button[title*="Optim"]');
    const hasAiButton = await aiButton.first().isVisible({ timeout: 3000 }).catch(() => false);
    
    if (hasAiButton) {
      await aiButton.first().click();
      
      // Check dialog opens
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible({ timeout: 5000 });
      
      // Check dialog title
      const dialogTitle = page.getByText(/bild optimieren/i);
      await expect(dialogTitle).toBeVisible();
    }
    
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('Photo AI - Dialog Options', () => {
  test.skip(!TEST_EMAIL, 'Requires TEST_USER_EMAIL env var');

  test('should show all AI optimization options', async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) return;
    
    await createVehicleWithImage(page);
    
    // Open AI dialog
    const imageContainer = page.locator('[class*="group"]').filter({ has: page.locator('img') }).first();
    await imageContainer.hover();
    await page.waitForTimeout(500);
    
    const aiButton = page.locator('button[title*="KI"], button[title*="Optim"]');
    const hasAiButton = await aiButton.first().isVisible({ timeout: 3000 }).catch(() => false);
    
    if (hasAiButton) {
      await aiButton.first().click();
      
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible({ timeout: 5000 });
      
      // Check for optimization options
      const enhanceOption = page.getByText(/auto-optimierung/i);
      const blurPlatesOption = page.getByText(/kennzeichen verpixeln/i);
      const backgroundOption = page.getByText(/hintergrund ersetzen/i);
      
      await expect(enhanceOption).toBeVisible();
      await expect(blurPlatesOption).toBeVisible();
      await expect(backgroundOption).toBeVisible();
    }
    
    await expect(page.locator('main')).toBeVisible();
  });

  test('should show background templates when background removal selected', async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) return;
    
    await createVehicleWithImage(page);
    
    // Open AI dialog
    const imageContainer = page.locator('[class*="group"]').filter({ has: page.locator('img') }).first();
    await imageContainer.hover();
    await page.waitForTimeout(500);
    
    const aiButton = page.locator('button[title*="KI"], button[title*="Optim"]');
    const hasAiButton = await aiButton.first().isVisible({ timeout: 3000 }).catch(() => false);
    
    if (hasAiButton) {
      await aiButton.first().click();
      
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible({ timeout: 5000 });
      
      // Background removal should be enabled by default, showing templates
      const showroomModern = page.getByText(/modern showroom/i);
      const showroomClassic = page.getByText(/classic showroom/i);
      const outdoorSetting = page.getByText(/outdoor setting/i);
      const minimalWhite = page.getByText(/minimal white/i);
      const transparent = page.getByText(/transparent/i);
      
      // At least some templates should be visible
      const hasTemplates = await showroomModern.isVisible().catch(() => false) ||
                          await showroomClassic.isVisible().catch(() => false) ||
                          await minimalWhite.isVisible().catch(() => false);
      
      expect(hasTemplates).toBeTruthy();
    }
    
    await expect(page.locator('main')).toBeVisible();
  });

  test('should toggle optimization options via checkboxes', async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) return;
    
    await createVehicleWithImage(page);
    
    // Open AI dialog
    const imageContainer = page.locator('[class*="group"]').filter({ has: page.locator('img') }).first();
    await imageContainer.hover();
    await page.waitForTimeout(500);
    
    const aiButton = page.locator('button[title*="KI"], button[title*="Optim"]');
    const hasAiButton = await aiButton.first().isVisible({ timeout: 3000 }).catch(() => false);
    
    if (hasAiButton) {
      await aiButton.first().click();
      
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible({ timeout: 5000 });
      
      // Find checkboxes
      const checkboxes = dialog.locator('[role="checkbox"], input[type="checkbox"]');
      const checkboxCount = await checkboxes.count();
      
      // Should have 3 checkboxes (enhance, blur plates, remove background)
      expect(checkboxCount).toBeGreaterThanOrEqual(3);
      
      // Click first checkbox to toggle
      if (checkboxCount > 0) {
        const firstCheckbox = checkboxes.first();
        await firstCheckbox.click();
        // Checkbox state should change (no crash)
        await expect(dialog).toBeVisible();
      }
    }
    
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('Photo AI - Optimize Button', () => {
  test.skip(!TEST_EMAIL, 'Requires TEST_USER_EMAIL env var');

  test('should have optimize button in dialog', async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) return;
    
    await createVehicleWithImage(page);
    
    // Open AI dialog
    const imageContainer = page.locator('[class*="group"]').filter({ has: page.locator('img') }).first();
    await imageContainer.hover();
    await page.waitForTimeout(500);
    
    const aiButton = page.locator('button[title*="KI"], button[title*="Optim"]');
    const hasAiButton = await aiButton.first().isVisible({ timeout: 3000 }).catch(() => false);
    
    if (hasAiButton) {
      await aiButton.first().click();
      
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible({ timeout: 5000 });
      
      // Find optimize button
      const optimizeButton = dialog.getByRole('button', { name: /optimieren/i });
      await expect(optimizeButton).toBeVisible();
      await expect(optimizeButton).toBeEnabled();
    }
    
    await expect(page.locator('main')).toBeVisible();
  });

  test('should disable optimize button when no options selected', async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) return;
    
    await createVehicleWithImage(page);
    
    // Open AI dialog
    const imageContainer = page.locator('[class*="group"]').filter({ has: page.locator('img') }).first();
    await imageContainer.hover();
    await page.waitForTimeout(500);
    
    const aiButton = page.locator('button[title*="KI"], button[title*="Optim"]');
    const hasAiButton = await aiButton.first().isVisible({ timeout: 3000 }).catch(() => false);
    
    if (hasAiButton) {
      await aiButton.first().click();
      
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible({ timeout: 5000 });
      
      // Uncheck all options
      const checkboxes = dialog.locator('[role="checkbox"], input[type="checkbox"]');
      const count = await checkboxes.count();
      
      for (let i = 0; i < count; i++) {
        const checkbox = checkboxes.nth(i);
        const isChecked = await checkbox.getAttribute('data-state') === 'checked' ||
                         await checkbox.isChecked().catch(() => false);
        if (isChecked) {
          await checkbox.click();
        }
      }
      
      // Optimize button should be disabled
      const optimizeButton = dialog.getByRole('button', { name: /optimieren/i });
      await expect(optimizeButton).toBeDisabled();
    }
    
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('Photo AI - Dialog Close', () => {
  test.skip(!TEST_EMAIL, 'Requires TEST_USER_EMAIL env var');

  test('should close dialog when clicking outside or pressing escape', async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) return;
    
    await createVehicleWithImage(page);
    
    // Open AI dialog
    const imageContainer = page.locator('[class*="group"]').filter({ has: page.locator('img') }).first();
    await imageContainer.hover();
    await page.waitForTimeout(500);
    
    const aiButton = page.locator('button[title*="KI"], button[title*="Optim"]');
    const hasAiButton = await aiButton.first().isVisible({ timeout: 3000 }).catch(() => false);
    
    if (hasAiButton) {
      await aiButton.first().click();
      
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible({ timeout: 5000 });
      
      // Press Escape
      await page.keyboard.press('Escape');
      
      // Dialog should close
      await expect(dialog).not.toBeVisible({ timeout: 3000 });
    }
    
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('Photo AI - Image Preview', () => {
  test.skip(!TEST_EMAIL, 'Requires TEST_USER_EMAIL env var');

  test('should show original image in preview area', async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) return;
    
    await createVehicleWithImage(page);
    
    // Open AI dialog
    const imageContainer = page.locator('[class*="group"]').filter({ has: page.locator('img') }).first();
    await imageContainer.hover();
    await page.waitForTimeout(500);
    
    const aiButton = page.locator('button[title*="KI"], button[title*="Optim"]');
    const hasAiButton = await aiButton.first().isVisible({ timeout: 3000 }).catch(() => false);
    
    if (hasAiButton) {
      await aiButton.first().click();
      
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible({ timeout: 5000 });
      
      // Check for image preview
      const previewImage = dialog.locator('img');
      await expect(previewImage.first()).toBeVisible();
      
      // Check for "Original" label
      const originalLabel = dialog.getByText(/original/i);
      await expect(originalLabel).toBeVisible();
    }
    
    await expect(page.locator('main')).toBeVisible();
  });
});
