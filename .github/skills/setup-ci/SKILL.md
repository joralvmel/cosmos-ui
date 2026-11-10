---
name: setup-ci
description: 'Creates or updates GitHub Actions workflows (CI, identity, release, docs) following the workflow rules.'
---

# setup-ci

Main agent: `devops`. Read `AGENTS.md` first.

## Inputs

- Workflow change

## Steps

1. Edit `.github/workflows/*.yml` following `.github/instructions/workflows.instructions.md`.
2. Mirror local validation commands; keep permissions minimal.
3. Document new secrets or variables in `AGENTS.md`.

## Files

- `.github/workflows/**`

## Checklist

- [ ] Least privilege
- [ ] No untrusted checkout in privileged events

## Done

The checklist is complete and `npx biome ci . && npx turbo run typecheck test build` passes (or the filtered equivalent for the touched packages).
