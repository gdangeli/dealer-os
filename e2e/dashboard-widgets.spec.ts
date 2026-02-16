import { test, expect } from '@playwright/test';

/**
 * Dashboard Widget Tests
 * These tests run with authenticated state from auth.setup.ts
 * (storageState is loaded automatically via playwright.config.ts)
 */

test.describe('Dashboard Widget Configuration', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate directly to dashboard - auth state is pre-loaded
    await page.goto('/de/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('should show customize dashboard button', async ({ page }) => {
    const customizeButton = page.getByRole('button', { name: /dashboard anpassen/i });
    await expect(customizeButton).toBeVisible();
  });

  test('should enter edit mode when clicking customize button', async ({ page }) => {
    await page.click('button:has-text("Dashboard anpassen")');
    
    // Should show toggle panel
    await expect(page.getByText('Widgets anzeigen/ausblenden')).toBeVisible();
    
    // Should show control buttons
    await expect(page.getByRole('button', { name: /speichern/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /abbrechen/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /zurücksetzen/i })).toBeVisible();
    
    // Should show drag handles
    await expect(page.locator('svg.lucide-grip-vertical').first()).toBeVisible();
  });

  test('should toggle widgets on/off', async ({ page }) => {
    await page.click('button:has-text("Dashboard anpassen")');
    
    // Toggle "Neue Anfragen" widget off
    const recentLeadsSwitch = page.locator('label:has-text("Neue Anfragen")').locator('..').locator('button[role="switch"]');
    await recentLeadsSwitch.click();
    
    // Save configuration
    await page.click('button:has-text("Speichern")');
    await page.waitForTimeout(1000);
    
    // Reload page and verify widget is hidden
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'Neue Anfragen' })).not.toBeVisible();
    
    // Re-enable the widget
    await page.click('button:has-text("Dashboard anpassen")');
    await recentLeadsSwitch.click();
    await page.click('button:has-text("Speichern")');
    await page.waitForTimeout(1000);
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'Neue Anfragen' })).toBeVisible();
  });

  test('should cancel changes when clicking cancel', async ({ page }) => {
    // Verify initial state
    await expect(page.getByRole('heading', { name: 'Neue Anfragen' })).toBeVisible();
    
    await page.click('button:has-text("Dashboard anpassen")');
    
    // Toggle a widget off
    const recentLeadsSwitch = page.locator('label:has-text("Neue Anfragen")').locator('..').locator('button[role="switch"]');
    await recentLeadsSwitch.click();
    
    // Cancel without saving
    await page.click('button:has-text("Abbrechen")');
    
    // Widget should still be visible
    await expect(page.getByRole('heading', { name: 'Neue Anfragen' })).toBeVisible();
  });

  test('should reset to default configuration', async ({ page }) => {
    await page.click('button:has-text("Dashboard anpassen")');
    
    // Disable all widgets
    const switches = page.locator('button[role="switch"]');
    const count = await switches.count();
    
    for (let i = 0; i < count; i++) {
      const switchEl = switches.nth(i);
      const isChecked = await switchEl.getAttribute('data-state');
      if (isChecked === 'checked') {
        await switchEl.click();
      }
    }
    
    await page.click('button:has-text("Speichern")');
    await page.waitForTimeout(1000);
    
    // Now reset to default
    await page.click('button:has-text("Dashboard anpassen")');
    await page.click('button:has-text("Zurücksetzen")');
    await page.click('button:has-text("Speichern")');
    await page.waitForTimeout(1000);
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // All default widgets should be visible
    await expect(page.getByText('Am Lager')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Neue Anfragen' })).toBeVisible();
  });

  test('should show drag handles in edit mode', async ({ page }) => {
    await page.click('button:has-text("Dashboard anpassen")');
    
    const dragHandles = page.locator('svg.lucide-grip-vertical');
    const count = await dragHandles.count();
    
    expect(count).toBeGreaterThan(0);
  });

  test('should hide drag handles in view mode', async ({ page }) => {
    const dragHandles = page.locator('svg.lucide-grip-vertical');
    await expect(dragHandles.first()).not.toBeVisible();
  });
});

test.describe('Dashboard Widget Drag & Drop', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/de/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test.skip('should reorder widgets via drag and drop', async ({ page }) => {
    // Note: Drag & Drop testing in Playwright can be tricky
    // This is a basic implementation that might need adjustment
    await page.click('button:has-text("Dashboard anpassen")');
    
    // Get initial order
    const widgets = page.locator('[class*="space-y-6"] > div');
    const firstWidget = widgets.first();
    const firstWidgetText = await firstWidget.textContent();
    
    // Try to drag first widget down
    const dragHandle = firstWidget.locator('svg.lucide-grip-vertical').first();
    const boundingBox = await dragHandle.boundingBox();
    
    if (boundingBox) {
      await page.mouse.move(boundingBox.x + boundingBox.width / 2, boundingBox.y + boundingBox.height / 2);
      await page.mouse.down();
      await page.mouse.move(boundingBox.x, boundingBox.y + 200);
      await page.mouse.up();
    }
    
    await page.waitForTimeout(500);
    
    // Verify order changed
    const newFirstWidgetText = await widgets.first().textContent();
    expect(newFirstWidgetText).not.toBe(firstWidgetText);
  });
});
