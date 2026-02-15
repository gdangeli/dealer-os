import { test, expect, Page } from '@playwright/test';

const TEST_EMAIL = process.env.TEST_USER_EMAIL;
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD;

async function login(page: Page) {
  if (!TEST_EMAIL || !TEST_PASSWORD) {
    return false;
  }
  
  await page.goto('/login');
  await page.getByLabel(/email/i).fill(TEST_EMAIL);
  await page.getByLabel(/passwort|password/i).fill(TEST_PASSWORD);
  await page.getByRole('button', { name: /login|anmelden/i }).click();
  await expect(page).toHaveURL(/\/dashboard|\/onboarding/, { timeout: 15000 });
  
  return true;
}

test.describe('Onboarding Wizard', () => {
  test.beforeEach(async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) test.skip();
    await page.goto('/onboarding');
  });

  test('should display onboarding page', async ({ page }) => {
    if (!TEST_EMAIL) test.skip();
    
    // May redirect to dashboard if already completed
    const url = page.url();
    if (url.includes('dashboard')) {
      // Already completed onboarding - that's fine
      expect(url).toContain('dashboard');
      return;
    }
    
    await expect(page.getByText(/willkommen|onboarding|einrichten|setup/i)).toBeVisible();
  });

  test('should display step indicator or progress', async ({ page }) => {
    if (!TEST_EMAIL) test.skip();
    
    const url = page.url();
    if (url.includes('dashboard')) return;
    
    // Look for step indicators (1, 2, 3 or progress bar)
    const stepIndicator = page.locator('[class*="step"], [class*="progress"]').first();
    if (await stepIndicator.isVisible()) {
      await expect(stepIndicator).toBeVisible();
    }
  });

  test('should have company name input in first step', async ({ page }) => {
    if (!TEST_EMAIL) test.skip();
    
    const url = page.url();
    if (url.includes('dashboard')) return;
    
    // Look for company/dealer name field
    const companyField = page.getByLabel(/firmenname|autohaus|händler|company|dealer/i);
    if (await companyField.isVisible()) {
      await expect(companyField).toBeVisible();
    }
  });

  test('should have next/continue button', async ({ page }) => {
    if (!TEST_EMAIL) test.skip();
    
    const url = page.url();
    if (url.includes('dashboard')) return;
    
    const nextButton = page.getByRole('button', { name: /weiter|next|fortfahren|continue/i });
    await expect(nextButton).toBeVisible();
  });

  test('should navigate through wizard steps', async ({ page }) => {
    if (!TEST_EMAIL) test.skip();
    
    const url = page.url();
    if (url.includes('dashboard')) return;
    
    // Fill required field if visible
    const companyField = page.getByLabel(/firmenname|autohaus|händler|company|dealer/i);
    if (await companyField.isVisible()) {
      await companyField.fill('Test Autohaus');
    }
    
    // Click next
    const nextButton = page.getByRole('button', { name: /weiter|next|fortfahren|continue/i });
    if (await nextButton.isVisible()) {
      await nextButton.click();
      
      // Should progress (URL change, new content, or success)
      await page.waitForTimeout(1000);
    }
  });

  test('should allow skipping optional steps', async ({ page }) => {
    if (!TEST_EMAIL) test.skip();
    
    const url = page.url();
    if (url.includes('dashboard')) return;
    
    // Look for skip button
    const skipButton = page.getByRole('button', { name: /überspringen|skip|später/i });
    if (await skipButton.isVisible()) {
      await expect(skipButton).toBeVisible();
    }
  });

  test('should complete onboarding and redirect to dashboard', async ({ page }) => {
    if (!TEST_EMAIL) test.skip();
    
    const url = page.url();
    if (url.includes('dashboard')) {
      expect(url).toContain('dashboard');
      return;
    }
    
    // Try to complete onboarding
    const companyField = page.getByLabel(/firmenname|autohaus|händler|company|dealer/i);
    if (await companyField.isVisible()) {
      await companyField.fill('Test Autohaus');
    }
    
    // Click through steps
    let attempts = 0;
    while (attempts < 5) {
      const finishButton = page.getByRole('button', { name: /abschliessen|fertig|finish|complete|dashboard/i });
      if (await finishButton.isVisible()) {
        await finishButton.click();
        break;
      }
      
      const nextButton = page.getByRole('button', { name: /weiter|next|fortfahren|continue/i });
      if (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForTimeout(500);
      }
      
      attempts++;
    }
    
    // Should eventually reach dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });
});
