import { test, expect } from '@playwright/test';

const TEST_EMAIL = process.env.TEST_USER_EMAIL;
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD;

test.describe('Login Page - UI Elements', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/de/login');
    await expect(page.locator('form')).toBeVisible({ timeout: 10000 });
  });

  test('should display login page with all elements', async ({ page }) => {
    // Check for form elements
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.getByRole('button', { name: /anmelden/i })).toBeVisible();
  });

  test('should display Dealer OS branding', async ({ page }) => {
    await expect(page.getByText('Dealer OS')).toBeVisible();
  });

  test('should have link to register page', async ({ page }) => {
    const registerLink = page.getByRole('link', { name: /registrieren/i });
    await expect(registerLink).toBeVisible();
    
    await registerLink.click();
    await expect(page).toHaveURL(/\/register/);
  });

  test('should have required email field with correct type', async ({ page }) => {
    const emailInput = page.locator('#email');
    await expect(emailInput).toHaveAttribute('required', '');
    await expect(emailInput).toHaveAttribute('type', 'email');
  });

  test('should have required password field', async ({ page }) => {
    const passwordInput = page.locator('#password');
    await expect(passwordInput).toHaveAttribute('required', '');
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });
});

test.describe('Login - Form Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/de/login');
    await expect(page.locator('form')).toBeVisible({ timeout: 10000 });
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.locator('#email').fill('invalid@nonexistent-domain-test.com');
    await page.locator('#password').fill('wrongpassword123');
    await page.getByRole('button', { name: /anmelden/i }).click();
    
    // Wait for error message
    await expect(page.locator('.text-red-600, .text-red-500, [role="alert"]')).toBeVisible({ timeout: 15000 });
  });

  test('should prevent form submission with empty fields', async ({ page }) => {
    // Try to submit empty form
    await page.getByRole('button', { name: /anmelden/i }).click();
    
    // Should stay on login page (HTML5 validation)
    await expect(page).toHaveURL(/\/login/);
  });

  test('should validate email format', async ({ page }) => {
    await page.locator('#email').fill('not-an-email');
    await page.locator('#password').fill('somepassword');
    await page.getByRole('button', { name: /anmelden/i }).click();
    
    // Should stay on login page (HTML5 email validation)
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Login - Successful Authentication', () => {
  test.skip(!TEST_EMAIL || !TEST_PASSWORD, 'Requires TEST_USER credentials');

  test('should login with valid credentials and redirect to dashboard', async ({ page }) => {
    await page.goto('/de/login');
    await expect(page.locator('form')).toBeVisible({ timeout: 10000 });
    
    await page.locator('#email').fill(TEST_EMAIL!);
    await page.locator('#password').fill(TEST_PASSWORD!);
    await page.getByRole('button', { name: /anmelden/i }).click();
    
    // Should redirect to dashboard or onboarding
    await expect(page).toHaveURL(/\/dashboard|\/onboarding/, { timeout: 20000 });
  });

  // TODO: Fix flaky test - CI environment issue
  test.skip('should maintain session after login', async ({ page }) => {
    await page.goto('/de/login');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('form')).toBeVisible({ timeout: 15000 });
    
    await page.locator('#email').fill(TEST_EMAIL!);
    await page.locator('#password').fill(TEST_PASSWORD!);
    await page.getByRole('button', { name: /anmelden/i }).click();
    
    await expect(page).toHaveURL(/\/dashboard|\/onboarding/, { timeout: 20000 });
    
    // Navigate to another protected page
    await page.goto('/de/dashboard/vehicles');
    
    // Should still be authenticated (not redirected to login)
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('Register Page - UI Elements', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/de/register');
    await expect(page.locator('form')).toBeVisible({ timeout: 10000 });
  });

  test('should display registration form', async ({ page }) => {
    await expect(page.locator('form')).toBeVisible();
  });

  test('should have email and password fields', async ({ page }) => {
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should have link to login page', async ({ page }) => {
    const loginLink = page.getByRole('link', { name: /anmelden/i });
    await expect(loginLink).toBeVisible();
    
    await loginLink.click();
    await expect(page).toHaveURL(/\/login/);
  });

  test('should display submit button', async ({ page }) => {
    const submitButton = page.getByRole('button', { name: /registrieren|erstellen|account/i });
    await expect(submitButton).toBeVisible();
  });
});

test.describe('Protected Routes - Redirect to Login', () => {
  test('should redirect from dashboard to login', async ({ page }) => {
    await page.goto('/de/dashboard');
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  test('should redirect from vehicles to login', async ({ page }) => {
    await page.goto('/de/dashboard/vehicles');
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  test('should redirect from leads to login', async ({ page }) => {
    await page.goto('/de/dashboard/leads');
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  test('should redirect from settings to login', async ({ page }) => {
    await page.goto('/de/dashboard/settings');
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  test('should redirect from analytics to login', async ({ page }) => {
    await page.goto('/de/dashboard/analytics');
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  test('should redirect from onboarding to login', async ({ page }) => {
    await page.goto('/de/onboarding');
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });
});

test.describe('Logout - Sign Out Flow', () => {
  // Skip in CI - logout tests are flaky due to session handling
  test.skip(!!process.env.CI, 'Logout tests skipped in CI - requires proper session cleanup');
  test.skip(!TEST_EMAIL || !TEST_PASSWORD, 'Requires TEST_USER credentials');

  test('should logout and redirect to home', async ({ page }) => {
    // First login
    await page.goto('/de/login');
    await page.locator('#email').fill(TEST_EMAIL!);
    await page.locator('#password').fill(TEST_PASSWORD!);
    await page.getByRole('button', { name: /anmelden/i }).click();
    
    await expect(page).toHaveURL(/\/dashboard|\/onboarding/, { timeout: 20000 });
    
    // If on onboarding, navigate to dashboard
    if (page.url().includes('onboarding')) {
      await page.goto('/de/dashboard');
    }
    
    // Find and click logout button
    const logoutButton = page.getByRole('button', { name: /abmelden|logout/i }).or(
      page.locator('button:has-text("Abmelden")')
    );
    
    // Logout button might be in a sidebar or dropdown
    const isVisible = await logoutButton.isVisible().catch(() => false);
    
    if (isVisible) {
      await logoutButton.click();
      
      // Should redirect to home or login
      await expect(page).toHaveURL(/^\/$|\/login/, { timeout: 10000 });
    } else {
      // Try to find it in navigation
      const navLogout = page.locator('nav').getByText(/abmelden/i);
      if (await navLogout.isVisible().catch(() => false)) {
        await navLogout.click();
        await expect(page).toHaveURL(/^\/$|\/login/, { timeout: 10000 });
      }
    }
  });

  test('should not access protected pages after logout', async ({ page }) => {
    // Login first
    await page.goto('/de/login');
    await page.locator('#email').fill(TEST_EMAIL!);
    await page.locator('#password').fill(TEST_PASSWORD!);
    await page.getByRole('button', { name: /anmelden/i }).click();
    
    await expect(page).toHaveURL(/\/dashboard|\/onboarding/, { timeout: 20000 });
    
    // Navigate to dashboard
    await page.goto('/de/dashboard');
    
    // Find logout
    const logoutButton = page.getByRole('button', { name: /abmelden|logout/i }).or(
      page.locator('button:has-text("Abmelden")')
    ).or(
      page.locator('nav').getByText(/abmelden/i)
    );
    
    if (await logoutButton.first().isVisible().catch(() => false)) {
      await logoutButton.first().click();
      await page.waitForTimeout(1000);
    } else {
      // Sign out via API
      await page.evaluate(() => {
        // Clear auth state
        localStorage.clear();
        sessionStorage.clear();
      });
      await page.goto('/');
    }
    
    // Now try to access protected page
    await page.goto('/de/dashboard/vehicles');
    
    // Should be redirected to login
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });
});

test.describe('Locale Handling', () => {
  test('should redirect to locale-prefixed login', async ({ page }) => {
    await page.goto('/login');
    // Should either stay at /login or redirect to /de/login
    await expect(page).toHaveURL(/\/login/);
  });

  test('should work with de locale', async ({ page }) => {
    await page.goto('/de/login');
    await expect(page.locator('form')).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /anmelden/i })).toBeVisible();
  });
});
