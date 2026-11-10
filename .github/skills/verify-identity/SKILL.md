---
name: verify-identity
description: 'Checks the Git and GitHub identity before a commit or push. Enforces .local/git-identity.json when it exists; otherwise reports the current identity and asks for confirmation.'
---

# verify-identity

Main agent: `github-ops`. Read `AGENTS.md` first.

## Inputs

- None

## Steps

1. `git config core.hooksPath` must be `.githooks` (run `npm install` or `node tools/git/install-hooks.mjs`).
2. If `.local/git-identity.json` exists (`{ "name", "email", "githubLogin" }`): `git config user.name` and `git config user.email` must match it (`node tools/git/check-identity.mjs` exits 0), `gh api user --jq .login` must equal `githubLogin` (otherwise stop and suggest `gh auth switch --user <githubLogin>`), and `git remote get-url origin` must point to the expected repository. Stop on any mismatch.
3. If the file does not exist: print `git config user.name`, `git config user.email`, `gh api user --jq .login` (when `gh` is installed) and `git remote get-url origin`, and ask the user to confirm before committing or pushing.
4. Never print tokens or credentials; never change global Git configuration on behalf of the user.

## Files

- None (reads `.local/git-identity.json` when present)

## Checklist

- [ ] Hooks path verified
- [ ] Identity matches the local file, or the user confirmed it
- [ ] GitHub account and remote verified before push

## Done

The checklist is complete and `npx biome ci . && npx turbo run typecheck test build` passes (or the filtered equivalent for the touched packages).
