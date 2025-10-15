import { test, expect } from '@playwright/test';

test.describe('Growth Pack Features', () => {

  test.beforeEach(async ({ page }) => {
    // Mock user state to enable testing growth features
    // This would typically involve setting an auth token for a specific test user
    await page.goto('/#/dashboard');
    await expect(page.getByRole('heading', { name: 'InnovaForge™' })).toBeVisible();
  });

  test('Share to Unlock should grant a reward', async ({ page }) => {
    // Mock the API endpoint for social share rewards
    await page.route('**/api/rewards/social-share', async route => {
      await route.fulfill({
        status: 200,
        json: { success: true, bonus: 2 },
      });
    });

    // Ensure the ShareToUnlock component is visible (might require mocking user state)
    const shareButton = page.getByRole('button', { name: 'Share on X' });
    await expect(shareButton).toBeVisible();

    await shareButton.click();

    // Check for the success toast
    await expect(page.getByText('Thanks for sharing! +2 builds added to your account.')).toBeVisible();
    
    // Check that the share component updates to the "shared" state
    await expect(page.getByText('✅ Thanks for sharing! +2 builds added to your account.')).toBeVisible();
  });

  test('Milestone Tracker should update progress', async ({ page }) => {
    // This test requires mocking the user object with different build counts.
    // For example, to test progress towards the 3-build milestone:
    
    // Initial state (e.g., 2 builds)
    // We would mock the user context to have `usage.buildsStarted: 2`
    const progressBar = page.locator('.bg-gradient-to-r.from-cyan-500');
    // Percentage should be 2/3 = 66.66%
    await expect(progressBar).toHaveAttribute('style', /width: 66.6/);
    await expect(page.getByText('2/3')).toBeVisible();
    await expect(page.getByText(/Unlock a new theme at 3 builds!/)).toBeVisible();
    
    test.skip(true, 'Requires advanced context mocking.');
  });
});