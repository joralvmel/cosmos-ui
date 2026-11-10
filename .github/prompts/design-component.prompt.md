---
name: design-component
description: 'Writes the visual spec of a component: anatomy, sizes, variants, states, tokens used, responsive behavior and light/dark notes, then styles it with tokens only.'
argument-hint: 'Component name'
agent: agent
---

Act as the `design-system` agent ([definition](../agents/design-system.agent.md)) and follow the skill
[design-component](../skills/design-component/SKILL.md) step by step, together with [AGENTS.md](../../AGENTS.md).

- Component name: ${input:arg1}
- Contract (props that affect visuals): ${input:arg2}
