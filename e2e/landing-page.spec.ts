import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load landing page successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/DealerOS|Dealer OS/i);
  });

  test('should display hero section with headline', async ({ page }) => {
    // Hero headline
    const headline = page.getByRole('heading', { level: 1 });
    await expect(headline).toBeVisible();
    await expect(headline).toContainText(/Autohandel|Software|funktioniert/i);
  });

  test('should display navigation header', async ({ page }) => {
    const header = page.locator('header').first();
    await expect(header).toBeVisible();
    
    // Check for logo/brand
    await expect(page.getByText('Dealer OS')).toBeVisible();
  });

  test('should have working register CTA button', async ({ page }) => {
    const ctaButton = page.getByRole('link', { name: /kostenlos testen|registrieren/i });
    await expect(ctaButton).toBeVisible();
    
    await ctaButton.click();
    await expect(page).toHaveURL(/\/register/);
  });

  test('should have working login link in header', async ({ page }) => {
    const loginLink = page.getByRole('link', { name: /anmelden|login/i });
    await expect(loginLink).toBeVisible();
    
    await loginLink.click();
    await expect(page).toHaveURL(/\/login/);
  });

  test('should display trust indicators', async ({ page }) => {
    // Look for trust badges/indicators
    const trustText = page.getByText(/schweiz|kreditkarte|minuten/i).first();
    await expect(trustText).toBeVisible();
  });

  test('should display footer', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });

  test('should have impressum link in footer', async ({ page }) => {
    const footer = page.locator('footer');
    const impressumLink = footer.getByRole('link', { name: /impressum/i });
    await expect(impressumLink).toBeVisible();
  });

  test('should have datenschutz link in footer', async ({ page }) => {
    const footer = page.locator('footer');
    const datenschutzLink = footer.getByRole('link', { name: /datenschutz/i });
    await expect(datenschutzLink).toBeVisible();
  });

  test('should have AGB link in footer', async ({ page }) => {
    const footer = page.locator('footer');
    const agbLink = footer.getByRole('link', { name: /agb|geschäftsbedingungen/i });
    await expect(agbLink).toBeVisible();
  });

  test('should navigate to impressum page', async ({ page }) => {
    const footer = page.locator('footer');
    await footer.getByRole('link', { name: /impressum/i }).click();
    await expect(page).toHaveURL(/\/impressum/);
  });

  test('should navigate to datenschutz page', async ({ page }) => {
    const footer = page.locator('footer');
    await footer.getByRole('link', { name: /datenschutz/i }).click();
    await expect(page).toHaveURL(/\/datenschutz/);
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Page should still display header
    const header = page.locator('header');
    await expect(header).toBeVisible();
  });
});
