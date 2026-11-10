---
name: open-pr
description: 'Opens a pull request against develop with the template, after verifying identity and pushing the branch.'
argument-hint: 'Branch'
agent: agent
---

Act as the `github-ops` agent ([definition](../agents/github-ops.agent.md)) and follow the skill
[open-pr](../skills/open-pr/SKILL.md) step by step, together with [AGENTS.md](../../AGENTS.md).

- Branch: ${input:arg1}
- Summary: ${input:arg2}
