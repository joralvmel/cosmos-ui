# AGENTS.md — generator

- `npm run generate -- <component|native|chart|theme> <kebab-name> [--dry-run] [--seed <color>]`.
- `src/plan.mjs` lists file operations; `src/apply.mjs` validates everything before writing (no
  partial writes). Templates live in `src/templates/` and mark open work with `TODO(generator)`.
- Insertions rely on anchors in real files (`} as const;` in core, `] as const;` in Angular and the
  native demo, `builtInThemes` in tokens); the tests copy those files to check the anchors still exist.
- Templates follow [`docs/conventions/component-anatomy.md`](../../docs/conventions/component-anatomy.md)
  exactly: the tests generate `chip` and `bottom-sheet` in a sandbox, run the anatomy checker
  (`tools/status/anatomy.mjs`) and compare the output with a snapshot
  (`test/__snapshots__/`). Update the snapshot with `npx vitest run -u` only for intended changes.
- Components not yet in `packages/core/src/catalog.ts` get a catalog entry; `llms.md` gets a section.
- Keep templates in sync with the conventions in `.github/instructions/`.
