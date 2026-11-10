---
applyTo: '.github/workflows/**'
---

# GitHub Actions

- Top-level `permissions: contents: read`; grant more only to the job that needs it.
- Use `actions/checkout@v7` and `actions/setup-node@v7` with `node-version-file: .nvmrc` and npm cache.
- Install with `npm ci`. Run the same commands as local validation (`npx biome ci .`,
  `node tools/check-terms.mjs`, `npx turbo run typecheck test build`, `npm run check-packs`).
- Secrets are exposed only to the step that needs them (`COSMOS_BLOCKED_TERMS`). Pass event data such
  as PR titles through `env:`, never interpolate them inside `run:` scripts.
- Publishing (`release.yml`, environment `npm`, OIDC trusted publishing, no npm token) and Pages
  deployment (`docs.yml`) stay behind `COSMOS_PUBLISH_ENABLED` / `COSMOS_DOCS_ENABLED`.
- Job names used as required checks (`requiredChecks` in `tools/github/setup-repo.mjs`) must not be
  renamed without updating that list (a test checks it).
- `pull_request_target` only for workflows that never check out or run pull request code (labeler).
