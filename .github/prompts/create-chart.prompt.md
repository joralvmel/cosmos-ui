---
name: create-chart
description: 'Creates a chart: pure layout in charts-core, SVG rendering on the web, React Native rendering, accessibility and docs.'
argument-hint: 'Chart name (e.g. `bar-chart`)'
agent: agent
---

Act as the `chart-builder` agent ([definition](../agents/chart-builder.agent.md)) and follow the skill
[create-chart](../skills/create-chart/SKILL.md) step by step, together with [AGENTS.md](../../AGENTS.md).

- Chart name (e.g. `bar-chart`): ${input:arg1}
- Data shape and interactions: ${input:arg2}
