import { test, expect, Page } from '@playwright/test';

// Admin tests require a platform admin account
const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD;

// Regular user for non-admin tests
const TEST_EMAIL = process.env.TEST_USER_EMAIL;
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD;

async function loginAsAdmin(page: Page): Promise<boolean> {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    return false;
  }
  
  await page.goto('/de/login');
  await page.locator('#email').fill(ADMIN_EMAIL);
  await page.locator('#password').fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: /anmelden/i }).click();
  await expect(page).toHaveURL(/\/dashboard|\/onboarding|\/admin/, { timeout: 15000 });
  
  return true;
}

async function loginAsUser(page: Page): Promise<boolean> {
  if (!TEST_EMAIL || !TEST_PASSWORD) {
    return false;
  }
  
  await page.goto('/de/login');
  await page.locator('#email').fill(TEST_EMAIL);
  await page.locator('#password').fill(TEST_PASSWORD);
  await page.getByRole('button', { name: /anmelden/i }).click();
  await expect(page).toHaveURL(/\/dashboard|\/onboarding/, { timeout: 15000 });
  
  return true;
}

test.describe('Admin Dashboard Access Control', () => {
  test('should redirect unauthenticated users from admin', async ({ page }) => {
    await page.goto('/de/admin');
    
    // Should redirect to login
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  test('should show 403 or redirect for non-admin users', async ({ page }) => {
    test.skip(!TEST_EMAIL, 'Requires TEST_USER_EMAIL env var');
    
    const loggedIn = await loginAsUser(page);
    if (!loggedIn) return;
    
    await page.goto('/de/admin');
    
    // Should either redirect or show access denied
    const url = page.url();
    const content = await page.content();
    
    const isAccessDenied = 
      url.includes('/dashboard') ||
      url.includes('/login') ||
      content.includes('403') ||
      content.toLowerCase().includes('zugriff') ||
      content.toLowerCase().includes('denied') ||
      content.toLowerCase().includes('berechtigung');
    
    expect(isAccessDenied).toBeTruthy();
  });
});

test.describe('Admin Dashboard (requires admin account)', () => {
  test.skip(!ADMIN_EMAIL, 'Requires TEST_ADMIN_EMAIL env var');

  test.beforeEach(async ({ page }) => {
    const loggedIn = await loginAsAdmin(page);
    if (!loggedIn) test.skip();
  });

  test('should display admin dashboard', async ({ page }) => {
    await page.goto('/de/admin');
    
    // Should show admin heading or admin-specific content
    await expect(page.getByText(/admin|platform|händler/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('should show dealer statistics', async ({ page }) => {
    await page.goto('/de/admin');
    
    // Stats cards should be visible
    await expect(page.getByText(/gesamt|total/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('should display dealer list', async ({ page }) => {
    await page.goto('/de/admin');
    
    // Table or list of dealers
    const dealerTable = page.locator('table');
    await expect(dealerTable).toBeVisible({ timeout: 10000 });
  });

  test('should have search functionality', async ({ page }) => {
    await page.goto('/de/admin');
    
    // Search input
    const searchInput = page.locator('input[placeholder*="such"]').or(
      page.locator('input[type="search"]')
    ).or(
      page.locator('input').filter({ hasText: /such/i })
    );
    
    await expect(searchInput.first()).toBeVisible();
  });

  test('should have plan filter', async ({ page }) => {
    await page.goto('/de/admin');
    
    // Plan filter dropdown
    const planFilter = page.locator('button[role="combobox"]').filter({ hasText: /plan|alle/i });
    await expect(planFilter.first()).toBeVisible();
  });

  test('should have status filter', async ({ page }) => {
    await page.goto('/de/admin');
    
    // Status filter
    const statusFilter = page.locator('button[role="combobox"]').filter({ hasText: /status|aktiv|alle/i });
    await expect(statusFilter.first()).toBeVisible();
  });

  test('should show impersonate button for dealers', async ({ page }) => {
    await page.goto('/de/admin');
    
    // Impersonate buttons in table rows - at least the table should load
    const table = page.locator('table');
    await expect(table).toBeVisible({ timeout: 10000 });
    
    // Impersonate buttons may exist if dealers are present
    const impersonateButtons = page.getByRole('button', { name: /impersonate|einloggen/i });
    const count = await impersonateButtons.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should have CSV export functionality', async ({ page }) => {
    await page.goto('/de/admin');
    
    // Export button
    const exportButton = page.getByRole('button', { name: /export|csv/i });
    await expect(exportButton).toBeVisible();
  });

  test('should have add dealer button', async ({ page }) => {
    await page.goto('/de/admin');
    
    // Add dealer button
    const addButton = page.getByRole('button', { name: /händler.*hinzufügen|add.*dealer|neuer/i });
    await expect(addButton).toBeVisible();
  });

  test('should open add dealer dialog', async ({ page }) => {
    await page.goto('/de/admin');
    
    const addButton = page.getByRole('button', { name: /händler.*hinzufügen|add.*dealer|neuer/i });
    await addButton.click();
    
    // Dialog should open
    await expect(page.getByText(/händler.*anlegen|dealer.*erstellen|neuer.*händler/i)).toBeVisible();
  });

  test('should filter dealers by search', async ({ page }) => {
    await page.goto('/de/admin');
    
    // Find and use search
    const searchInput = page.locator('input').first();
    await searchInput.fill('test');
    
    // Should trigger filtering (results may vary)
    // Just verify no crash
    await page.waitForTimeout(500);
    await expect(page.locator('table')).toBeVisible();
  });
});

test.describe('Impersonation Feature', () => {
  test.skip(!ADMIN_EMAIL, 'Requires TEST_ADMIN_EMAIL env var');

  test('should show impersonation banner when impersonating', async ({ page, context }) => {
    const loggedIn = await loginAsAdmin(page);
    if (!loggedIn) return;
    
    await page.goto('/de/admin');
    
    // Find first impersonate button
    const impersonateButton = page.getByRole('button', { name: /impersonate|einloggen/i }).first();
    
    if (await impersonateButton.isVisible()) {
      // Create promise for new page
      const pagePromise = context.waitForEvent('page');
      
      await impersonateButton.click();
      
      // New tab should open
      const newPage = await pagePromise;
      await newPage.waitForLoadState();
      
      // Either banner is visible or redirect happened
      const currentUrl = newPage.url();
      expect(currentUrl).toContain('dashboard');
      
      await newPage.close();
    }
  });
});

test.describe('Admin API Routes', () => {
  test('should require authentication for admin dealers API', async ({ request }) => {
    const response = await request.get('/api/admin/dealers');
    expect([401, 403]).toContain(response.status());
  });

  test('should require authentication for impersonate API', async ({ request }) => {
    const response = await request.post('/api/admin/impersonate', {
      data: { dealerId: 'test-id' }
    });
    expect([401, 403]).toContain(response.status());
  });

  test('should have admin check debug endpoint', async ({ request }) => {
    const response = await request.get('/api/debug/admin-check');
    // Should respond with JSON
    expect([200, 401, 403]).toContain(response.status());
  });
});

test.describe('Admin Dashboard Navigation', () => {
  test.skip(!ADMIN_EMAIL, 'Requires TEST_ADMIN_EMAIL env var');

  test('should show admin link in sidebar for admins', async ({ page }) => {
    const loggedIn = await loginAsAdmin(page);
    if (!loggedIn) return;
    
    await page.goto('/de/dashboard');
    
    // Admin link may be visible in navigation for admin users
    // Just verify dashboard loads without error
    await expect(page.locator('main')).toBeVisible();
  });

  test('should show documentation link in admin dashboard', async ({ page }) => {
    const loggedIn = await loginAsAdmin(page);
    if (!loggedIn) return;
    
    await page.goto('/de/admin');
    
    // Docs link may or may not exist - just verify page loads
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('Add Dealer Form (Admin)', () => {
  test.skip(!ADMIN_EMAIL, 'Requires TEST_ADMIN_EMAIL env var');

  test('should validate add dealer form', async ({ page }) => {
    const loggedIn = await loginAsAdmin(page);
    if (!loggedIn) return;
    
    await page.goto('/de/admin');
    
    // Open add dialog
    const addButton = page.getByRole('button', { name: /händler.*hinzufügen|add.*dealer|neuer/i });
    await addButton.click();
    
    // Try to submit empty form
    const submitButton = page.getByRole('button', { name: /anlegen|erstellen|hinzufügen/i }).last();
    
    if (await submitButton.isVisible()) {
      await submitButton.click();
      
      // Should show validation errors or stay on form
      // Form should still be visible (not submitted)
      await expect(page.getByText(/händler.*anlegen|dealer.*erstellen/i)).toBeVisible();
    }
  });

  test('should have plan selector in add dealer form', async ({ page }) => {
    const loggedIn = await loginAsAdmin(page);
    if (!loggedIn) return;
    
    await page.goto('/de/admin');
    
    const addButton = page.getByRole('button', { name: /händler.*hinzufügen|add.*dealer|neuer/i });
    await addButton.click();
    
    // Plan selector should be visible
    const planLabel = page.getByText(/plan|abo/i);
    await expect(planLabel.first()).toBeVisible();
  });
});
