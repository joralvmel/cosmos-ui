---
name: open-pr
description: 'Opens a pull request against develop with the template, after verifying identity and pushing the branch.'
---

# open-pr

Main agent: `github-ops`. Read `AGENTS.md` first.

## Inputs

- Branch
- Summary

## Steps

1. Run `verify-identity` (including the `gh` account and remote).
2. Push the branch (`git push -u origin <branch>`); never force-push without confirmation.
3. Open the PR against `develop` with `.github/pull_request_template.md`, linking issues and listing validation.

## Files

- Pull request

## Checklist

- [ ] Template complete
- [ ] CI started

## Done

The checklist is complete and `npx biome ci . && npx turbo run typecheck test build` passes (or the filtered equivalent for the touched packages).
