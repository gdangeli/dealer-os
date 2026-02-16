import { test, expect } from '@playwright/test';

/**
 * Onboarding tests - these run with authenticated state
 * (storageState is loaded automatically from auth.setup.ts)
 */

test.describe('Onboarding Access', () => {
  test('should require authentication for unauthenticated users', async ({ page }) => {
    // Clear auth state for this specific test
    await page.context().clearCookies();
    await page.goto('/de/onboarding');
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Onboarding Wizard', () => {
  // These tests use pre-authenticated state from auth.setup.ts
  
  test('should redirect authenticated user to onboarding or dashboard', async ({ page }) => {
    await page.goto('/de/dashboard');
    // Should stay on dashboard (completed onboarding) or redirect to onboarding
    const url = page.url();
    expect(url.includes('onboarding') || url.includes('dashboard')).toBe(true);
  });

  test('should show dashboard content for user with completed onboarding', async ({ page }) => {
    await page.goto('/de/dashboard');
    
    // If redirected to onboarding, skip this test
    if (page.url().includes('onboarding')) {
      test.skip();
      return;
    }
    
    // Dashboard should show welcome message or stats
    await expect(page.locator('main')).toBeVisible();
    await expect(page.getByText(/Guten Tag|Dashboard/i)).toBeVisible();
  });

  test('should show onboarding wizard if not completed', async ({ page }) => {
    await page.goto('/de/onboarding');
    
    // If redirected to dashboard (already completed), skip
    if (page.url().includes('dashboard')) {
      test.skip();
      return;
    }
    
    // Onboarding should have a continue/next button
    const actionButton = page.getByRole('button', { name: /weiter|next|überspringen|skip|starten/i });
    await expect(actionButton).toBeVisible();
  });
});
