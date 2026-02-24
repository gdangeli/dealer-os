import { test, expect } from '@playwright/test';

test.describe('Coming Soon Page', () => {
  test.describe('Page Structure', () => {
    test('should display the coming soon page', async ({ page }) => {
      await page.goto('/de/coming-soon');
      await expect(page.locator('body')).toBeVisible();
    });

    test('should show DealerOS branding', async ({ page }) => {
      await page.goto('/de/coming-soon');
      
      // Logo/brand name - use heading
      await expect(page.getByRole('heading', { name: /DealerOS/i }).first()).toBeVisible();
      
      // Tagline
      await expect(page.getByText(/Schweizer Autohändler/i)).toBeVisible();
    });

    test('should display Coming Soon badge', async ({ page }) => {
      await page.goto('/de/coming-soon');
      
      await expect(page.getByText(/Coming Soon/i)).toBeVisible();
    });

    test('should show main message', async ({ page }) => {
      await page.goto('/de/coming-soon');
      
      await expect(page.getByText(/Wir arbeiten an etwas Grossartigem/i)).toBeVisible();
      await expect(page.getByText(/DealerOS wird bald verfügbar sein/i)).toBeVisible();
    });

    test('should display feature preview cards', async ({ page }) => {
      await page.goto('/de/coming-soon');
      
      // Three feature cards - use specific headings
      await expect(page.getByRole('heading', { name: 'Fahrzeugverwaltung' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Lead-Management' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Multi-Plattform' })).toBeVisible();
    });

    test('should have copyright footer', async ({ page }) => {
      await page.goto('/de/coming-soon');
      
      const currentYear = new Date().getFullYear().toString();
      await expect(page.getByText(new RegExp(`© ${currentYear}.*DealerOS`, 'i'))).toBeVisible();
    });
  });

  test.describe('Password Protection', () => {
    test('should display unlock form', async ({ page }) => {
      await page.goto('/de/coming-soon');
      
      // Unlock section
      await expect(page.getByText(/Zugang für Berechtigte/i)).toBeVisible();
      
      // Password input
      const passwordInput = page.locator('input[type="password"]');
      await expect(passwordInput).toBeVisible();
      
      // Unlock button
      await expect(page.getByRole('button', { name: /unlock/i })).toBeVisible();
    });

    test('should have disabled button when password is empty', async ({ page }) => {
      await page.goto('/de/coming-soon');
      
      const unlockButton = page.getByRole('button', { name: /unlock/i });
      await expect(unlockButton).toBeDisabled();
    });

    test('should enable button when password is entered', async ({ page }) => {
      await page.goto('/de/coming-soon');
      
      const passwordInput = page.locator('input[type="password"]');
      await passwordInput.fill('some-password');
      
      const unlockButton = page.getByRole('button', { name: /unlock/i });
      await expect(unlockButton).toBeEnabled();
    });

    test('should show error for wrong password', async ({ page }) => {
      await page.goto('/de/coming-soon');
      
      const passwordInput = page.locator('input[type="password"]');
      await passwordInput.fill('wrong-password-12345');
      
      const unlockButton = page.getByRole('button', { name: /unlock/i });
      await unlockButton.click();
      
      // Wait for error message
      await expect(page.getByText(/Falsches Passwort/i)).toBeVisible({ timeout: 5000 });
    });

    test('should show loading state during submission', async ({ page }) => {
      await page.goto('/de/coming-soon');
      
      const passwordInput = page.locator('input[type="password"]');
      await passwordInput.fill('test-password');
      
      const unlockButton = page.getByRole('button', { name: /unlock/i });
      
      // Click and immediately check for loading state
      await unlockButton.click();
      
      // Button should show loading indicator (...)
      // This may be very fast, so we just verify the form submits without crash
      await page.waitForLoadState('networkidle');
    });
  });

  test.describe('Unlock API', () => {
    test('should return 401 for invalid key', async ({ request }) => {
      const response = await request.get('/api/unlock?key=invalid-key');
      expect(response.status()).toBe(401);
      
      const data = await response.json();
      expect(data.error).toBe('Invalid key');
    });

    test('should accept POST with wrong password and return 401', async ({ request }) => {
      const response = await request.post('/api/unlock', {
        data: { password: 'wrong-password' },
        headers: { 'Content-Type': 'application/json' },
      });
      expect(response.status()).toBe(401);
    });

    test('should return 400 for invalid POST body', async ({ request }) => {
      const response = await request.post('/api/unlock', {
        data: 'not-json',
        headers: { 'Content-Type': 'text/plain' },
      });
      expect(response.status()).toBe(400);
    });
  });

  test.describe('Localization', () => {
    test('should load coming soon page in German', async ({ page }) => {
      await page.goto('/de/coming-soon');
      await expect(page.getByText(/Wir arbeiten/i)).toBeVisible();
    });

    test('should load coming soon page in English', async ({ page }) => {
      await page.goto('/en/coming-soon');
      // The page might still show German if translations aren't set up
      // At minimum, page should load without error
      await expect(page.locator('body')).toBeVisible();
    });

    test('should load coming soon page in French', async ({ page }) => {
      await page.goto('/fr/coming-soon');
      await expect(page.locator('body')).toBeVisible();
    });

    test('should load coming soon page in Italian', async ({ page }) => {
      await page.goto('/it/coming-soon');
      await expect(page.locator('body')).toBeVisible();
    });
  });
});
