import { test, expect } from "@playwright/test";

test.describe("Dashboard Catch-All Route", () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto("/de/login");
    await page.fill('input[type="email"]', "test@example.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard");
  });

  test("should redirect to 404 for invalid dashboard routes", async ({
    page,
  }) => {
    // Navigate to an invalid dashboard route
    await page.goto("/de/dashboard/this-page-does-not-exist");

    // Should show 404 page
    await expect(page.locator("text=/404|nicht gefunden/i")).toBeVisible();
  });

  test("should redirect to 404 for nested invalid routes", async ({
    page,
  }) => {
    // Navigate to a deeply nested invalid route
    await page.goto("/de/dashboard/invalid/nested/route");

    // Should show 404 page
    await expect(page.locator("text=/404|nicht gefunden/i")).toBeVisible();
  });

  test("should handle invalid route with special characters", async ({
    page,
  }) => {
    // Navigate to invalid route with special characters
    await page.goto("/de/dashboard/invalid-@#$%");

    // Should show 404 page
    await expect(page.locator("text=/404|nicht gefunden/i")).toBeVisible();
  });
});
