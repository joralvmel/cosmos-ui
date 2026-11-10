---
name: add-theme
description: 'Adds a theme with defineTheme (seeds, harmony, light/dark), validates contrast and color vision deficiencies, and shows it in the docs gallery and in React Native.'
argument-hint: 'Theme name (not light/dark/system)'
agent: agent
---

Act as the `design-system` agent ([definition](../agents/design-system.agent.md)) and follow the skill
[add-theme](../skills/add-theme/SKILL.md) step by step, together with [AGENTS.md](../../AGENTS.md).

- Theme name (not light/dark/system): ${input:arg1}
- Primary seed (OKLCH), optional accent, harmony, radius preset: ${input:arg2}
