import { test, expect } from '@playwright/test';

test.describe('DarkLanding E2E Tests', () => {
  test('should load main page and verify title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/DarkLanding/i);
  });
});