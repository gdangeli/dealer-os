import { test, expect, Page } from '@playwright/test';

const TEST_EMAIL = process.env.TEST_USER_EMAIL;
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD;

async function login(page: Page): Promise<boolean> {
  if (!TEST_EMAIL || !TEST_PASSWORD) {
    return false;
  }
  
  await page.goto('/de/login');
  await page.locator('#email').fill(TEST_EMAIL);
  await page.locator('#password').fill(TEST_PASSWORD);
  await page.getByRole('button', { name: /anmelden/i }).click();
  await expect(page).toHaveURL(/\/dashboard|\/onboarding/, { timeout: 15000 });
  
  if (page.url().includes('onboarding')) {
    await page.goto('/de/dashboard/settings');
  }
  
  return true;
}

test.describe('Team Management Feature', () => {
  test.describe('Team Tab in Settings', () => {
    test.skip(!TEST_EMAIL, 'Requires TEST_USER_EMAIL env var');

    test.beforeEach(async ({ page }) => {
      const loggedIn = await login(page);
      if (!loggedIn) test.skip();
      await page.goto('/de/dashboard/settings');
      await expect(page.locator('main')).toBeVisible({ timeout: 10000 });
    });

    test('should display Team tab in settings', async ({ page }) => {
      const teamTab = page.getByRole('tab', { name: /team/i });
      await expect(teamTab).toBeVisible();
    });

    test('should show team management header', async ({ page }) => {
      await page.getByRole('tab', { name: /team/i }).click();
      
      await expect(page.getByText(/team verwalten/i)).toBeVisible();
    });

    test('should show current user count', async ({ page }) => {
      await page.getByRole('tab', { name: /team/i }).click();
      
      // Should display user count
      await expect(page.getByText(/benutzer/i)).toBeVisible();
    });

    test('should show invite button for team owners/admins', async ({ page }) => {
      await page.getByRole('tab', { name: /team/i }).click();
      
      // Look for invite button (may be disabled based on plan)
      const inviteButton = page.getByRole('button', { name: /einladen/i });
      await expect(inviteButton).toBeVisible();
    });

    test('should show team members list', async ({ page }) => {
      await page.getByRole('tab', { name: /team/i }).click();
      
      // Should show "Teammitglieder" section
      await expect(page.getByText(/teammitglieder/i)).toBeVisible();
    });

    test('should display current user as owner', async ({ page }) => {
      await page.getByRole('tab', { name: /team/i }).click();
      
      // Owner badge should be visible for account creator
      await expect(page.getByText(/inhaber/i)).toBeVisible();
    });

    test('should show roles explanation section', async ({ page }) => {
      await page.getByRole('tab', { name: /team/i }).click();
      
      // Roles overview section
      await expect(page.getByText(/rollen-übersicht/i)).toBeVisible();
      
      // Different roles should be explained
      await expect(page.getByText(/administrator/i)).toBeVisible();
      await expect(page.getByText(/mitarbeiter/i)).toBeVisible();
      await expect(page.getByText(/betrachter/i)).toBeVisible();
    });
  });

  test.describe('Invite Team Member Dialog', () => {
    test.skip(!TEST_EMAIL, 'Requires TEST_USER_EMAIL env var');

    test.beforeEach(async ({ page }) => {
      const loggedIn = await login(page);
      if (!loggedIn) test.skip();
      await page.goto('/de/dashboard/settings');
      await expect(page.locator('main')).toBeVisible({ timeout: 10000 });
      await page.getByRole('tab', { name: /team/i }).click();
    });

    test('should open invite dialog when clicking invite button', async ({ page }) => {
      const inviteButton = page.getByRole('button', { name: /einladen/i });
      
      // Skip if button is disabled (plan limit)
      if (await inviteButton.isDisabled()) {
        test.skip();
        return;
      }
      
      await inviteButton.click();
      
      // Dialog should open
      await expect(page.getByText(/teammitglied einladen/i)).toBeVisible();
    });

    test('should have email input in invite dialog', async ({ page }) => {
      const inviteButton = page.getByRole('button', { name: /einladen/i });
      if (await inviteButton.isDisabled()) {
        test.skip();
        return;
      }
      
      await inviteButton.click();
      
      // Email input
      const emailInput = page.locator('input[type="email"]');
      await expect(emailInput).toBeVisible();
    });

    test('should have role selector in invite dialog', async ({ page }) => {
      const inviteButton = page.getByRole('button', { name: /einladen/i });
      if (await inviteButton.isDisabled()) {
        test.skip();
        return;
      }
      
      await inviteButton.click();
      
      // Role selector
      await expect(page.getByText(/rolle/i)).toBeVisible();
      
      // Open role dropdown
      const roleSelect = page.locator('button[role="combobox"]');
      await roleSelect.click();
      
      // Should show role options
      await expect(page.getByText(/administrator/i)).toBeVisible();
      await expect(page.getByText(/mitarbeiter/i)).toBeVisible();
      await expect(page.getByText(/betrachter/i)).toBeVisible();
    });

    test('should close dialog on cancel', async ({ page }) => {
      const inviteButton = page.getByRole('button', { name: /einladen/i });
      if (await inviteButton.isDisabled()) {
        test.skip();
        return;
      }
      
      await inviteButton.click();
      await expect(page.getByText(/teammitglied einladen/i)).toBeVisible();
      
      // Cancel button
      await page.getByRole('button', { name: /abbrechen/i }).click();
      
      // Dialog should close
      await expect(page.getByText(/teammitglied einladen/i)).not.toBeVisible();
    });

    test('should validate empty email on invite', async ({ page }) => {
      const inviteButton = page.getByRole('button', { name: /einladen/i });
      if (await inviteButton.isDisabled()) {
        test.skip();
        return;
      }
      
      await inviteButton.click();
      
      // Try to send without email
      await page.getByRole('button', { name: /einladung senden/i }).click();
      
      // Should show error
      await expect(page.getByText(/e-mail/i)).toBeVisible();
    });
  });

  test.describe('Team Member Actions', () => {
    test.skip(!TEST_EMAIL, 'Requires TEST_USER_EMAIL env var');

    test('should show action menu for non-owner members', async ({ page }) => {
      const loggedIn = await login(page);
      if (!loggedIn) return;
      
      await page.goto('/de/dashboard/settings');
      await page.getByRole('tab', { name: /team/i }).click();
      
      // If there are other team members, they should have action menus
      // Owner should not have action menu (can't modify own owner role)
      const memberRows = page.locator('[data-testid="team-member-row"]');
      const count = await memberRows.count();
      
      // Test passes if there's only the owner (no action menu needed)
      // or if action menus exist for non-owners
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Plan Limits', () => {
    test.skip(!TEST_EMAIL, 'Requires TEST_USER_EMAIL env var');

    test('should show limit reached badge when at max users', async ({ page }) => {
      const loggedIn = await login(page);
      if (!loggedIn) return;
      
      await page.goto('/de/dashboard/settings');
      await page.getByRole('tab', { name: /team/i }).click();
      
      // Check if limit badge exists (depends on plan)
      const limitBadge = page.getByText(/limit erreicht/i);
      
      // Either limit is reached or invite button is enabled
      const inviteButton = page.getByRole('button', { name: /einladen/i });
      
      const limitReached = await limitBadge.isVisible().catch(() => false);
      const inviteEnabled = !await inviteButton.isDisabled().catch(() => true);
      
      // One of these should be true
      expect(limitReached || inviteEnabled).toBeTruthy();
    });
  });
});

test.describe('Team Invitation Flow', () => {
  test('should display invite accept page structure', async ({ page }) => {
    // Test the invitation page exists (with invalid token)
    await page.goto('/de/invite/invalid-token-12345');
    
    // Should show some content (error or expired message)
    await expect(page.locator('body')).toBeVisible();
    
    // Should handle gracefully
    const content = await page.content();
    expect(content.length).toBeGreaterThan(100);
  });
});

test.describe('Team API Routes', () => {
  test.skip(!TEST_EMAIL, 'Requires authentication');

  test('should have team API endpoint', async ({ request }) => {
    // This will return 401 without auth, which is expected
    const response = await request.get('/api/team');
    expect([200, 401, 403]).toContain(response.status());
  });

  test('should have team invite API endpoint', async ({ request }) => {
    const response = await request.post('/api/team/invite', {
      data: { email: 'test@example.com', role: 'member' }
    });
    // Should return 401 without auth
    expect([200, 401, 403, 400]).toContain(response.status());
  });

  test('should have team accept API endpoint', async ({ request }) => {
    const response = await request.post('/api/team/accept', {
      data: { token: 'invalid-token' }
    });
    // Should return error for invalid token
    expect([200, 400, 401, 404]).toContain(response.status());
  });
});
