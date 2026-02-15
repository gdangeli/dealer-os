import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  
  test.describe('Login Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login');
    });

    test('should display login form', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /login|anmelden/i })).toBeVisible();
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/passwort|password/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /login|anmelden/i })).toBeVisible();
    });

    test('should show link to register page', async ({ page }) => {
      const registerLink = page.getByRole('link', { name: /registrieren|konto erstellen/i });
      await expect(registerLink).toBeVisible();
      
      await registerLink.click();
      await expect(page).toHaveURL(/\/register/);
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.getByLabel(/email/i).fill('invalid@test.com');
      await page.getByLabel(/passwort|password/i).fill('wrongpassword');
      await page.getByRole('button', { name: /login|anmelden/i }).click();
      
      // Wait for error message
      await expect(page.getByText(/fehler|error|ungültig|invalid/i)).toBeVisible({ timeout: 10000 });
    });

    test('should require email field', async ({ page }) => {
      await page.getByLabel(/passwort|password/i).fill('somepassword');
      await page.getByRole('button', { name: /login|anmelden/i }).click();
      
      // Check for HTML5 validation or custom error
      const emailInput = page.getByLabel(/email/i);
      await expect(emailInput).toHaveAttribute('required', '');
    });
  });

  test.describe('Register Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/register');
    });

    test('should display registration form', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /registrieren|konto erstellen/i })).toBeVisible();
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/passwort|password/i).first()).toBeVisible();
      await expect(page.getByRole('button', { name: /registrieren|konto erstellen/i })).toBeVisible();
    });

    test('should show link to login page', async ({ page }) => {
      const loginLink = page.getByRole('link', { name: /login|anmelden|bereits.*konto/i });
      await expect(loginLink).toBeVisible();
      
      await loginLink.click();
      await expect(page).toHaveURL(/\/login/);
    });

    test('should show error for invalid email format', async ({ page }) => {
      await page.getByLabel(/email/i).fill('notanemail');
      await page.getByLabel(/passwort|password/i).first().fill('password123');
      await page.getByRole('button', { name: /registrieren|konto erstellen/i }).click();
      
      // Check for validation error
      const emailInput = page.getByLabel(/email/i);
      // HTML5 email validation
      const validity = await emailInput.evaluate((el: HTMLInputElement) => el.validity.valid);
      expect(validity).toBe(false);
    });

    test('should validate password requirements', async ({ page }) => {
      await page.getByLabel(/email/i).fill('test@example.com');
      await page.getByLabel(/passwort|password/i).first().fill('123'); // Too short
      await page.getByRole('button', { name: /registrieren|konto erstellen/i }).click();
      
      // Should show some form of error or not submit
      // Either stay on page or show error message
      await page.waitForTimeout(1000);
      const currentUrl = page.url();
      expect(currentUrl).toContain('register');
    });
  });

  test.describe('Protected Routes', () => {
    test('should redirect unauthenticated users from dashboard to login', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Should redirect to login
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    });

    test('should redirect unauthenticated users from vehicles page', async ({ page }) => {
      await page.goto('/dashboard/vehicles');
      
      // Should redirect to login
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    });

    test('should redirect unauthenticated users from leads page', async ({ page }) => {
      await page.goto('/dashboard/leads');
      
      // Should redirect to login
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    });

    test('should redirect unauthenticated users from settings page', async ({ page }) => {
      await page.goto('/dashboard/settings');
      
      // Should redirect to login
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    });

    test('should redirect unauthenticated users from onboarding', async ({ page }) => {
      await page.goto('/onboarding');
      
      // Should redirect to login
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    });
  });
});
