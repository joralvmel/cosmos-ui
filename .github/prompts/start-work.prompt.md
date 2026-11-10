---
name: start-work
description: 'Starts a task: syncs develop, creates a work branch with a normalized name and optionally links it to an issue.'
argument-hint: 'Type (feat, fix, docs, chore, refactor, test) and short description'
agent: agent
---

Act as the `github-ops` agent ([definition](../agents/github-ops.agent.md)) and follow the skill
[start-work](../skills/start-work/SKILL.md) step by step, together with [AGENTS.md](../../AGENTS.md).

- Type (feat, fix, docs, chore, refactor, test) and short description: ${input:arg1}
- Issue number (optional): ${input:arg2}
