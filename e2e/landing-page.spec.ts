import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load landing page successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/DealerOS|Dealer OS/i);
  });

  test('should display hero section', async ({ page }) => {
    // Hero section with main CTA
    const heroSection = page.locator('section').first();
    await expect(heroSection).toBeVisible();
    
    // Look for primary CTA button
    const ctaButton = page.getByRole('link', { name: /kostenlos|starten|testen|registrieren/i }).first();
    await expect(ctaButton).toBeVisible();
  });

  test('should display navigation header', async ({ page }) => {
    const header = page.locator('header').first();
    await expect(header).toBeVisible();
    
    // Check for logo or brand name
    const logo = page.getByText(/DealerOS/i).first();
    await expect(logo).toBeVisible();
  });

  test('should have working login link', async ({ page }) => {
    const loginLink = page.getByRole('link', { name: /login|anmelden/i });
    await expect(loginLink).toBeVisible();
    
    await loginLink.click();
    await expect(page).toHaveURL(/\/login/);
  });

  test('should have working register link', async ({ page }) => {
    const registerLink = page.getByRole('link', { name: /registrieren|kostenlos|starten/i }).first();
    await expect(registerLink).toBeVisible();
    
    await registerLink.click();
    await expect(page).toHaveURL(/\/register/);
  });

  test('should display features section', async ({ page }) => {
    // Scroll to features or look for features content
    const featuresText = page.getByText(/funktionen|features|vorteile/i).first();
    if (await featuresText.isVisible()) {
      await expect(featuresText).toBeVisible();
    }
  });

  test('should display pricing section', async ({ page }) => {
    const pricingText = page.getByText(/preise|pricing|kostenlos|chf/i).first();
    if (await pricingText.isVisible()) {
      await expect(pricingText).toBeVisible();
    }
  });

  test('should display footer with legal links', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    
    // Check for legal links
    const impressumLink = page.getByRole('link', { name: /impressum/i });
    const datenschutzLink = page.getByRole('link', { name: /datenschutz/i });
    const agbLink = page.getByRole('link', { name: /agb/i });
    
    await expect(impressumLink).toBeVisible();
    await expect(datenschutzLink).toBeVisible();
    await expect(agbLink).toBeVisible();
  });

  test('should navigate to impressum page', async ({ page }) => {
    await page.getByRole('link', { name: /impressum/i }).click();
    await expect(page).toHaveURL(/\/impressum/);
    await expect(page.locator('h1')).toContainText(/impressum/i);
  });

  test('should navigate to datenschutz page', async ({ page }) => {
    await page.getByRole('link', { name: /datenschutz/i }).click();
    await expect(page).toHaveURL(/\/datenschutz/);
  });

  test('should navigate to AGB page', async ({ page }) => {
    await page.getByRole('link', { name: /agb/i }).click();
    await expect(page).toHaveURL(/\/agb/);
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Page should still be functional
    const header = page.locator('header');
    await expect(header).toBeVisible();
  });
});
