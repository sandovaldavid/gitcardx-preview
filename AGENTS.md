<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Repository operating manual for agents

`AGENTS.md` is the canonical working contract for human and AI contributors. Tool-specific instructions may add only path-specific behavior and must link back here.

## Sources of truth

- Project overview: [README.md](README.md)
- Commands and dependency versions: [package.json](package.json) and `bun.lock`
- Card schema & types: [src/core/schema.ts](src/core/schema.ts) and [src/core/types.ts](src/core/types.ts)
- Archetype templates: [src/cards/templates/](src/cards/templates/)
- Card render pipeline: [src/cards/CardRenderer.tsx](src/cards/CardRenderer.tsx) and [src/lib/satori.ts](src/lib/satori.ts)
- Studio state and inspector: [src/studio/state/useCardStore.ts](src/studio/state/useCardStore.ts) and [src/studio/components/](src/studio/components/)
- GitHub data layer: [src/lib/github.ts](src/lib/github.ts) and [src/app/api/github/repo/route.ts](src/app/api/github/repo/route.ts)
- Automated verification: `vitest.config.ts`, `playwright.config.ts`, `eslint.config.mjs`, and `.github/workflows/`

Executable source and configuration override prose when they disagree.

## Repository identity

- Repository: `sandovaldavid/gitcardx-preview`
- Purpose: Instant, high-impact GitHub Social Preview cards (1280×640px) & dynamic README banners powered by Next.js 16 (App Router + Turbopack), Tailwind CSS v4, Satori, and Resvg.
- Upstream / predecessor: `sandovaldavid/GitCardX` (legacy client-side HTML generator).

## Core constraints and layout rules

- **Satori layout constraints**:
  - Satori compiles JSX to SVG using Yoga. Only Flexbox layouts (`display: 'flex'`) are supported. `display: 'grid'` or `display: 'block'` do not exist.
  - Satori lacks browser CSS reset (`box-sizing`). Root container in all templates MUST declare `boxSizing: 'border-box'` with fixed dimensions `width: 1280, height: 640` to prevent SVG/PNG export clipping.
  - Satori templates (`src/cards/templates/*`) must use inline style objects or Satori-compatible props, never Tailwind utility class strings.
- **Typography and binary asset loading**:
  - All fonts (Inter, JetBrains Mono, Space Grotesk, Plus Jakarta Sans) must load as binary `ArrayBuffer` in [src/lib/fonts.ts](src/lib/fonts.ts).
  - External images in Satori must use data URIs or pre-fetched buffers.
- **GitHub API and circuit breaker**:
  - Unauthenticated GitHub GraphQL/REST calls are strictly rate-limited (60 req/hr unauthenticated, 5000 with token).
  - All repository metadata fetching in `src/lib/github.ts` must pass through the in-memory cache, fast throttle, and circuit breaker. Never make raw unbounded fetch calls to GitHub API from client components.
- **Safe zones and legibility**:
  - Keep primary typography and metrics within safe bounds (`80px` horizontal, `40px` vertical) to prevent feed overlay clipping on social platforms (X, LinkedIn, Discord, Slack).
  - Ensure high contrast in both dark and light modes for all social simulator card previews.

## Validation loop

Always run authoritative checks before opening a PR or completing non-trivial tasks:

1. `bun run typecheck` (`tsc --noEmit`)
2. `bun run lint` (`eslint`)
3. `bun run format:check` (`prettier --check .`)
4. `bun run test` (`vitest run`)
5. `bun run test:e2e` (`playwright test`)
6. `bun run build` (`next build`)

## Git and commit conventions

- Conventional Commits 1.0.0 with mandatory scope: `<type>(<scope>): <description>` (e.g. `feat(templates): ...`, `fix(simulator): ...`, `test(cards): ...`).
- All commits must be signed (`git commit -S`).
- Work on focused feature/fix branches; do not push unreviewed changes directly to `main`.
