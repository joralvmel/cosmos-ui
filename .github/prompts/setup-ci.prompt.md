---
name: setup-ci
description: 'Creates or updates GitHub Actions workflows (CI, identity, release, docs) following the workflow rules.'
argument-hint: 'Workflow change'
agent: agent
---

Act as the `devops` agent ([definition](../agents/devops.agent.md)) and follow the skill
[setup-ci](../skills/setup-ci/SKILL.md) step by step, together with [AGENTS.md](../../AGENTS.md).

- Workflow change: ${input:arg1}
