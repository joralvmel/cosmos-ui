# AGENTS.md — generator

- `npm run generate -- <component|native|chart|theme> <kebab-name> [--dry-run] [--seed <color>]`.
- `src/plan.mjs` lists file operations; `src/apply.mjs` validates everything before writing (no
  partial writes). Templates live in `src/templates/` and mark open work with `TODO(generator)`.
- Insertions rely on anchors in real files (`} as const;` in core, `] as const;` in Angular and the
  native demo, `builtInThemes` in tokens); the tests copy those files to check the anchors still exist.
- Keep templates in sync with the conventions in `.github/instructions/`.
