---
name: write-adr
description: 'Writes an architecture decision record NNNN-title.md (context → decision → consequences).'
---

# write-adr

Main agent: `architect`. Read `AGENTS.md` first.

## Inputs

- Decision topic

## Steps

1. Take the next number in `docs/adr/` and create `NNNN-short-title.md`.
2. Sections: status, date, context, decision (with alternatives when relevant), consequences.
3. Add it to `docs/adr/README.md` and link it from `AGENTS.md` if it changes a rule.

## Files

- `docs/adr/NNNN-*.md`
- `docs/adr/README.md`

## Checklist

- [ ] Alternatives considered
- [ ] Consequences explicit

## Done

The checklist is complete and `npx biome ci . && npx turbo run typecheck test build` passes (or the filtered equivalent for the touched packages).
