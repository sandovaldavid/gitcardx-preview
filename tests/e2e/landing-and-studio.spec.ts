import { test, expect } from '@playwright/test';

test.describe('Gitframe Landing Page & Studio E2E', () => {
  test('landing page renders all major sections and metadata', async ({ page }) => {
    await page.goto('/');

    // Check title & meta
    await expect(page).toHaveTitle(/Gitframe/i);

    // Hero title
    const heroHeading = page.getByRole('heading', { name: /Give your GitHub projects/i });
    await expect(heroHeading).toBeVisible();

    // Preset buttons
    await expect(page.getByRole('button', { name: 'shadcn/ui' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'facebook/react' })).toBeVisible();

    // Live template showcase (one real render per archetype)
    const templatesSection = page.locator('#templates');
    await expect(templatesSection).toBeVisible();
    await expect(templatesSection).toContainText(/Eight templates/i);
    await expect(templatesSection.locator('a[href^="/studio?template="]')).toHaveCount(8);
    await expect(templatesSection).toContainText(/Gitframe/i);

    // URL shortcut + README endpoint section
    const workflowSection = page.locator('#workflow');
    await expect(workflowSection).toBeVisible();
    await expect(workflowSection).toContainText(/One URL\. Every surface\./i);
    await expect(workflowSection).toContainText(/gitframe\.dev/i);

    // Feature bento
    await expect(page.locator('#features')).toBeVisible();
  });

  test('section links scroll repeatedly and the brand returns home', async ({ page }) => {
    await page.goto('/');

    const allTemplates = page.locator('section:first-of-type a[href="#templates"]');
    await allTemplates.click();
    await expect(page.locator('#templates')).toBeInViewport();

    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await allTemplates.click();
    await expect(page.locator('#templates')).toBeInViewport();

    await page.locator('header a[href="/"]').click();
    await expect(page).toHaveURL(/\/$/);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
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

    // Close export modal
    const closeBtn = page.locator('button:has(svg.lucide-x)');
    await closeBtn.click();

    // Toggle Safe Zone Guides overlay
    const safeZoneBtn = page.getByRole('button', { name: /Safe Zone/i });
    await safeZoneBtn.click();
    await expect(page.getByText(/40px SAFE ZONE/i)).toBeVisible();
  });

  test('social simulator switches between all 5 platforms cleanly', async ({ page }) => {
    await page.goto('/studio');

    // Switch to Social Simulator
    await page.getByRole('button', { name: /Social Simulator/i }).click();

    // 1. Twitter
    await page.getByRole('button', { name: 'X (Twitter)' }).click();
    await expect(page.getByText(/Just dropped a major update to/i)).toBeVisible();

    // 2. LinkedIn
    await page.getByRole('button', { name: 'LinkedIn' }).click();
    await expect(page.getByText(/Excited to announce the new visual identity for/i)).toBeVisible();

    // 3. Discord
    await page.getByRole('button', { name: 'Discord' }).click();
    await expect(page.getByText(/GitHub Bot/i)).toBeVisible();

    // 4. Slack
    await page.getByRole('button', { name: 'Slack' }).click();
    await expect(page.getByText(/Repo preview for/i)).toBeVisible();

    // 5. GitHub Feed
    await page.getByRole('button', { name: 'GitHub Feed' }).click();
    await expect(page.getByText(/Starred repository by community/i)).toBeVisible();

    // 6. Test Dark / Light mode simulation toggling
    const lightBtn = page.getByTitle('Light Mode Simulation');
    const darkBtn = page.getByTitle('Dark Mode Simulation');

    await lightBtn.click();
    await expect(page.locator('.bg-white.text-zinc-900').first()).toBeVisible();

    await darkBtn.click();
    await expect(page.locator('.text-zinc-100, .text-\\[\\#c9d1d9\\]').first()).toBeVisible();
  });
});
