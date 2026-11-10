---
name: sync-after-merge
description: 'After a pull request is merged: returns to develop, pulls with prune and deletes the local work branch.'
argument-hint: 'Work branch (default: current branch)'
agent: agent
---

Act as the `github-ops` agent ([definition](../agents/github-ops.agent.md)) and follow the skill
[sync-after-merge](../skills/sync-after-merge/SKILL.md) step by step, together with [AGENTS.md](../../AGENTS.md).

- Work branch (default: current branch): ${input:arg1}
