---
name: add-token
description: 'Adds a token to every output (CSS variables, Tailwind theme, React Native values, JSON) with tests.'
argument-hint: 'Token name and purpose'
agent: agent
---

Act as the `design-system` agent ([definition](../agents/design-system.agent.md)) and follow the skill
[add-token](../skills/add-token/SKILL.md) step by step, together with [AGENTS.md](../../AGENTS.md).

- Token name and purpose: ${input:arg1}
- Value per theme/mode or rule to derive it: ${input:arg2}
