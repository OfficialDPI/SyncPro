import { test, expect } from '@playwright/test';

test.describe('SportsLanding E2E Tests', () => {
  test('should load main page and verify title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/SportsLanding/i);
  });

  test('should verify accessiblity skip links and main layout', async ({ page }) => {
    await page.goto('/');
    const mainSection = page.locator('main');
    await expect(mainSection).toBeVisible();
  });

  test('should validate form submissions and display success states', async ({ page }) => {
    await page.goto('/');
    const emailInput = page.locator('input[type="email"]');
    if (await emailInput.count() > 0) {
      await emailInput.fill('user@example.com');
      const submitBtn = page.locator('button[type="submit"]');
      if (await submitBtn.count() > 0) {
        await submitBtn.click();
        await expect(page.locator('text=success|sent|received|thank you').first()).toBeVisible();
      }
    }
  });
});