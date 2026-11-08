# GitCardX Preview

> Give your GitHub repositories real visual identity in seconds. Beautiful social previews (`1280×640`), dynamic README hero banners, and cohesive brand kits.

Official Platform: [https://gitcardx.dev](https://gitcardx.dev)

---

## Overview

**GitCardX Preview** is a modern DevTool designed to solve developer portfolio and repository presentation:
- **Instant Social Previews (`1280×640px` / `2:1`)**: Generate crisp, high-impact preview cards for your GitHub repositories in seconds.
- **Dynamic README Hero Banners (`/api/card/[owner]/[repo].svg`)**: Keep stars, latest releases, and tech stack badges automatically synchronized in your project `README.md`.
- **Social Simulator**: Real-time live previews inside simulated X (Twitter), LinkedIn, Discord, Slack, and GitHub feed layouts.
- **Brand Kits**: Maintain visual consistency across your pinned repositories and open-source portfolio.

---

## Tech Stack

- **Runtime & Package Manager**: [Bun](https://bun.sh)
- **Framework**: [Next.js (App Router)](https://nextjs.org) + [React 19](https://react.dev)
- **Language**: [TypeScript](https://www.typescriptlang.org) (strict)
- **Styling & UI**: [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) (Radix Primitives)
- **Card Generation Engine**: [Satori](https://github.com/vercel/satori) + [@resvg/resvg-js](https://github.com/yisibl/resvg-js)
- **Testing**: [Vitest](https://vitest.dev) + [Playwright](https://playwright.dev)

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) (v1.2+)

### Development

```bash
# Clone the repository
git clone git@github.com:sandovaldavid/gitcardx-preview.git
cd gitcardx-preview

# Install dependencies
bun install

# Start development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

---

## Quality Checks

```bash
# Run typecheck
bun run typecheck

# Run unit tests
bun run test

# Run linter
bun run lint

# Build production bundle
bun run build

# Run end-to-end tests
bun run test:e2e
```

---

## License

MIT © [David Sandoval](https://sandovaldavid.com)
