import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/');
    
    // Check for Google sign-in button
    await expect(page.getByRole('button', { name: /sign in with google/i })).toBeVisible();
  });

  test('should redirect to feed after login', async ({ page }) => {
    // This test requires actual Google OAuth which is complex in E2E
    // For now, we'll test the redirect logic
    await page.goto('/');
    
    // Mock authentication state
    await page.evaluate(() => {
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-token',
        refresh_token: 'mock-refresh',
      }));
    });
    
    await page.goto('/feed');
    await expect(page).toHaveURL(/\/feed/);
  });

  test('should show protected route guard', async ({ page }) => {
    // Clear any existing auth
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());
    
    // Try to access protected route
    await page.goto('/feed');
    
    // Should redirect to home/login
    await expect(page).toHaveURL('/');
  });
});
