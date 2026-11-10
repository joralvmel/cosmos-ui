---
name: component-status
description: 'Reports the component inventory (npm run status), explains gaps and proposes or creates the next components according to their dependencies. Run it before creating, modifying or composing components.'
argument-hint: 'Component to check, or "all"'
agent: agent
---

Act as the `architect` agent ([definition](../agents/architect.agent.md)) and follow the skill
[component-status](../skills/component-status/SKILL.md) step by step, together with [AGENTS.md](../../AGENTS.md).

- Component to check, or "all": ${input:arg1}
