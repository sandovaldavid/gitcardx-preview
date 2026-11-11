# Gitframe

<div align="center">

[![Gitframe](https://gitframe.dev/api/card/sandovaldavid/gitframe.png)](https://gitframe.dev)

**Instant, high-impact GitHub Social Preview cards (`1280×640px`) & dynamic README heroes in 5 seconds.**

[![CI](https://github.com/sandovaldavid/gitframe/actions/workflows/ci.yml/badge.svg)](https://github.com/sandovaldavid/gitframe/actions/workflows/ci.yml)
[![License: FSL-1.1-MIT](https://img.shields.io/badge/License-FSL--1.1--MIT-blue.svg)](LICENSE.md)
[![Release Please](https://img.shields.io/badge/Release-Please-orange.svg)](https://github.com/googleapis/release-please)
[![Next.js 16](https://img.shields.io/badge/Next.js-16.4-black)](https://nextjs.org)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-v4-38bdf8)](https://tailwindcss.com)

[**Launch Studio**](https://gitframe.dev/studio) · [**Explore Templates**](https://gitframe.dev/#templates) · [**Dynamic README API**](#dynamic-readme--open-graph-api)

</div>

---

## Why Gitframe?

Default GitHub social previews are dull grey boxes that get cropped and ignored on social feeds. **Gitframe** turns overlooked repository links into iconic, high-contrast visual assets with **zero mandatory sign-up**, **zero database overhead**, and **100% free stateless execution**.

- **⚡ Instant 5-Second Generation**: Prepend `gitframe.dev/` to any GitHub repository URL (`gitframe.dev/owner/repo`) to open the studio with all metadata preloaded via Next.js 16 Partial Prerendering.
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
gitframe.dev/{owner}/{repo}
```

_Example: Replace `github.com/shadcn/ui` with `gitframe.dev/shadcn/ui`._

---

## Dynamic README & Open Graph API

Embed an auto-updating live card in your `README.md` or website:

### Standard Markdown

```markdown
[![Social Preview](https://gitframe.dev/api/card/{owner}/{repo}.png)](https://gitframe.dev/{owner}/{repo})
```

### Adaptive Dark / Light `<picture>`

```html
<picture>
  <source
    media="(prefers-color-scheme: dark)"
    srcset="https://gitframe.dev/api/card/{owner}/{repo}.png?theme=dark"
  />
  <source
    media="(prefers-color-scheme: light)"
    srcset="https://gitframe.dev/api/card/{owner}/{repo}.png?theme=light"
  />
  <img alt="Social Card Preview" src="https://gitframe.dev/api/card/{owner}/{repo}.png" />
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
- **Card Rendering**: [Satori](https://github.com/vercel/satori) + [@resvg/resvg-js](https://github.com/thx/resvg-js)
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
git clone git@github.com:sandovaldavid/gitframe.git
cd gitframe

# Install dependencies
bun install

# Start development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment variables

Copy `.env.example` to `.env.local`. `GITHUB_TOKEN` is optional locally but required in production
for a reliable GitHub API quota; use a fine-grained token restricted to **public repositories only**.
`NEXT_PUBLIC_APP_URL` sets the canonical origin used by metadata, sitemap and robots.

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
- **Automated Releases**: [Google Release Please](https://github.com/googleapis/release-please) detects Conventional Commits, creates automated release PRs, generates `CHANGELOG.md`, and tags semver versions.
- **Zero-Downtime Vercel CD**: When a GitHub Release is published on `main`, the `deploy-production.yml` workflow verifies all quality checks (`format`, `lint`, `typecheck`, `test`, `build`) before triggering production deployment on Vercel. See [docs/production-runbook.md](docs/production-runbook.md) for the required secrets, domain, branch protection and rollback steps.

---

## Acknowledgements & Open Source Credits

Gitframe is powered by the open-source community:

- **[Vercel Satori](https://github.com/vercel/satori)**: Converts React JSX and CSS Flexbox layouts into vector SVG elements with the Yoga layout engine.
- **[resvg-js](https://github.com/thx/resvg-js)** ([thx](https://github.com/thx)) & **[resvg](https://github.com/linebender/resvg)** (created by [RazrFalcon](https://github.com/RazrFalcon), maintained by [Linebender](https://github.com/linebender)): High-performance Rust-based SVG rasterizer that generates pixel-perfect PNG previews without a headless browser.
- **[Colord](https://github.com/omgovich/colord)**: High-performance color manipulation, gamut conversions, and WCAG AA/AAA contrast ratios.
- **Open Source Typography**:
  - [Inter](https://rsms.me/inter/) by Rasmus Andersson
  - [JetBrains Mono](https://www.jetbrains.com/lp/mono/) by JetBrains
  - [Space Grotesk](https://floriankarsten.github.io/space-grotesk/) by Florian Karsten
  - [Plus Jakarta Sans](https://tokotype.github.io/plusjakartasans/) by Gumpita Rahayu (Tokotype)
  - [Geist](https://vercel.com/font) by Vercel
  - [Fira Code](https://github.com/tonsky/FiraCode) by Nikita Prokopov
- **Icons & Badges**: [SVGL](https://svgl.app) by Pheralb, [Lucide](https://lucide.dev), and [Simple Icons](https://simpleicons.org).

---

## License

[FSL-1.1-MIT](LICENSE.md) © [David Sandoval](https://github.com/sandovaldavid)
