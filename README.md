# GitCardX Preview

<div align="center">

[![GitCardX Preview](https://gitcardx.dev/api/card/sandovaldavid/gitcardx-preview.png)](https://gitcardx.dev)

**Instant, high-impact GitHub Social Preview cards (`1280×640px`) & dynamic README heroes in 5 seconds.**

[![CI](https://github.com/sandovaldavid/gitcardx-preview/actions/workflows/ci.yml/badge.svg)](https://github.com/sandovaldavid/gitcardx-preview/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Release Please](https://img.shields.io/badge/Release-Please-orange.svg)](https://github.com/googleapis/release-please)
[![Next.js 16](https://img.shields.io/badge/Next.js-16.4-black)](https://nextjs.org)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-v4-38bdf8)](https://tailwindcss.com)

[**Launch Studio**](https://gitcardx.dev/studio) · [**Explore Templates**](https://gitcardx.dev/#templates) · [**Dynamic README API**](#dynamic-readme--open-graph-api)

</div>

---

## Why GitCardX?

Default GitHub social previews are dull grey boxes that get cropped and ignored on social feeds. **GitCardX Preview** turns overlooked repository links into iconic, high-contrast visual assets with **zero mandatory sign-up**, **zero database overhead**, and **100% free stateless execution**.

- **⚡ Instant 5-Second Generation**: Prepend `gitcardx.dev/` to any GitHub repository URL (`gitcardx.dev/owner/repo`) to open the studio with all metadata preloaded via Next.js 16 Partial Prerendering.
- **🎨 8 Satori-Safe Archetypes**: Purpose-built templates engineered for Vercel Satori and `@resvg/resvg-js` with guaranteed pixel-identical rendering across browsers and feed crawlers.
- **🌐 Photo-Realistic Social Simulator**: Test how your card looks inside real feeds on **X (Twitter)**, **LinkedIn**, **Discord**, **Slack**, and **GitHub Feed** in dark and light modes.
- **🛡️ Local Brand Kit Vault (IndexedDB)**: Store up to 10 custom brand palettes, typography choices, and background presets locally in your browser. Zero server-side tracking.
- **🖼️ High-DPI & Dual Export**: Download standard `1280×640px`, retina `@2x 2560×1280px`, and vector `SVG`, or embed our dynamic CDN-cached image endpoint.

---

## 8 Purpose-Built Archetypes

| Archetype               | ID                  | Best For                                                |
| ----------------------- | ------------------- | ------------------------------------------------------- |
| **Linear Minimal**      | `linear-minimal`    | Modern SaaS, web frameworks, developer tools            |
| **CLI / Terminal Hero** | `cli-terminal`      | CLI tools, package managers, terminal utilities         |
| **OSS Credibility**     | `oss-credibility`   | High-traction open-source projects, community libraries |
| **SDK & Package Split** | `sdk-package`       | Client SDKs, REST/GraphQL API wrappers                  |
| **Aurora Mesh Glass**   | `aurora-mesh`       | AI platforms, design systems, next-gen startups         |
| **Blueprint Grid**      | `blueprint-grid`    | Databases, cloud infrastructure, distributed systems    |
| **Release Spotlight**   | `release-spotlight` | Major version launches, changelogs, milestones          |
| **Creator Signature**   | `creator-signature` | Solo founders, indie hackers, personal repositories     |

---

## Developer URL Shortcut

Jump straight into the studio from any browser tab:

```text
gitcardx.dev/{owner}/{repo}
```

_Example: Replace `github.com/shadcn/ui` with `gitcardx.dev/shadcn/ui`._

---

## Dynamic README & Open Graph API

Embed an auto-updating live card in your `README.md` or website:

### Standard Markdown

```markdown
[![Social Preview](https://gitcardx.dev/api/card/{owner}/{repo}.png)](https://gitcardx.dev/{owner}/{repo})
```

### Adaptive Dark / Light `<picture>`

```html
<picture>
  <source
    media="(prefers-color-scheme: dark)"
    srcset="https://gitcardx.dev/api/card/{owner}/{repo}.png?theme=dark"
  />
  <source
    media="(prefers-color-scheme: light)"
    srcset="https://gitcardx.dev/api/card/{owner}/{repo}.png?theme=light"
  />
  <img alt="Social Card Preview" src="https://gitcardx.dev/api/card/{owner}/{repo}.png" />
</picture>
```

### Supported Query Parameters

| Parameter  | Type                | Default              | Description                                                                                                        |
| ---------- | ------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `template` | `TemplateId`        | `linear-minimal`     | One of the 8 archetypes                                                                                            |
| `theme`    | `dark` \| `light`   | `dark`               | Color theme                                                                                                        |
| `bg`       | `BackgroundPattern` | `architectural-grid` | Procedural pattern (`aurora-mesh`, `dot-matrix`, `radial-spotlight`, `topographic-contours`, `architectural-grid`) |
| `stars`    | `boolean`           | `true`               | Show or hide star metric pill                                                                                      |
| `forks`    | `boolean`           | `true`               | Show or hide fork metric pill                                                                                      |
| `release`  | `boolean`           | `true`               | Show or hide latest release badge                                                                                  |
| `cli`      | `string`            | _(auto)_             | Custom CLI installation command                                                                                    |

---

## Tech Stack & Architecture

- **Runtime & Package Manager**: [Bun](https://bun.sh)
- **Framework**: [Next.js 16 (App Router)](https://nextjs.org) with Partial Prerendering & Cache Components
- **Library**: [React 19](https://react.dev)
- **Language**: [TypeScript](https://www.typescriptlang.org) (Strict mode)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com) + Lucide Icons + Simple Icons
- **Card Rendering**: [Satori](https://github.com/vercel/satori) + [@resvg/resvg-js](https://github.com/yisibl/resvg-js)
- **Color Engine**: [Colord](https://github.com/omgovich/colord) with WCAG AA/AAA compliance checks
- **State & Storage**: [Zustand](https://zustand.docs.pmnd.rs) with 30-step undo/redo + [IndexedDB](https://github.com/jakearchibald/idb-keyval)
- **Testing**: [Vitest](https://vitest.dev) (Unit & Satori renderer) + [Playwright](https://playwright.dev) (E2E)
- **CI/CD & Releases**: GitHub Actions + [Release Please](https://github.com/googleapis/release-please) + [Vercel](https://vercel.com)

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) (v1.2+)

### Local Development

```bash
# Clone the repository
git clone git@github.com:sandovaldavid/gitcardx-preview.git
cd gitcardx-preview

# Install dependencies
bun install

# Start development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Deterministic Quality Commands

```bash
# Code formatting check
bun run format:check

# TypeScript strict typecheck
bun run typecheck

# ESLint analysis
bun run lint

# Vitest unit & engine tests
bun run test

# Production Turbopack build
bun run build

# Playwright end-to-end tests
bun run test:e2e
```

---

## Deployment Architecture

- **Single Branch (`main`)**: The `main` branch serves as the integration environment.
- **Automated Releases**: [Google Release Please](https://github.com/googleapis/release-please) detects Conventional Commits, creates automated release PRs, generates `CHANGELOG.md`, and tags semver versions (`v1.x.x`).
- **Zero-Downtime Vercel CD**: When a GitHub Release is published on `main`, the `deploy-production.yml` workflow verifies all quality checks (`format`, `lint`, `typecheck`, `test`, `build`) before triggering production deployment on Vercel.

---

## License

MIT © [David Sandoval](https://github.com/sandovaldavid)
