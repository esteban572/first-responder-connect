import { test, expect } from '@playwright/test';

test.describe('Feed', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.evaluate(() => {
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-token',
        refresh_token: 'mock-refresh',
      }));
    });
    
    await page.goto('/feed');
  });

  test('should display feed page', async ({ page }) => {
    await expect(page).toHaveURL(/\/feed/);
    await expect(page.getByRole('heading', { name: /feed/i })).toBeVisible();
  });

  test('should show create post button', async ({ page }) => {
    const createButton = page.getByRole('button', { name: /create post/i });
    await expect(createButton).toBeVisible();
  });

  test('should open create post dialog', async ({ page }) => {
    const createButton = page.getByRole('button', { name: /create post/i });
    await createButton.click();
    
    // Check dialog is open
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByPlaceholder(/what's on your mind/i)).toBeVisible();
  });

  test('should display posts', async ({ page }) => {
    // Wait for posts to load
    await page.waitForSelector('[data-testid="post-card"]', { timeout: 5000 });
    
    const posts = page.locator('[data-testid="post-card"]');
    await expect(posts.first()).toBeVisible();
  });

  test('should like a post', async ({ page }) => {
    await page.waitForSelector('[data-testid="post-card"]', { timeout: 5000 });
    
    const likeButton = page.locator('[data-testid="like-button"]').first();
    const initialLikes = await likeButton.textContent();
    
    await likeButton.click();
    
    // Wait for like count to update
    await page.waitForTimeout(500);
    
    const updatedLikes = await likeButton.textContent();
    expect(updatedLikes).not.toBe(initialLikes);
  });

  test('should open comments dialog', async ({ page }) => {
    await page.waitForSelector('[data-testid="post-card"]', { timeout: 5000 });
    
    const commentButton = page.locator('[data-testid="comment-button"]').first();
    await commentButton.click();
    
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByPlaceholder(/add a comment/i)).toBeVisible();
  });
});
