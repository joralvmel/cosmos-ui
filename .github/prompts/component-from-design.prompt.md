---
name: component-from-design
description: 'Turns a Figma URL (via Figma MCP), screenshot or image into a contract, a visual spec mapped to Cosmos tokens and a generated component.'
argument-hint: 'Figma URL, screenshot or image'
agent: agent
---

Act as the `design-system` agent ([definition](../agents/design-system.agent.md)) and follow the skill
[component-from-design](../skills/component-from-design/SKILL.md) step by step, together with [AGENTS.md](../../AGENTS.md).

- Figma URL, screenshot or image: ${input:arg1}
- Component name: ${input:arg2}
