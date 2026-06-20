import { test, expect } from '@playwright/test';

test.describe('GreetingHeader E2E Tests', () => {
  test('should load main page and verify title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/GreetingHeader/i);
  });
});