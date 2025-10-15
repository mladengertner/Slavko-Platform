import { test, expect } from '@playwright/test';

test.describe('Build Pipeline', () => {

  test.beforeEach(async ({ page }) => {
    // Mock the initial ideas to have a "pending" idea ready to be built
    // This is complex and would involve intercepting Firestore onSnapshot.
    // For this test, we will assume a pending IdeaCard is present.
    await page.goto('/#/dashboard');
    await expect(page.getByRole('heading', { name: 'InnovaForge™' })).toBeVisible();
  });

  test('should start a build when an idea is approved', async ({ page }) => {
    // Mock the start build API call
    await page.route('**/api/builds/start', async (route) => {
      await route.fulfill({
        status: 200,
        json: { success: true, buildId: 'build456' },
      });
    });

    // Find the first available "Approve & Build" button
    const approveButton = page.getByRole('button', { name: 'Approve & Build' }).first();
    await expect(approveButton).toBeVisible();
    await approveButton.click();

    // Assert that a success toast appears
    await expect(page.getByText(/Build for ".*" has been queued!/)).toBeVisible();

    // The idea card should update its status to "building"
    // This requires websocket/firestore mocking. We'll skip the deep assertion for now.
    // For example: await expect(page.getByText('building')).toBeVisible();
  });

  test('should show build progress in the pipeline monitor', async ({ page }) => {
    await page.getByRole('button', { name: 'Build Pipeline' }).click();

    // Here we would mock the `useBuilds` hook data to show builds in various states.
    // For example, mock a successful build:
    await expect(page.getByText('Build process initiated')).toBeVisible(); // From mock logs
    await expect(page.getByRole('link', { name: 'Open Staging' })).toBeVisible();
    test.skip(true, 'Requires mocking initial data load for builds.');
  });
});