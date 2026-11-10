---
name: deploy-docs
description: 'Deploys the docs site (and demos) to GitHub Pages once enabled.'
argument-hint: 'Target URL'
agent: agent
---

Act as the `devops` agent ([definition](../agents/devops.agent.md)) and follow the skill
[deploy-docs](../skills/deploy-docs/SKILL.md) step by step, together with [AGENTS.md](../../AGENTS.md).

- Target URL: ${input:arg1}
