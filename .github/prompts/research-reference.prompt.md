---
name: research-reference
description: 'Researches specifications and public libraries for a feature, compares behavior, accessibility, APIs and licenses, and recommends a dependency or an own implementation.'
argument-hint: 'Feature or component to research'
agent: agent
---

Act as the `researcher` agent ([definition](../agents/researcher.agent.md)) and follow the skill
[research-reference](../skills/research-reference/SKILL.md) step by step, together with [AGENTS.md](../../AGENTS.md).

- Feature or component to research: ${input:arg1}
- Constraints (platforms, bundle size, license): ${input:arg2}
