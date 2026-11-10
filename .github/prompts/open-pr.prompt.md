---
name: open-pr
description: 'Opens a pull request for an existing pushed branch (develop for work branches, main only for release PRs). Prefer finish-work, which validates first.'
argument-hint: 'Branch'
agent: agent
---

Act as the `github-ops` agent ([definition](../agents/github-ops.agent.md)) and follow the skill
[open-pr](../skills/open-pr/SKILL.md) step by step, together with [AGENTS.md](../../AGENTS.md).

- Branch: ${input:arg1}
- Summary: ${input:arg2}
