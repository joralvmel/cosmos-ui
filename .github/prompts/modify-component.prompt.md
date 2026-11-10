---
name: modify-component
description: 'Changes the API or behavior of an existing component while keeping parity: contract → Lit → wrappers → React Native → scenarios → docs → llms.md → changeset.'
argument-hint: 'Component name'
agent: agent
---

Act as the `component-builder` agent ([definition](../agents/component-builder.agent.md)) and follow the skill
[modify-component](../skills/modify-component/SKILL.md) step by step, together with [AGENTS.md](../../AGENTS.md).

- Component name: ${input:arg1}
- Change requested: ${input:arg2}
