import { test, expect } from '@playwright/test';

test.describe('Coffee Shop Landing E2E Tests', () => {
  test('should load main page and verify title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Coffee Shop Landing/i);
  });
});