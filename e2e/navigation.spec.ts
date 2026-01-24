import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.evaluate(() => {
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-token',
        refresh_token: 'mock-refresh',
      }));
    });
  });

  test('should navigate to feed', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /feed/i }).click();
    await expect(page).toHaveURL(/\/feed/);
  });

  test('should navigate to jobs', async ({ page }) => {
    await page.goto('/feed');
    await page.getByRole('link', { name: /jobs/i }).click();
    await expect(page).toHaveURL(/\/jobs/);
  });

  test('should navigate to groups', async ({ page }) => {
    await page.goto('/feed');
    await page.getByRole('link', { name: /groups/i }).click();
    await expect(page).toHaveURL(/\/groups/);
  });

  test('should navigate to messages', async ({ page }) => {
    await page.goto('/feed');
    await page.getByRole('link', { name: /messages/i }).click();
    await expect(page).toHaveURL(/\/messages/);
  });

  test('should navigate to profile', async ({ page }) => {
    await page.goto('/feed');
    await page.getByRole('link', { name: /profile/i }).click();
    await expect(page).toHaveURL(/\/profile/);
  });

  test('should show mobile navigation on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/feed');
    
    // Mobile nav should be visible
    await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible();
  });

  test('should show desktop sidebar on large screens', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/feed');
    
    // Desktop sidebar should be visible
    await expect(page.locator('[data-testid="desktop-sidebar"]')).toBeVisible();
  });
});
