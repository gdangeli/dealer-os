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
    await page.goto('/de/dashboard/settings');
  }
  
  return true;
}

test.describe('Website Widget Feature', () => {
  test.describe('Widget Settings Tab', () => {
    test.skip(!TEST_EMAIL, 'Requires TEST_USER_EMAIL env var');

    test.beforeEach(async ({ page }) => {
      const loggedIn = await login(page);
      if (!loggedIn) test.skip();
      await page.goto('/de/dashboard/settings');
      await expect(page.locator('main')).toBeVisible({ timeout: 10000 });
    });

    test('should display Widget tab in settings', async ({ page }) => {
      const widgetTab = page.getByRole('tab', { name: /widget/i });
      await expect(widgetTab).toBeVisible();
    });

    test('should show widget enable/disable toggle', async ({ page }) => {
      await page.getByRole('tab', { name: /widget/i }).click();
      
      // Should show the main widget card
      await expect(page.getByText(/website-widget/i)).toBeVisible();
      await expect(page.getByText(/widget aktivieren/i)).toBeVisible();
      
      // Should have a switch to enable/disable
      const widgetSwitch = page.locator('button[role="switch"]').first();
      await expect(widgetSwitch).toBeVisible();
    });

    test('should show styling options when widget is enabled', async ({ page }) => {
      await page.getByRole('tab', { name: /widget/i }).click();
      
      // Enable widget if not already
      const widgetSwitch = page.locator('button[role="switch"]').first();
      const isEnabled = await widgetSwitch.getAttribute('data-state') === 'checked';
      
      if (!isEnabled) {
        await widgetSwitch.click();
      }
      
      // Check for styling options
      await expect(page.getByText(/styling/i)).toBeVisible();
      await expect(page.getByText(/primärfarbe/i)).toBeVisible();
      await expect(page.getByText(/schriftart/i)).toBeVisible();
      await expect(page.getByText(/button-stil/i)).toBeVisible();
      await expect(page.getByText(/layout/i)).toBeVisible();
    });

    test('should have color picker for primary color', async ({ page }) => {
      await page.getByRole('tab', { name: /widget/i }).click();
      
      // Enable widget
      const widgetSwitch = page.locator('button[role="switch"]').first();
      if (await widgetSwitch.getAttribute('data-state') !== 'checked') {
        await widgetSwitch.click();
      }
      
      // Color input should exist
      const colorInput = page.locator('#primary_color');
      await expect(colorInput).toBeVisible();
    });

    test('should have font family selector', async ({ page }) => {
      await page.getByRole('tab', { name: /widget/i }).click();
      
      // Enable widget
      const widgetSwitch = page.locator('button[role="switch"]').first();
      if (await widgetSwitch.getAttribute('data-state') !== 'checked') {
        await widgetSwitch.click();
      }
      
      // Click font selector
      const fontSelect = page.locator('button[role="combobox"]').filter({ hasText: /system|inter|roboto|open sans|lato/i });
      await expect(fontSelect.first()).toBeVisible();
    });

    test('should have layout selector with grid/list/slider options', async ({ page }) => {
      await page.getByRole('tab', { name: /widget/i }).click();
      
      // Enable widget
      const widgetSwitch = page.locator('button[role="switch"]').first();
      if (await widgetSwitch.getAttribute('data-state') !== 'checked') {
        await widgetSwitch.click();
      }
      
      // Find layout selector and open it
      const layoutSelect = page.locator('button[role="combobox"]').filter({ hasText: /kacheln|liste|slider/i });
      await expect(layoutSelect.first()).toBeVisible();
    });

    test('should have dark mode toggle', async ({ page }) => {
      await page.getByRole('tab', { name: /widget/i }).click();
      
      // Enable widget
      const widgetSwitch = page.locator('button[role="switch"]').first();
      if (await widgetSwitch.getAttribute('data-state') !== 'checked') {
        await widgetSwitch.click();
      }
      
      await expect(page.getByText(/dunkler modus/i)).toBeVisible();
    });

    test('should have show price toggle', async ({ page }) => {
      await page.getByRole('tab', { name: /widget/i }).click();
      
      // Enable widget
      const widgetSwitch = page.locator('button[role="switch"]').first();
      if (await widgetSwitch.getAttribute('data-state') !== 'checked') {
        await widgetSwitch.click();
      }
      
      await expect(page.getByText(/preise anzeigen/i)).toBeVisible();
    });

    test('should show embed code section when enabled', async ({ page }) => {
      await page.getByRole('tab', { name: /widget/i }).click();
      
      // Enable widget
      const widgetSwitch = page.locator('button[role="switch"]').first();
      if (await widgetSwitch.getAttribute('data-state') !== 'checked') {
        await widgetSwitch.click();
      }
      
      // Embed code section
      await expect(page.getByText(/embed-code/i)).toBeVisible();
      
      // Should have textarea with iframe code
      const codeArea = page.locator('textarea').filter({ hasText: /iframe/i });
      await expect(codeArea).toBeVisible();
      
      // Should have copy button
      await expect(page.getByRole('button', { name: /kopieren/i })).toBeVisible();
    });

    test('should copy embed code to clipboard', async ({ page }) => {
      await page.getByRole('tab', { name: /widget/i }).click();
      
      // Enable widget
      const widgetSwitch = page.locator('button[role="switch"]').first();
      if (await widgetSwitch.getAttribute('data-state') !== 'checked') {
        await widgetSwitch.click();
      }
      
      // Click copy button
      const copyButton = page.getByRole('button', { name: /kopieren/i });
      await copyButton.click();
      
      // Should show success feedback
      await expect(page.getByText(/kopiert/i)).toBeVisible({ timeout: 3000 });
    });

    test('should show preview section', async ({ page }) => {
      await page.getByRole('tab', { name: /widget/i }).click();
      
      // Enable widget
      const widgetSwitch = page.locator('button[role="switch"]').first();
      if (await widgetSwitch.getAttribute('data-state') !== 'checked') {
        await widgetSwitch.click();
      }
      
      // Preview section
      await expect(page.getByText(/vorschau/i)).toBeVisible();
      
      // Should have iframe preview
      const previewIframe = page.locator('iframe[src*="embed"]');
      await expect(previewIframe).toBeVisible();
    });

    test('should save widget settings', async ({ page }) => {
      await page.getByRole('tab', { name: /widget/i }).click();
      
      // Enable widget
      const widgetSwitch = page.locator('button[role="switch"]').first();
      if (await widgetSwitch.getAttribute('data-state') !== 'checked') {
        await widgetSwitch.click();
      }
      
      // Save button
      const saveButton = page.getByRole('button', { name: /einstellungen speichern/i });
      await expect(saveButton).toBeVisible();
      await saveButton.click();
      
      // Success toast
      await expect(page.getByText(/gespeichert/i)).toBeVisible({ timeout: 5000 });
    });

    test('should have advanced settings section', async ({ page }) => {
      await page.getByRole('tab', { name: /widget/i }).click();
      
      // Enable widget
      const widgetSwitch = page.locator('button[role="switch"]').first();
      if (await widgetSwitch.getAttribute('data-state') !== 'checked') {
        await widgetSwitch.click();
      }
      
      // Advanced section
      await expect(page.getByText(/erweitert/i)).toBeVisible();
      
      // Contact URL field
      const contactUrlInput = page.locator('#contact_url');
      await expect(contactUrlInput).toBeVisible();
      
      // Allowed domains field
      const domainsInput = page.locator('#allowed_domains');
      await expect(domainsInput).toBeVisible();
    });
  });

  test.describe('Widget Embed Endpoint', () => {
    test('should return 404 for non-existent dealer', async ({ page }) => {
      await page.goto('/embed/non-existent-id-12345');
      // Should either 404 or show error state
      const content = await page.content();
      expect(content).toMatch(/nicht gefunden|not found|fehler|error|404/i);
    });

    test('should load embed page structure', async ({ page }) => {
      // This tests the embed page loads (even if no vehicles)
      // A real dealer ID would be needed for full test
      await page.goto('/embed/test');
      await page.waitForLoadState('networkidle');
      
      // Page should not crash - either shows content or error
      await expect(page.locator('body')).toBeVisible();
    });
  });
});

test.describe('Widget API Route', () => {
  test('should handle embed API request', async ({ request }) => {
    // Test the API endpoint exists and responds
    const apiResponse = await request.get('/api/embed/test-dealer-id');
    
    // Should respond (even with error for non-existent dealer)
    expect([200, 404, 400]).toContain(apiResponse.status());
  });
});
