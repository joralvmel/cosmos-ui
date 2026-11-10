---
name: sync-icons
description: 'Updates the Lucide version, regenerates the icon definitions and catalog, and refreshes the license notice.'
argument-hint: 'Target Lucide version'
agent: agent
---

Act as the `component-builder` agent ([definition](../agents/component-builder.agent.md)) and follow the skill
[sync-icons](../skills/sync-icons/SKILL.md) step by step, together with [AGENTS.md](../../AGENTS.md).

- Target Lucide version: ${input:arg1}
