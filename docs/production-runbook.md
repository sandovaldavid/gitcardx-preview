# Production runbook

This document covers the steps that live outside the repository. The release workflow cannot make
them for you.

## 1. Required GitHub configuration

Create a `production` environment with required reviewers, then add these secrets to it:

| Secret                 | Purpose                                                                |
| ---------------------- | ---------------------------------------------------------------------- |
| `VERCEL_TOKEN`         | Vercel CLI authentication for prebuilt production deployments          |
| `VERCEL_ORG_ID`        | Vercel organization identifier                                         |
| `VERCEL_PROJECT_ID`    | Vercel project identifier                                              |
| `RELEASE_PLEASE_TOKEN` | PAT or GitHub App token that can create releases and trigger workflows |

`RELEASE_PLEASE_TOKEN` must not be the default `GITHUB_TOKEN`: GitHub suppresses workflow runs for
events created by that token, so `release: published` would never start `deploy-production.yml`.
A fine-grained PAT needs `contents: write`, `issues: write`, and `pull-requests: write` on this
repository. A GitHub App token is preferred.

Add a repository variable `PRODUCTION_URL` (for example `https://gitframe.dev`) so the deploy
workflow can run its post-deploy smoke test.

## 2. Vercel project configuration

Set these environment variables for Production:

| Variable              | Value                                                             |
| --------------------- | ----------------------------------------------------------------- |
| `GITHUB_TOKEN`        | Fine-grained token restricted to **public repositories only**     |
| `NEXT_PUBLIC_APP_URL` | The verified canonical origin, for example `https://gitframe.dev` |

Do not give the production token private-repository access. The application rejects private
repository metadata in code, and the token is the second line of defense.

Attach the canonical domain to the Vercel project (apex and `www`), wait for TLS, then verify:

```bash
curl -fsS https://<domain>/ > /dev/null
curl -fsS https://<domain>/studio > /dev/null
curl -fsS https://<domain>/api/card/facebook/react.png -o /tmp/card.png
head -c 8 /tmp/card.png | od -An -tx1
```

The last command must print `89 50 4e 47 0d 0a 1a 0a` (PNG magic bytes).

## 3. Abuse and cost controls

Configure Vercel Firewall (or the equivalent platform WAF) before announcing the launch:

- `/api/card/render`: strict per-IP limit (for example 10 requests/minute).
- `/api/github/*`: per-IP limit (for example 60 requests/minute).
- `/api/card/*`: high threshold for crawler traffic; keep CDN caching enabled.
- Enable Spend Management and budget alerts.
- Keep the function duration limit at or below the route's `maxDuration`.

The in-code limiter is per-instance defense in depth. It is not a substitute for a distributed
WAF/rate limit.

## 4. Branch protection

Protect `main` and require:

- a pull request before merging;
- the `Verify` check;
- no force pushes, no branch deletion;
- at least one approval (CODEOWNERS is configured).

Do this after the release PR can run its checks; an approval-required automation run must be
approved once so `Verify` can report.

## 5. First release

1. Confirm the release PR's generated `CHANGELOG.md` passes `format:check` (it is in
   `.prettierignore`).
2. Merge the release PR.
3. Confirm the `Release` workflow creates the GitHub Release.
4. Confirm `Deploy Production` starts from the release event, not only from manual dispatch.
5. Confirm the post-deploy smoke test passes.
6. Remove `"release-as": "0.1.0"` from `release-please-config.json` after the first release so the
   next release is computed from Conventional Commits.

## 6. Rollback

Use Vercel's previous-deployment rollback for the project, then re-run the smoke test. If the
release itself is wrong, revert the release commit on `main` with a normal revert PR; do not
force-push `main`.
