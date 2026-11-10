---
name: component-from-design
description: 'Turns a Figma URL (via Figma MCP), screenshot or image into a contract, a visual spec mapped to Cosmos tokens and a generated component.'
---

# component-from-design

Main agent: `design-system`. Read `AGENTS.md` first.

## Inputs

- Figma URL, screenshot or image
- Component name

## Steps

1. Extract anatomy, variants, sizes and states from the design (Figma MCP `get_design_context`/`get_screenshot` when a URL is given).
2. Map every color, spacing, radius, shadow and font to existing Cosmos tokens; never copy raw values.
3. If no token fits, propose one through `add-token` and justify it.
4. Ask `architect` to write the contract (`define-contract`) from the extracted behavior.
5. Run `create-component` and apply the visual spec (`design-component`).

## Files

- Same as `create-component`
- `docs/design/<name>.md`

## Checklist

- [ ] No literal colors from the design
- [ ] Design states covered by contract props
- [ ] Screenshot comparison noted in the PR

## Done

The checklist is complete and `npx biome ci . && npx turbo run typecheck test build` passes (or the filtered equivalent for the touched packages).
