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

    // Real project comparison section
    const comparisonSection = page.locator('#comparison');
    await expect(comparisonSection).toBeVisible();
    await expect(comparisonSection).toContainText(/Default GitHub Preview vs\. Gitframe/i);
    await expect(comparisonSection.getByRole('button', { name: 'shadcn-ui/ui' })).toBeVisible();
    await expect(
      comparisonSection.getByRole('button', { name: 'tailwindlabs/tailwindcss' })
    ).toBeVisible();

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
    await expect(page.getByTestId('studio-card-stage')).toBeVisible();
    await expect(page.getByTestId('studio-card-stage')).toContainText(/tailwindcss/i);

    // Ensure zero Next.js Blocking Route / runtime issues in dev overlay
    await expect(page.getByRole('button', { name: /Open issues overlay/i })).toHaveCount(0);

    // Verify the 1280x640 card scaler is properly scaled and dead-center inside main canvas
    await expect(page.getByTestId('studio-card-scaler')).toBeVisible();
    await expect
      .poll(async () => {
        const mainBox = await page.getByTestId('studio-canvas').boundingBox();
        const scalerBox = await page.getByTestId('studio-card-scaler').boundingBox();
        if (!mainBox || !scalerBox) return null;
        return {
          width: scalerBox.width,
          dx: Math.abs(scalerBox.x + scalerBox.width / 2 - (mainBox.x + mainBox.width / 2)),
          dy: Math.abs(scalerBox.y + scalerBox.height / 2 - (mainBox.y + mainBox.height / 2)),
        };
      })
      .toEqual({
        width: expect.any(Number),
        dx: expect.any(Number),
        dy: expect.any(Number),
      });

    const mainBox = await page.getByTestId('studio-canvas').boundingBox();
    const scalerBox = await page.getByTestId('studio-card-scaler').boundingBox();
    expect(mainBox).not.toBeNull();
    expect(scalerBox).not.toBeNull();
    if (mainBox && scalerBox) {
      expect(scalerBox.width).toBeLessThan(1200);
      const mainCenterX = mainBox.x + mainBox.width / 2;
      const mainCenterY = mainBox.y + mainBox.height / 2;
      const cardCenterX = scalerBox.x + scalerBox.width / 2;
      const cardCenterY = scalerBox.y + scalerBox.height / 2;
      expect(Math.abs(cardCenterX - mainCenterX)).toBeLessThanOrEqual(2);
      expect(Math.abs(cardCenterY - mainCenterY)).toBeLessThanOrEqual(2);
    }

    // Switching repo in-place from Studio Omnibar keeps card stage mounted and updates URL + card
    const omnibar = page.locator('input[placeholder*="Search any repository"]');
    await omnibar.fill('facebook/react');
    await omnibar.press('Enter');

    await expect(page).toHaveURL(/\/facebook\/react$/, { timeout: 15000 });
    await expect(page.getByTestId('studio-card-stage')).toBeVisible();
    await expect(page.getByTestId('studio-card-stage')).toContainText(/react/i);

    // Direct cold navigation to /[owner]/[repo] also renders centered with zero Blocking Route errors
    await page.goto('/sandovaldavid/portfolio');
    await expect(page.getByTestId('studio-card-stage')).toBeVisible();
    await expect(page.getByTestId('studio-card-stage')).toContainText(/portfolio/i);
    await expect(page.getByRole('button', { name: /Open issues overlay/i })).toHaveCount(0);

    const coldMainBox = await page.getByTestId('studio-canvas').boundingBox();
    const coldScalerBox = await page.getByTestId('studio-card-scaler').boundingBox();
    expect(coldMainBox).not.toBeNull();
    expect(coldScalerBox).not.toBeNull();
    if (coldMainBox && coldScalerBox) {
      expect(coldScalerBox.width).toBeLessThan(1200);
      expect(
        Math.abs(
          coldScalerBox.x + coldScalerBox.width / 2 - (coldMainBox.x + coldMainBox.width / 2)
        )
      ).toBeLessThanOrEqual(2);
      expect(
        Math.abs(
          coldScalerBox.y + coldScalerBox.height / 2 - (coldMainBox.y + coldMainBox.height / 2)
        )
      ).toBeLessThanOrEqual(2);
    }
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

  test('studio font picker searches API catalog, updates live preview, and exports SVG cleanly', async ({
    page,
  }) => {
    await page.goto('/studio');

    // Open Typography / Fonts tab in Right Inspector
    await page.getByRole('button', { name: 'Fonts' }).click();
    await expect(page.getByText(/Curated Pairings/i)).toBeVisible();

    // Open Heading Font Picker and search for "Outfit"
    await page.getByTestId('font-picker-trigger-heading').click();
    const searchInput = page.getByTestId('font-picker-search-heading');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('Outfit');

    await page.getByTestId('font-option-outfit').click();

    // Verify dynamic @font-face rule injected for Outfit and live card canvas reflects Outfit
    await expect
      .poll(() =>
        page.evaluate(() => document.getElementById('gitframe-dynamic-fonts')?.textContent ?? '')
      )
      .toContain("font-family:'Outfit'");

    await expect(page.getByTestId('font-picker-trigger-heading')).toContainText('Outfit');

    // Switch Monospace Font via picker to Space Mono
    await page.getByTestId('font-picker-trigger-mono').click();
    await page.getByTestId('font-option-space-mono').click();
    await expect(page.getByTestId('font-picker-trigger-mono')).toContainText('Space Mono');

    // Verify Export Modal Dynamic README snippet includes chosen fonts
    await page.getByRole('button', { name: /export/i }).click();
    await page.getByRole('button', { name: /Dynamic README Hero/i }).click();
    await expect(page.locator('pre').first()).toContainText('font_heading=Outfit');
    await expect(page.locator('pre').first()).toContainText('font_mono=Space+Mono');

    // Close modal, enter emojis in Tagline / Description, and verify downloaded SVG embeds emoji images
    await page.locator('button:has(svg.lucide-x)').click();
    const taglineBox = page.getByPlaceholder(/Short, impactful description/i);
    await taglineBox.fill('🚀 Fast & ✨ accessible toolkit ❤️');
    await expect(page.getByTestId('studio-card-stage')).toContainText('🚀 Fast & ✨ accessible');

    await page.getByRole('button', { name: /export/i }).click();
    await page.getByRole('button', { name: /GitHub Social Preview/i }).click();
    const [renderResponse] = await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes('/api/card/render') && res.request().method() === 'POST'
      ),
      page.getByRole('button', { name: 'Download SVG' }).click(),
    ]);
    expect(renderResponse.status()).toBe(200);
    const exportedSvg = await renderResponse.text();
    expect(exportedSvg).toContain('data:image/svg+xml;base64,');

    // Ensure zero Next.js runtime/dev overlay errors
    await expect(page.getByRole('button', { name: /Open issues overlay/i })).toHaveCount(0);
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

  test('visible elements & layers accurately reflect selected template capabilities', async ({
    page,
  }) => {
    await page.goto('/studio');

    // Default Modern Minimal (9 supported layers; 7 active by default)
    await expect(page.getByText('7/9 active')).toBeVisible();
    await expect(page.locator('[data-layer-key="installCommand"]')).toHaveAttribute(
      'data-layer-status',
      'not-in-template'
    );
    await expect(page.locator('[data-layer-key="release"]')).toHaveAttribute(
      'data-layer-status',
      'not-in-template'
    );
    await expect(page.locator('[data-layer-key="contributors"]')).toHaveAttribute(
      'data-layer-status',
      'not-in-template'
    );
    await expect(page.locator('#card-install-input')).toBeDisabled();
    await expect(
      page.getByRole('button', {
        name: 'Install command snippet is not rendered in Modern Minimal',
      })
    ).toBeDisabled();
    await expect(
      page
        .locator('[data-layer-key="installCommand"]')
        .getByRole('button', { name: 'Install Command is not rendered in Modern Minimal' })
    ).toBeDisabled();

    // Switch to Terminal Prompt: installCommand enabled, stack/logos/contributors & customLogo disabled
    await page.getByRole('button', { name: /Terminal Prompt/i }).click();
    await expect(page.getByText('6/9 active')).toBeVisible();
    await expect(page.locator('[data-layer-key="installCommand"]')).toHaveAttribute(
      'data-layer-status',
      'active'
    );
    await expect(page.locator('#card-install-input')).toBeEnabled();
    await expect(page.locator('#card-logo-url-input')).toBeDisabled();
    await expect(page.locator('[data-layer-key="techStack"]')).toHaveAttribute(
      'data-layer-status',
      'not-in-template'
    );
    await expect(page.locator('[data-layer-key="languageLogos"]')).toHaveAttribute(
      'data-layer-status',
      'not-in-template'
    );
    await expect(page.locator('[data-layer-key="contributors"]')).toHaveAttribute(
      'data-layer-status',
      'not-in-template'
    );

    // Switch to Metric Showcase: contributors & stack enabled, hiding stack marks logos Stack off
    await page.getByRole('button', { name: /Metric Showcase/i }).click();
    await expect(page.getByText('8/11 active')).toBeVisible();
    await expect(page.locator('[data-layer-key="contributors"]')).toHaveAttribute(
      'data-layer-status',
      'active'
    );
    await expect(page.locator('[data-layer-key="installCommand"]')).toHaveAttribute(
      'data-layer-status',
      'not-in-template'
    );

    await page.getByRole('button', { name: 'Hide Tech Stack Badges on card' }).click();
    await expect(page.getByText('6/11 active')).toBeVisible();
    await expect(page.locator('[data-layer-key="languageLogos"]')).toHaveAttribute(
      'data-layer-status',
      'parent-hidden'
    );
    await expect(page.locator('[data-layer-key="languageLogos"]')).toContainText('Stack off');
    await expect(
      page.getByRole('button', { name: 'Official Logos unavailable (Stack off)' })
    ).toBeDisabled();
  });

  test('serves favicon.ico globally for API routes and maintains Studio -> Export -> API/Share URL parity', async ({
    page,
  }) => {
    // 1. Root /favicon.ico returns valid ICO bytes for raw API tabs as well as HTML routes
    const faviconRes = await page.request.get('/favicon.ico');
    expect(faviconRes.status()).toBe(200);
    expect(faviconRes.headers()['content-type']).toContain('icon');
    const faviconBytes = await faviconRes.body();
    expect(faviconBytes.subarray(0, 4)).toEqual(Buffer.from([0x00, 0x00, 0x01, 0x00]));

    await page.goto('/');
    await expect(page.locator('link[rel="icon"]').first()).toHaveAttribute('href', /icon/i);

    // 2. Direct API card renders cleanly without NOASSERTION license leakage
    const defaultApiSvgRes = await page.request.get('/api/card/sandovaldavid/gitframe.svg');
    expect(defaultApiSvgRes.status()).toBe(200);
    const defaultApiSvg = await defaultApiSvgRes.text();
    expect(defaultApiSvg).not.toContain('NOASSERTION');

    // 3. Customize composition in Studio
    await page.goto('/studio');
    await page.getByRole('button', { name: /Terminal Prompt/i }).click();
    await page.locator('#card-tagline-input').fill('Custom CLI (Zero Config) card');
    await page.locator('#card-install-input').fill('bunx gitframe@latest');
    await page.getByRole('button', { name: 'Hide Forks Count on card' }).click();

    await page.getByRole('button', { name: 'Theme' }).click();
    await page.getByRole('button', { name: /Nord/i }).click();

    await page.getByRole('button', { name: 'Pattern' }).click();
    await page.getByRole('button', { name: /Dot Matrix/i }).click();

    // 4. Open Export Modal -> Dynamic README Hero and inspect both Direct Image URL and Studio link
    await page.getByRole('button', { name: 'Export card' }).click();
    await page.getByRole('button', { name: /Dynamic README Hero/i }).click();

    const directImageUrl = await page.locator('#export-direct-image-url').inputValue();
    const parsedImgUrl = new URL(directImageUrl);
    expect(parsedImgUrl.pathname).toBe('/api/card/sandovaldavid/gitframe.png');
    expect(parsedImgUrl.searchParams.get('template')).toBe('terminal-prompt');
    expect(parsedImgUrl.searchParams.get('preset')).toBe('nord');
    expect(parsedImgUrl.searchParams.get('bg')).toBe('dot-matrix');
    expect(parsedImgUrl.searchParams.get('tagline')).toBe('Custom CLI (Zero Config) card');
    expect(parsedImgUrl.searchParams.get('command')).toBe('bunx gitframe@latest');
    expect(parsedImgUrl.searchParams.get('forks')).toBe('false');
    expect(directImageUrl).toContain('%28Zero+Config%29');

    // Fetch exact generated README PNG URL to verify it renders 200 image/png without errors
    const renderedPngRes = await page.request.get(parsedImgUrl.pathname + parsedImgUrl.search);
    expect(renderedPngRes.status()).toBe(200);
    expect(renderedPngRes.headers()['content-type']).toContain('image/png');
    const renderedPng = await renderedPngRes.body();
    expect(renderedPng.subarray(0, 4)).toEqual(Buffer.from([0x89, 0x50, 0x4e, 0x47]));

    // 5. Follow the generated Studio link from the README snippet and confirm state is restored
    const readmeSnippet = await page.locator('pre').first().textContent();
    const hrefMatch = readmeSnippet?.match(/href="([^"]+)"/);
    expect(hrefMatch?.[1]).toBeTruthy();

    const shareUrl = new URL(hrefMatch![1]);
    await page.goto(shareUrl.pathname + shareUrl.search);

    // Wait for React Suspense streaming swap to remove the fallback StudioLayout
    await expect(page.locator('#card-tagline-input')).toHaveCount(1);
    await expect(page.getByTestId('studio-card-stage')).toContainText('Custom CLI (Zero Config)');
    await expect(page.getByTestId('studio-card-stage')).toContainText('bunx gitframe@latest');
    await expect(page.locator('#card-tagline-input')).toHaveValue('Custom CLI (Zero Config) card');
    await expect(page.locator('#card-install-input')).toHaveValue('bunx gitframe@latest');
    await expect(page.locator('[data-layer-key="forks"]')).toHaveAttribute(
      'data-layer-status',
      'hidden'
    );
  });
});
