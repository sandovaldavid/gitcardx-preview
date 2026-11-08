import { test, expect } from '@playwright/test';

test.describe('GitCardX Landing Page & Studio E2E', () => {
  test('landing page renders all major sections and metadata', async ({ page }) => {
    await page.goto('/');

    // Check title & meta
    await expect(page).toHaveTitle(/GitCardX/i);

    // Hero title
    const heroHeading = page.getByRole('heading', { name: /Give your GitHub projects/i });
    await expect(heroHeading).toBeVisible();

    // Preset buttons
    await expect(page.getByRole('button', { name: 'shadcn/ui' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'facebook/react' })).toBeVisible();

    // Archetype showcase section
    const templatesSection = page.locator('#templates');
    await expect(templatesSection).toBeVisible();
    await expect(templatesSection).toContainText(/8 Purpose-Built Archetypes/i);

    // Comparison section
    const comparisonSection = page.locator('#comparison');
    await expect(comparisonSection).toBeVisible();
    await expect(comparisonSection).toContainText(/Default GitHub Card vs. GitCardX/i);

    // URL shortcut section
    const urlTrickSection = page.locator('#url-trick');
    await expect(urlTrickSection).toBeVisible();
    await expect(urlTrickSection).toContainText(/gitcardx\.dev/i);

    // Dynamic API section
    const dynamicApiSection = page.locator('#dynamic-api');
    await expect(dynamicApiSection).toBeVisible();
    await expect(dynamicApiSection).toContainText(/Embed Live in your README/i);
  });

  test('submitting a repository in the hero omnibar redirects to direct repo route', async ({
    page,
  }) => {
    await page.goto('/');

    const input = page.locator('input[placeholder*="owner/repository"]');
    await input.fill('tailwindlabs/tailwindcss');

    const submitBtn = page.getByRole('button', { name: /generate/i });
    await submitBtn.click();

    await page.waitForURL('**/tailwindlabs/tailwindcss', { timeout: 15000 });
    expect(page.url()).toContain('/tailwindlabs/tailwindcss');
  });

  test('studio loads canvas, inspectors and allows template switching', async ({ page }) => {
    await page.goto('/studio');

    // Studio header & view modes
    await expect(page.getByRole('button', { name: /Card Studio/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Social Simulator/i })).toBeVisible();

    // Export button in header
    const exportBtn = page.getByRole('button', { name: /export/i });
    await expect(exportBtn).toBeVisible();

    // Switching to Social Simulator
    await page.getByRole('button', { name: /Social Simulator/i }).click();
    await expect(page.getByRole('button', { name: 'X (Twitter)' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'LinkedIn' })).toBeVisible();

    // Return to Canvas
    await page.getByRole('button', { name: /Card Studio/i }).click();

    // Open Export Modal
    await exportBtn.click();
    await expect(page.getByRole('heading', { name: /Export & Integrate Card/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /GitHub Social Preview/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Dynamic README Hero/i })).toBeVisible();
  });
});
