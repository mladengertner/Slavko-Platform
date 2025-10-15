import { test, expect } from '@playwright/test';

test.describe('Full User Happy Path', () => {

  // Mock a logged-in state for all tests in this suite.
  test.beforeEach(async ({ page, context }) => {
    // For this test, we assume the user is logged in.
    // In a real-world scenario, you would set a session cookie or local storage token.
    // For now, we'll mock API calls that require auth.
    await page.goto('/#/dashboard');
    // Wait for the dashboard to be visible to ensure we've "logged in".
    await expect(page.getByRole('heading', { name: 'InnovaForge™' })).toBeVisible();
  });

  test('should allow a user to generate, build, and view a deployed app', async ({ page }) => {
    // --- STEP 1: GENERATE A NEW IDEA ---
    
    // Mock the limit check API to allow the action
    await page.route('**/api/check-limits', async route => {
      await route.fulfill({ status: 200, json: { canProceed: true } });
    });
    
    // Mock the idea generation API
    await page.route('**/api/ideas/generate', async route => {
      await route.fulfill({
        status: 200,
        json: {
          id: 'new-e2e-idea',
          idea: {
            id: 'new-e2e-idea',
            title: 'My New E2E Test App',
            description: 'Generated via Playwright.',
            slavkoScore: 9.1,
            status: 'pending'
          }
        }
      });
    });

    // Click the button to generate an idea
    await page.getByRole('button', { name: 'Generate New Idea' }).click();

    // Assert that a success toast appears
    await expect(page.getByText('New idea generation triggered!')).toBeVisible();

    // The app uses a real-time subscription (onSnapshot). Mocking this is complex.
    // For this test, we'll assume an existing pending idea is on the page to proceed.
    const ideaCard = page.locator('div:has(h3:has-text("AI-Powered Note Taker"))').first();
    await expect(ideaCard).toBeVisible();


    // --- STEP 2: APPROVE AND BUILD THE IDEA ---

    // Mock the build start API
    await page.route('**/api/builds/start', async route => {
      await route.fulfill({ status: 200, json: { success: true, buildId: 'build-e2e-1' } });
    });
    
    // Click the 'Approve & Build' button on our target idea card
    await ideaCard.getByRole('button', { name: 'Approve & Build' }).click();

    // Assert the build queue toast appears
    await expect(page.getByText(/Build for ".*" has been queued!/)).toBeVisible();


    // --- STEP 3: VIEW THE BUILD IN THE PIPELINE ---

    // Navigate to the Build Pipeline tab
    await page.getByRole('tab', { name: 'Build Pipeline' }).click();
    
    // The running build should be in the Quantum Visualizer.
    // We assume the useBuilds hook shows our "Running App" as the active one.
    await expect(page.getByTestId('quantum-visualizer')).toBeVisible();
    
    // We can also see our previously completed builds
    await expect(page.getByText('Successful App')).toBeVisible();
    await expect(page.getByText('Failed App')).toBeVisible();


    // --- STEP 4: VIEW THE DEPLOYED APP ---

    // Navigate to the Deployed Apps tab
    await page.getByRole('tab', { name: 'Deployed Apps' }).click();

    // In a real flow, the idea's status would update from "building" to "deployed".
    // We'll assert that a previously deployed app card is visible.
    const deployedCard = page.locator('div:has(h3:has-text("Live SaaS Product"))').first();
    await expect(deployedCard).toBeVisible();
    
    // Assert the link is correct
    const viewAppLink = deployedCard.getByRole('link', { name: 'View Live App' });
    await expect(viewAppLink).toHaveAttribute('href', 'https://example.com');
  });
});