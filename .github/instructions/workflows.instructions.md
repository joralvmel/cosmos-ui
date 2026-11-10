---
applyTo: '.github/workflows/**'
---

# GitHub Actions

- Top-level `permissions: contents: read`; grant more only to the job that needs it.
- Use `actions/checkout@v7` and `actions/setup-node@v7` with `node-version-file: .nvmrc` and npm cache.
- Install with `npm ci`. Run the same commands as local validation (`npx biome ci .`,
  `node tools/check-terms.mjs`, `npx turbo run typecheck test build`).
- Secrets are exposed only to the step that needs them (`COSMOS_BLOCKED_TERMS`).
- Publishing (`release.yml`) and Pages (`docs.yml`) stay disabled behind repository variables until the
  pre-release checklist is complete.
- Never add `pull_request_target` with checkout of untrusted code.
