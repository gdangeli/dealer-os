import { test, expect } from '@playwright/test';

// The app redirects / to /de, and auth pages are at /de/login, /de/register
test.describe('Authentication Flow', () => {
  
  test.describe('Login Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/de/login');
    });

    test('should display login page elements', async ({ page }) => {
      // Wait for page to be fully loaded
      await expect(page.locator('form')).toBeVisible();
      
      // Check for key form elements
      await expect(page.locator('#email')).toBeVisible();
      await expect(page.locator('#password')).toBeVisible();
      await expect(page.getByRole('button', { name: /anmelden/i })).toBeVisible();
    });

    test('should show logo/brand link', async ({ page }) => {
      // Logo links back to home
      const logoLink = page.locator('a[href="/"], a[href="/de"]').first();
      await expect(logoLink).toBeVisible();
    });

    test('should show link to register page', async ({ page }) => {
      const registerLink = page.getByRole('link', { name: /kostenlos registrieren|registrieren/i });
      await expect(registerLink).toBeVisible();
      
      await registerLink.click();
      await expect(page).toHaveURL(/\/register/);
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.locator('#email').fill('invalid@test.com');
      await page.locator('#password').fill('wrongpassword123');
      await page.getByRole('button', { name: /anmelden/i }).click();
      
      // Wait for error message
      await expect(page.locator('.text-red-600, .text-red-500, [role="alert"]')).toBeVisible({ timeout: 10000 });
    });

    test('should have required email field', async ({ page }) => {
      const emailInput = page.locator('#email');
      await expect(emailInput).toHaveAttribute('required', '');
    });

    test('should have required password field', async ({ page }) => {
      const passwordInput = page.locator('#password');
      await expect(passwordInput).toHaveAttribute('required', '');
    });
  });

  test.describe('Register Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/de/register');
    });

    test('should display registration form', async ({ page }) => {
      // Wait for form to load
      await expect(page.locator('form')).toBeVisible();
      
      // Check heading
      await expect(page.getByRole('heading', { name: /konto erstellen/i })).toBeVisible();
      
      // Check form fields exist
      await expect(page.locator('#email')).toBeVisible();
      await expect(page.locator('#password')).toBeVisible();
      await expect(page.getByRole('button', { name: /konto erstellen/i })).toBeVisible();
    });

    test('should show all registration fields', async ({ page }) => {
      await expect(page.locator('#companyName')).toBeVisible();
      await expect(page.locator('#contactName')).toBeVisible();
      await expect(page.locator('#email')).toBeVisible();
      await expect(page.locator('#phone')).toBeVisible();
      await expect(page.locator('#password')).toBeVisible();
    });

    test('should show link to login page', async ({ page }) => {
      const loginLink = page.getByRole('link', { name: /hier anmelden|anmelden/i });
      await expect(loginLink).toBeVisible();
      
      await loginLink.click();
      await expect(page).toHaveURL(/\/login/);
    });

    test('should validate email format', async ({ page }) => {
      const emailInput = page.locator('#email');
      await emailInput.fill('notanemail');
      
      // HTML5 email validation
      const validity = await emailInput.evaluate((el: HTMLInputElement) => el.validity.valid);
      expect(validity).toBe(false);
    });

    test('should require minimum password length', async ({ page }) => {
      const passwordInput = page.locator('#password');
      await expect(passwordInput).toHaveAttribute('minlength', '8');
    });
  });

  test.describe('Protected Routes', () => {
    test('should redirect unauthenticated users from dashboard', async ({ page }) => {
      await page.goto('/de/dashboard');
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    });

    test('should redirect unauthenticated users from vehicles page', async ({ page }) => {
      await page.goto('/de/dashboard/vehicles');
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    });

    test('should redirect unauthenticated users from leads page', async ({ page }) => {
      await page.goto('/de/dashboard/leads');
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    });

    test('should redirect unauthenticated users from settings', async ({ page }) => {
      await page.goto('/de/dashboard/settings');
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    });

    test('should redirect unauthenticated users from onboarding', async ({ page }) => {
      await page.goto('/de/onboarding');
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    });
  });
});
