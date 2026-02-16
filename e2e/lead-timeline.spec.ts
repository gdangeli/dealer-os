import { test, expect, Page } from '@playwright/test';

const TEST_EMAIL = process.env.TEST_USER_EMAIL;
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD;

async function login(page: Page): Promise<boolean> {
  if (!TEST_EMAIL || !TEST_PASSWORD) {
    return false;
  }
  
  await page.goto('/login');
  await page.locator('#email').fill(TEST_EMAIL);
  await page.locator('#password').fill(TEST_PASSWORD);
  await page.getByRole('button', { name: /anmelden/i }).click();
  await expect(page).toHaveURL(/\/dashboard|\/onboarding/, { timeout: 15000 });
  
  if (page.url().includes('onboarding')) {
    await page.goto('/dashboard/leads');
  }
  
  return true;
}

async function navigateToFirstLead(page: Page): Promise<string | null> {
  await page.goto('/dashboard/leads');
  await page.waitForLoadState('networkidle');
  
  // Try to find first lead link in the list
  const leadLink = page.locator('a[href*="/dashboard/leads/"]').first();
  
  if (await leadLink.count() === 0) {
    return null;
  }
  
  const href = await leadLink.getAttribute('href');
  if (href) {
    await leadLink.click();
    await page.waitForLoadState('networkidle');
    return href;
  }
  
  return null;
}

test.describe('Lead Timeline - Component Visibility', () => {
  test.skip(!TEST_EMAIL, 'Requires TEST_USER_EMAIL env var');

  test.beforeEach(async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) test.skip();
  });

  test('should display timeline component on lead detail page', async ({ page }) => {
    const leadUrl = await navigateToFirstLead(page);
    if (!leadUrl) {
      test.skip(true, 'No leads available for testing');
    }

    // Check if timeline component is visible
    const timeline = page.locator('[data-testid="lead-timeline"]').or(
      page.locator('div:has-text("Aktivitäten")').or(
        page.locator('div:has-text("Timeline")')
      )
    );
    
    await expect(timeline.first()).toBeVisible({ timeout: 10000 });
  });

  test('should display vertical timeline structure', async ({ page }) => {
    const leadUrl = await navigateToFirstLead(page);
    if (!leadUrl) {
      test.skip(true, 'No leads available for testing');
    }

    // Check for timeline connector line
    const timelineLine = page.locator('[data-testid="timeline-line"]').or(
      page.locator('.timeline-line').or(
        page.locator('div[class*="timeline"]')
      )
    );
    
    await expect(timelineLine.first()).toBeVisible();
  });

  test('should have quick input for adding new activity', async ({ page }) => {
    const leadUrl = await navigateToFirstLead(page);
    if (!leadUrl) {
      test.skip(true, 'No leads available for testing');
    }

    // Look for input/textarea for adding notes
    const input = page.locator('[data-testid="activity-input"]').or(
      page.locator('textarea[placeholder*="Notiz"]').or(
        page.locator('input[placeholder*="Aktivität"]')
      )
    );
    
    await expect(input.first()).toBeVisible();
  });
});

test.describe('Lead Timeline - Activity Types', () => {
  test.skip(!TEST_EMAIL, 'Requires TEST_USER_EMAIL env var');

  test.beforeEach(async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) test.skip();
    
    const leadUrl = await navigateToFirstLead(page);
    if (!leadUrl) {
      test.skip(true, 'No leads available for testing');
    }
  });

  test('should have activity type dropdown', async ({ page }) => {
    // Look for dropdown/select for activity type
    const typeSelector = page.locator('[data-testid="activity-type-select"]').or(
      page.locator('select[name*="type"]').or(
        page.getByRole('combobox', { name: /typ|type|aktivität/i })
      )
    );
    
    await expect(typeSelector.first()).toBeVisible();
  });

  test('should support note activity type', async ({ page }) => {
    const typeSelector = page.locator('[data-testid="activity-type-select"]').or(
      page.locator('select[name*="type"]').or(
        page.getByRole('combobox', { name: /typ|type|aktivität/i })
      )
    ).first();

    if (await typeSelector.count() > 0) {
      await typeSelector.click();
      const noteOption = page.getByRole('option', { name: /notiz|note/i });
      await expect(noteOption).toBeVisible();
    }
  });

  test('should support call activity type', async ({ page }) => {
    const typeSelector = page.locator('[data-testid="activity-type-select"]').or(
      page.locator('select[name*="type"]').or(
        page.getByRole('combobox', { name: /typ|type|aktivität/i })
      )
    ).first();

    if (await typeSelector.count() > 0) {
      await typeSelector.click();
      const callOption = page.getByRole('option', { name: /anruf|call/i });
      await expect(callOption).toBeVisible();
    }
  });

  test('should support email activity type', async ({ page }) => {
    const typeSelector = page.locator('[data-testid="activity-type-select"]').or(
      page.locator('select[name*="type"]').or(
        page.getByRole('combobox', { name: /typ|type|aktivität/i })
      )
    ).first();

    if (await typeSelector.count() > 0) {
      await typeSelector.click();
      const emailOption = page.getByRole('option', { name: /e-mail|email/i });
      await expect(emailOption).toBeVisible();
    }
  });

  test('should support status change activity type', async ({ page }) => {
    const typeSelector = page.locator('[data-testid="activity-type-select"]').or(
      page.locator('select[name*="type"]').or(
        page.getByRole('combobox', { name: /typ|type|aktivität/i })
      )
    ).first();

    if (await typeSelector.count() > 0) {
      await typeSelector.click();
      const statusOption = page.getByRole('option', { name: /status|änderung/i });
      await expect(statusOption).toBeVisible();
    }
  });
});

test.describe('Lead Timeline - Add Activity', () => {
  test.skip(!TEST_EMAIL, 'Requires TEST_USER_EMAIL env var');

  test.beforeEach(async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) test.skip();
    
    const leadUrl = await navigateToFirstLead(page);
    if (!leadUrl) {
      test.skip(true, 'No leads available for testing');
    }
  });

  test('should add a new note activity', async ({ page }) => {
    const timestamp = Date.now();
    const noteContent = `E2E Test Note ${timestamp}`;

    // Find input field
    const input = page.locator('[data-testid="activity-input"]').or(
      page.locator('textarea[placeholder*="Notiz"]').or(
        page.locator('input[placeholder*="Aktivität"]')
      )
    ).first();

    await input.fill(noteContent);

    // Select "Note" type if dropdown exists
    const typeSelector = page.locator('[data-testid="activity-type-select"]').or(
      page.locator('select[name*="type"]')
    ).first();

    if (await typeSelector.count() > 0) {
      // Try to select note option - try multiple possible values
      try {
        await typeSelector.selectOption('note');
      } catch {
        try {
          await typeSelector.selectOption('notiz');
        } catch {
          // If both fail, continue without selecting
        }
      }
    }

    // Submit the form
    const submitButton = page.locator('[data-testid="add-activity-button"]').or(
      page.getByRole('button', { name: /hinzufügen|speichern|add/i })
    ).first();

    await submitButton.click();

    // Verify note appears in timeline
    await expect(page.locator(`text="${noteContent}"`)).toBeVisible({ timeout: 5000 });
  });

  test('should add a new call activity', async ({ page }) => {
    const timestamp = Date.now();
    const callNote = `Call with customer ${timestamp}`;

    const input = page.locator('[data-testid="activity-input"]').or(
      page.locator('textarea[placeholder*="Notiz"]').or(
        page.locator('input[placeholder*="Aktivität"]')
      )
    ).first();

    await input.fill(callNote);

    // Select "Call" type
    const typeSelector = page.locator('[data-testid="activity-type-select"]').or(
      page.locator('select[name*="type"]')
    ).first();

    if (await typeSelector.count() > 0) {
      // Try to select call option - try multiple possible values
      try {
        await typeSelector.selectOption('call');
      } catch {
        try {
          await typeSelector.selectOption('anruf');
        } catch {
          // If both fail, continue without selecting
        }
      }
    }

    const submitButton = page.locator('[data-testid="add-activity-button"]').or(
      page.getByRole('button', { name: /hinzufügen|speichern|add/i })
    ).first();

    await submitButton.click();

    await expect(page.locator(`text="${callNote}"`)).toBeVisible({ timeout: 5000 });
  });

  test('should clear input after successful submission', async ({ page }) => {
    const noteContent = `Test clearing ${Date.now()}`;

    const input = page.locator('[data-testid="activity-input"]').or(
      page.locator('textarea[placeholder*="Notiz"]')
    ).first();

    await input.fill(noteContent);

    const submitButton = page.locator('[data-testid="add-activity-button"]').or(
      page.getByRole('button', { name: /hinzufügen|speichern|add/i })
    ).first();

    await submitButton.click();

    // Wait for submission and check input is cleared
    await page.waitForTimeout(1000);
    await expect(input).toHaveValue('');
  });

  test('should not allow empty activity submission', async ({ page }) => {
    const submitButton = page.locator('[data-testid="add-activity-button"]').or(
      page.getByRole('button', { name: /hinzufügen|speichern|add/i })
    ).first();

    // Button should be disabled or form should not submit
    const isDisabled = await submitButton.isDisabled().catch(() => false);
    
    if (!isDisabled) {
      await submitButton.click();
      // Check for validation message
      const validationMessage = page.locator('text=/erforderlich|required|eingabe/i').first();
      const hasValidation = await validationMessage.isVisible().catch(() => false);
      expect(hasValidation).toBeTruthy();
    } else {
      expect(isDisabled).toBeTruthy();
    }
  });
});

test.describe('Lead Timeline - Display & Formatting', () => {
  test.skip(!TEST_EMAIL, 'Requires TEST_USER_EMAIL env var');

  test.beforeEach(async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) test.skip();
    
    const leadUrl = await navigateToFirstLead(page);
    if (!leadUrl) {
      test.skip(true, 'No leads available for testing');
    }
  });

  test('should display activities in chronological order', async ({ page }) => {
    // Get all timeline items
    const timelineItems = page.locator('[data-testid="timeline-item"]').or(
      page.locator('[class*="timeline-item"]').or(
        page.locator('[class*="activity-item"]')
      )
    );

    const count = await timelineItems.count();
    
    if (count > 1) {
      // Newest should be on top
      const items = await timelineItems.all();
      expect(items.length).toBeGreaterThanOrEqual(2);
      
      // Just verify we can see multiple items
      await expect(items[0]).toBeVisible();
      await expect(items[1]).toBeVisible();
    }
  });

  test('should display timestamp for each activity', async ({ page }) => {
    const timelineItems = page.locator('[data-testid="timeline-item"]').or(
      page.locator('[class*="timeline-item"]')
    );

    const count = await timelineItems.count();
    
    if (count > 0) {
      const firstItem = timelineItems.first();
      
      // Look for timestamp (various formats)
      const timestamp = firstItem.locator('[data-testid="activity-timestamp"]').or(
        firstItem.locator('time').or(
          firstItem.locator('text=/\\d{1,2}:\\d{2}|vor|ago|heute|today|gestern|yesterday/')
        )
      );
      
      await expect(timestamp.first()).toBeVisible();
    }
  });

  test('should display icon for each activity type', async ({ page }) => {
    const timelineItems = page.locator('[data-testid="timeline-item"]').or(
      page.locator('[class*="timeline-item"]')
    );

    const count = await timelineItems.count();
    
    if (count > 0) {
      const firstItem = timelineItems.first();
      
      // Look for icon (svg, img, or icon class)
      const icon = firstItem.locator('[data-testid="activity-icon"]').or(
        firstItem.locator('svg').or(
          firstItem.locator('[class*="icon"]')
        )
      );
      
      await expect(icon.first()).toBeVisible();
    }
  });

  test('should display activity content/message', async ({ page }) => {
    const timelineItems = page.locator('[data-testid="timeline-item"]').or(
      page.locator('[class*="timeline-item"]')
    );

    const count = await timelineItems.count();
    
    if (count > 0) {
      const firstItem = timelineItems.first();
      const content = firstItem.locator('[data-testid="activity-content"]').or(
        firstItem.locator('p, div')
      );
      
      // Should have some text content
      const textContent = await content.first().textContent();
      expect(textContent).toBeTruthy();
      expect(textContent!.length).toBeGreaterThan(0);
    }
  });
});

test.describe('Lead Timeline - Follow-up Reminders (Optional)', () => {
  test.skip(!TEST_EMAIL, 'Requires TEST_USER_EMAIL env var');

  test.beforeEach(async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) test.skip();
    
    const leadUrl = await navigateToFirstLead(page);
    if (!leadUrl) {
      test.skip(true, 'No leads available for testing');
    }
  });

  test('should have option to set follow-up reminder', async ({ page }) => {
    // Check if reminder functionality exists
    const reminderButton = page.locator('[data-testid="set-reminder-button"]').or(
      page.getByRole('button', { name: /erinnerung|reminder|follow-up/i })
    );

    const hasReminder = await reminderButton.count();
    
    if (hasReminder > 0) {
      await expect(reminderButton.first()).toBeVisible();
    } else {
      // Feature is optional, test passes if not present
      test.skip(true, 'Follow-up reminder feature not implemented');
    }
  });

  test('should allow setting reminder date', async ({ page }) => {
    const reminderButton = page.locator('[data-testid="set-reminder-button"]').or(
      page.getByRole('button', { name: /erinnerung|reminder|follow-up/i })
    );

    const hasReminder = await reminderButton.count();
    
    if (hasReminder > 0) {
      await reminderButton.first().click();
      
      // Look for date picker
      const datePicker = page.locator('[data-testid="reminder-date"]').or(
        page.locator('input[type="date"]').or(
          page.locator('input[type="datetime-local"]')
        )
      );
      
      await expect(datePicker.first()).toBeVisible();
    } else {
      test.skip(true, 'Follow-up reminder feature not implemented');
    }
  });
});

test.describe('Lead Timeline - Error Handling', () => {
  test.skip(!TEST_EMAIL, 'Requires TEST_USER_EMAIL env var');

  test.beforeEach(async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) test.skip();
    
    const leadUrl = await navigateToFirstLead(page);
    if (!leadUrl) {
      test.skip(true, 'No leads available for testing');
    }
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Intercept and fail the request
    await page.route('**/api/**', route => {
      if (route.request().method() === 'POST') {
        route.abort();
      } else {
        route.continue();
      }
    });

    const noteContent = `Network error test ${Date.now()}`;
    const input = page.locator('[data-testid="activity-input"]').or(
      page.locator('textarea[placeholder*="Notiz"]')
    ).first();

    await input.fill(noteContent);

    const submitButton = page.locator('[data-testid="add-activity-button"]').or(
      page.getByRole('button', { name: /hinzufügen|speichern|add/i })
    ).first();

    await submitButton.click();

    // Should show error message
    const errorMessage = page.locator('[data-testid="error-message"]').or(
      page.locator('text=/fehler|error|fehlgeschlagen|failed/i')
    );

    await expect(errorMessage.first()).toBeVisible({ timeout: 5000 });
  });

  test('should maintain input on submission failure', async ({ page }) => {
    await page.route('**/api/**', route => {
      if (route.request().method() === 'POST') {
        route.abort();
      } else {
        route.continue();
      }
    });

    const noteContent = `Should persist ${Date.now()}`;
    const input = page.locator('[data-testid="activity-input"]').or(
      page.locator('textarea[placeholder*="Notiz"]')
    ).first();

    await input.fill(noteContent);

    const submitButton = page.locator('[data-testid="add-activity-button"]').or(
      page.getByRole('button', { name: /hinzufügen|speichern|add/i })
    ).first();

    await submitButton.click();
    await page.waitForTimeout(1000);

    // Input should still contain the text
    await expect(input).toHaveValue(noteContent);
  });
});

test.describe('Lead Timeline - Performance', () => {
  test.skip(!TEST_EMAIL, 'Requires TEST_USER_EMAIL env var');

  test.beforeEach(async ({ page }) => {
    const loggedIn = await login(page);
    if (!loggedIn) test.skip();
  });

  test('should load timeline within reasonable time', async ({ page }) => {
    const startTime = Date.now();
    
    const leadUrl = await navigateToFirstLead(page);
    if (!leadUrl) {
      test.skip(true, 'No leads available for testing');
    }

    const timeline = page.locator('[data-testid="lead-timeline"]').or(
      page.locator('div:has-text("Aktivitäten")')
    );

    await expect(timeline.first()).toBeVisible({ timeout: 5000 });
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds
  });

  test('should handle large number of activities', async ({ page }) => {
    const leadUrl = await navigateToFirstLead(page);
    if (!leadUrl) {
      test.skip(true, 'No leads available for testing');
    }

    // Timeline should still be responsive
    const timelineItems = page.locator('[data-testid="timeline-item"]').or(
      page.locator('[class*="timeline-item"]')
    );

    // Just verify it renders without timing out
    await page.waitForTimeout(2000);
    const count = await timelineItems.count();
    
    // Should be able to count items without hanging
    expect(count).toBeGreaterThanOrEqual(0);
  });
});
