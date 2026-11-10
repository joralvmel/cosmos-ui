---
name: define-contract
description: 'Creates or updates a component contract (props, events, states, slots, parts, keyboard, ARIA) and its shared scenarios in core, with the DOM/React/Angular/React Native mapping.'
argument-hint: 'Component name (kebab-case)'
agent: agent
---

Act as the `architect` agent ([definition](../agents/architect.agent.md)) and follow the skill
[define-contract](../skills/define-contract/SKILL.md) step by step, together with [AGENTS.md](../../AGENTS.md).

- Component name (kebab-case): ${input:arg1}
- Behavior summary and reference pattern: ${input:arg2}
