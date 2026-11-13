---
name: use-reference
description: 'Use another project read-only: copy its palette into a Cosmos theme, imitate one behavior or style in a Cosmos component, or plan replacing an app''s components with Cosmos.'
argument-hint: 'Reference folders or links, mode (palette, component or replacement plan) and target'
agent: agent
---

Follow [use-reference](../skills/use-reference/SKILL.md) and [AGENTS.md](../../AGENTS.md).

- Reference and inspection permission: ${input:arg1}
- Mode and target (theme name, one component and the aspect to imitate, or the app): ${input:arg2}
- Analysis only (default), or implement after explicit scope approval: ${input:arg3}

Keep sources read-only and their identity out of tracked output. Never create components in batch.
Present findings before design/API questions. Approved work ends with a local commit and pause.
