---
name: upgrade-stack
description: 'Use when upgrading the pinned stack or a major dependency (TypeScript, React, Angular, Expo/React Native, Lit, Vitest, Astro...), fixing a vulnerability that needs more than a Dependabot patch, or acting on the monthly dependency report. Researches compatibility and migration guides, asks for approval, upgrades with npm, validates every platform and commits locally.'
---

# upgrade-stack

Main agent: `devops` with `researcher`, `architect` and the affected platform experts. Read
`AGENTS.md` (rule 7, pinned toolchain) and the [component workflow](../../../docs/conventions/component-workflow.md).

Dependabot handles minor/patch updates; this skill is for everything that needs a decision.

## Inputs

- What to upgrade (package, group or target version), or the dependency report / security issue
- Constraints: deadline, platforms that matter first, whether a breaking release is acceptable

## Steps

1. `start-work` (`chore/deps-<name>`). Run `npm run deps:outdated` and `npm run deps:audit` to see
   the current state, and read the open dependency/security issues.
2. Research with `researcher`: release notes, migration guides and the compatibility matrix
   (Angular and TypeScript, Expo SDK with React Native and React, `react-native-svg` for the Expo SDK,
   Node.js engines). Identify consumer impact: changed peer ranges, removed APIs, new minimums.
3. Present the plan: versions, packages touched, breaking changes for Cosmos and for consumers,
   semver of each Cosmos release, risks and rollback. **STOP for explicit user approval before
   changing manifests.**
4. Upgrade with npm, never by hand-editing the lockfile: `npm install <pkg>@<version> -w <workspace>`
   (or `npx expo install --fix` in the native demo). Keep one coherent stack per step.
5. Apply the migration in code. Update the pinned versions in `AGENTS.md`,
   `.github/copilot-instructions.md` and the affected `.github/instructions/*.md`, and the
   `.github/dependabot.yml` groups/ignores (`tools/deps/dependency-changes.mjs` mirrors the
   `pinned-stack` group; a test keeps them equal).
6. Validate: `npm ci && npx biome ci . && npx turbo run typecheck test build`, `npm run check-packs`,
   the docs site and the native demo on web (and a device when available). Run
   `node tools/deps/dependency-changes.mjs pr --base origin/develop` to see the release impact.
7. Add changesets: `patch` for compatible runtime updates, `minor`/`major` when peer ranges or
   minimum versions change (with migration notes for consumers). Update the installation docs when
   requirements change. Run `finish-work` for a local review commit and pause without push or PR.

## Files

- `package.json` / `package-lock.json` of the affected workspaces (through npm)
- Migrated source, pinned-version references, `.github/dependabot.yml`, changesets, docs

## Checklist

- [ ] Compatibility and migration guides researched; plan approved
- [ ] Upgraded with npm; lockfile consistent (`npm ci` passes)
- [ ] Pinned versions and Dependabot rules updated together
- [ ] Every platform validated; unavailable checks reported
- [ ] Changesets with consumer migration notes; installation docs updated if needed
- [ ] Local review commit; no unapproved push or PR

## Done

The checklist is complete and `npm ci && npx biome ci . && npx turbo run typecheck test build`
passes. Report the versions, consumer impact, evidence and the local review SHA.
