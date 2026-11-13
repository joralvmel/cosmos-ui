# Copilot instructions

Cosmos UI: themeable design system. One contract per component (`packages/core/src/specs`),
implemented as Web Components (Lit), React and Angular wrappers and React Native components. Packages are
published as `@joralvmel/cosmos-*`. Read [`AGENTS.md`](../AGENTS.md) first and the nearest package
`AGENTS.md`.

## Stack (pinned)

Node.js 24 · npm 11 workspaces · Turborepo 2 · TypeScript 6.0.x (Angular 22 requires `<6.1`) · Lit 3 ·
React 19.3 · Angular 22 · React Native 0.88 + Expo SDK 58 · Tailwind CSS 4 · Vitest 5 (happy-dom) ·
Biome 2 · Astro 7 + Starlight · Changesets · culori.

## Commands (repository root)

| Purpose              | Command                                                                          |
| -------------------- | -------------------------------------------------------------------------------- |
| Install              | `npm ci`                                                                         |
| CI checks            | `npx biome ci . && npx turbo run typecheck test build`                           |
| One package + deps   | `npx turbo run typecheck test build --filter=@joralvmel/cosmos-<pkg>...`         |
| Lint + blocked terms | `npm run lint` / `npm run lint:fix`                                              |
| Generate             | `npm run generate -- <component\|native\|chart\|theme> <kebab-name> [--dry-run]` |
| Changeset            | `npm run changeset`                                                              |
| Docs                 | `npm run docs`                                                                   |

## Conventions enforced by CI and reviewers

- Contract first; drift tests compare every platform with `propNames()`/`eventNames()` of the contract.
- Events: DOM `cosm-*` `CustomEvent` (bubbles, composed) → React `onX` → Angular `(x)` /
  `(valueChange)` → React Native `onX(detail)` ([ADR 0003](../docs/adr/0003-state-ownership-and-events.md)).
- Lit: `static override properties` + `declare` fields initialized in the constructor (no decorators),
  register with `define()`, JSDoc `@tag/@slot/@csspart/@fires/@cssprop`, `delegatesFocus` for
  interactive elements, `:focus-visible` outline, `prefers-reduced-motion`.
- Styles only with `var(--cosm-*, fallback)`; component hooks `--cosm-<component>-*` and `::part`.
- Biome style: 2 spaces, single quotes, semicolons, ES5 trailing commas, width 100, LF; ESM; relative
  imports end in `.js`.
- Every publishable change has tests and a changeset; new components also need wrappers, a native
  component, docs (EN + ES) and `llms.md`.
- Never render untrusted HTML or build class names from input ([SECURITY.md](../SECURITY.md)).
- Commits with your own identity (personal checks are local, see `.local/git-identity.json`);
  Conventional Commits; no `--no-verify`.
- Follow [the component workflow](../docs/conventions/component-workflow.md): research precedes
  informed feature/design questions and explicit scope approval, before generation or contract edits.
- Automatically validate and commit implementation tasks locally, then stop for user review.
  No push or PR until the user accepts that exact HEAD. Requested revisions create new commits and
  require another pause; do not amend by default. Scope approval is not permission to publish.
- Report real validation evidence and unavailable checks honestly: mocks, builds and React Native
  Web do not establish native-device behavior.
