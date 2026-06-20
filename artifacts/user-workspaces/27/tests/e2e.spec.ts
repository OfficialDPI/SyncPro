import { test, expect } from '@playwright/test';

test.describe('SimpleCounter E2E Tests', () => {
  test('should load main page and verify title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/SimpleCounter/i);
  });
});