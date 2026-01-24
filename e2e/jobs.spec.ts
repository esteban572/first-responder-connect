import { test, expect } from '@playwright/test';

test.describe('Job Board', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.evaluate(() => {
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-token',
        refresh_token: 'mock-refresh',
      }));
    });
    
    await page.goto('/jobs');
  });

  test('should display job board', async ({ page }) => {
    await expect(page).toHaveURL(/\/jobs/);
    await expect(page.getByRole('heading', { name: /jobs/i })).toBeVisible();
  });

  test('should show job filters', async ({ page }) => {
    await expect(page.getByPlaceholder(/search jobs/i)).toBeVisible();
    await expect(page.getByRole('combobox', { name: /location/i })).toBeVisible();
  });

  test('should display job listings', async ({ page }) => {
    await page.waitForSelector('[data-testid="job-card"]', { timeout: 5000 });
    
    const jobs = page.locator('[data-testid="job-card"]');
    await expect(jobs.first()).toBeVisible();
  });

  test('should filter jobs by location', async ({ page }) => {
    const locationFilter = page.getByRole('combobox', { name: /location/i });
    await locationFilter.click();
    await page.getByRole('option', { name: /los angeles/i }).click();
    
    // Wait for filtered results
    await page.waitForTimeout(1000);
    
    // Check that results are filtered
    const jobs = page.locator('[data-testid="job-card"]');
    await expect(jobs.first()).toContainText(/los angeles/i);
  });

  test('should open job details', async ({ page }) => {
    await page.waitForSelector('[data-testid="job-card"]', { timeout: 5000 });
    
    const firstJob = page.locator('[data-testid="job-card"]').first();
    await firstJob.click();
    
    // Should navigate to job detail page
    await expect(page).toHaveURL(/\/jobs\/.+/);
    await expect(page.getByRole('button', { name: /apply/i })).toBeVisible();
  });

  test('should show apply dialog', async ({ page }) => {
    await page.waitForSelector('[data-testid="job-card"]', { timeout: 5000 });
    await page.locator('[data-testid="job-card"]').first().click();
    
    const applyButton = page.getByRole('button', { name: /apply/i });
    await applyButton.click();
    
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText(/upload resume/i)).toBeVisible();
  });
});
