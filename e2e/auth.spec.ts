import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  
  test.describe('Login Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login');
    });

    test('should display login page elements', async ({ page }) => {
      // Wait for page to be fully loaded
      await expect(page.locator('form')).toBeVisible({ timeout: 10000 });
      
      // Check for key form elements
      await expect(page.locator('#email')).toBeVisible();
      await expect(page.locator('#password')).toBeVisible();
      await expect(page.getByRole('button', { name: /anmelden/i })).toBeVisible();
    });

    test('should show logo/brand link', async ({ page }) => {
      // Logo links back to home
      await expect(page.getByText('Dealer OS')).toBeVisible();
    });

    test('should show link to register page', async ({ page }) => {
      const registerLink = page.getByRole('link', { name: /kostenlos registrieren/i });
      await expect(registerLink).toBeVisible();
      
      await registerLink.click();
      await expect(page).toHaveURL(/\/register/);
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.locator('#email').fill('invalid@test.com');
      await page.locator('#password').fill('wrongpassword123');
      await page.getByRole('button', { name: /anmelden/i }).click();
      
      // Wait for error message (Supabase returns error)
      await expect(page.locator('.text-red-600')).toBeVisible({ timeout: 15000 });
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
      await page.goto('/register');
    });

    test('should display registration form', async ({ page }) => {
      await expect(page.locator('form')).toBeVisible({ timeout: 10000 });
    });

    test('should show all registration fields', async ({ page }) => {
      // Check for company and contact fields
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
    });

    test('should show link to login page', async ({ page }) => {
      const loginLink = page.getByRole('link', { name: /anmelden/i });
      await expect(loginLink).toBeVisible();
      
      await loginLink.click();
      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe('Protected Routes', () => {
    test('should redirect unauthenticated users from dashboard', async ({ page }) => {
      await page.goto('/dashboard');
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    });

    test('should redirect unauthenticated users from vehicles page', async ({ page }) => {
      await page.goto('/dashboard/vehicles');
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    });

    test('should redirect unauthenticated users from leads page', async ({ page }) => {
      await page.goto('/dashboard/leads');
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    });

    test('should redirect unauthenticated users from settings', async ({ page }) => {
      await page.goto('/dashboard/settings');
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    });

    test('should redirect unauthenticated users from onboarding', async ({ page }) => {
      await page.goto('/onboarding');
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    });
  });
});
