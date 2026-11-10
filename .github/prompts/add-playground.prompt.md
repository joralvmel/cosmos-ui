---
name: add-playground
description: 'Adds or extends an interactive playground for a component in the docs, driven by its contract.'
argument-hint: 'Component name'
agent: agent
---

Act as the `docs-writer` agent ([definition](../agents/docs-writer.agent.md)) and follow the skill
[add-playground](../skills/add-playground/SKILL.md) step by step, together with [AGENTS.md](../../AGENTS.md).

- Component name: ${input:arg1}
