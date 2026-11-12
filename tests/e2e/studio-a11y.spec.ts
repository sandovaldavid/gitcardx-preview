import { test, expect } from '@playwright/test';

test.describe('Studio Accessibility & Responsive E2E', () => {
  test('single h1 heading exists on landing and studio pages', async ({ page }) => {
    await page.goto('/');
    const landingH1s = page.locator('h1');
    await expect(landingH1s).toHaveCount(1);
    await expect(landingH1s).toContainText(/Give your GitHub projects/i);

    await page.goto('/studio');
    const studioH1s = page.locator('h1');
    await expect(studioH1s).toHaveCount(1);
    await expect(studioH1s).toContainText(/Gitframe/i);
  });

  test('skip link jumps focus to main content container', async ({ page }) => {
    await page.goto('/studio');
    await page.keyboard.press('Tab');
    const skipLink = page.locator('.skip-link');
    await expect(skipLink).toBeFocused();

    await page.keyboard.press('Enter');
    const focusedId = await page.evaluate(() => document.activeElement?.id);
    expect(focusedId).toBe('main-content');
  });

  test('mobile 360px viewport has zero horizontal scroll and working view tabs', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    await page.goto('/studio');

    // Confirm no horizontal scroll
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalOverflow).toBe(false);

    // Verify mobile navigation buttons are visible
    const mobileNav = page.getByRole('navigation', { name: 'Studio View Navigation' });
    await expect(mobileNav).toBeVisible();

    const contentTab = mobileNav.getByRole('button', { name: 'Content' });
    const previewTab = mobileNav.getByRole('button', { name: 'Preview' });
    const designTab = mobileNav.getByRole('button', { name: 'Design' });

    // Switch to Content
    await contentTab.click();
    await expect(contentTab).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('heading', { name: 'Card Content & Metrics' })).toBeVisible();

    // Switch to Design
    await designTab.click();
    await expect(designTab).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: 'Templates' })).toBeVisible();

    // Switch back to Preview
    await previewTab.click();
    await expect(previewTab).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('studio-canvas')).toBeVisible();
  });

  test('export modal operates as accessible native dialog', async ({ page }) => {
    await page.goto('/studio');

    const exportBtn = page.getByRole('button', { name: 'Export Card' });
    await exportBtn.click();

    const dialog = page.locator('dialog#export-dialog');
    await expect(dialog).toBeVisible();

    // Check modal attribute
    const isModal = await dialog.evaluate((el: HTMLDialogElement) => el.open);
    expect(isModal).toBe(true);

    // Press Escape to dismiss
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();

    // Focus restored to trigger
    await expect(exportBtn).toBeFocused();
  });
});
