import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    // Go directly to /de to avoid redirect timing issues
    await page.goto('/de');
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
  });

  test('should load landing page successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/DealerOS|Dealer OS/i);
  });

  test('should display hero section with headline', async ({ page }) => {
    // Hero headline - Modern Minimalist design
    const headline = page.getByRole('heading', { level: 1 });
    await expect(headline).toBeVisible();
  });

  test('should display navigation header', async ({ page }) => {
    const header = page.locator('header').first();
    await expect(header).toBeVisible();
  });

  test('should have working register CTA button', async ({ page }) => {
    // Look for any register/trial CTA
    const ctaButton = page.getByRole('link', { name: /kostenlos|testen|registrieren|starten|jetzt/i }).first();
    await expect(ctaButton).toBeVisible();
    
    await ctaButton.click();
    await expect(page).toHaveURL(/\/de\/register/);
  });

  test('should have working login link in header', async ({ page }) => {
    const loginLink = page.locator('header').getByRole('link', { name: /anmelden|login/i });
    await expect(loginLink).toBeVisible();
    
    await loginLink.click();
    await expect(page).toHaveURL(/\/de\/login/);
  });

  test('should display features section', async ({ page }) => {
    // Look for features by checking for feature-related content
    const featuresContent = page.locator('section').filter({ hasText: /feature|funktion|fahrzeug|lead|analytik/i }).first();
    await expect(featuresContent).toBeVisible();
  });

  test('should display pricing section', async ({ page }) => {
    // Check for pricing content
    const pricingContent = page.locator('section').filter({ hasText: /preis|CHF|monat|starter|pro|business/i }).first();
    await expect(pricingContent).toBeVisible();
  });

  test('should display FAQ section', async ({ page }) => {
    const faqContent = page.locator('section').filter({ hasText: /FAQ|fragen|häufig/i }).first();
    await expect(faqContent).toBeVisible();
  });

  test('should display testimonials or social proof section', async ({ page }) => {
    // Look for testimonials or any social proof (quotes, ratings, customer mentions)
    const socialProof = page.locator('section').filter({ hasText: /kunde|bewertung|testimonial|zufrieden|nutzer|garagen/i }).first();
    await expect(socialProof).toBeVisible();
  });

  test('should display trust indicators', async ({ page }) => {
    // Look for Swiss/trust related text
    const trustText = page.getByText(/schweiz|swiss|kreditkarte|minuten|sicher|dsgvo/i).first();
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
    await expect(page).toHaveURL(/\/de\/impressum/);
  });

  test('should navigate to datenschutz page', async ({ page }) => {
    const footer = page.locator('footer');
    await footer.getByRole('link', { name: /datenschutz/i }).click();
    await expect(page).toHaveURL(/\/de\/datenschutz/);
  });

  test('should have demo video button', async ({ page }) => {
    const demoButton = page.getByRole('button', { name: /demo|video/i });
    await expect(demoButton).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/de');
    await page.waitForLoadState('networkidle');
    
    const header = page.locator('header');
    await expect(header).toBeVisible();
  });

  test('should display hero image or visual element', async ({ page }) => {
    // Check for images in hero section or decorative elements
    const heroSection = page.locator('section').first();
    const hasImage = await heroSection.locator('img').count() > 0;
    const hasVisual = await heroSection.locator('[class*="gradient"], [class*="blur"]').count() > 0;
    expect(hasImage || hasVisual).toBeTruthy();
  });
});
